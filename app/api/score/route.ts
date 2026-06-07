import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import type { ScoreResult } from '@/types';
import { generateMockScore } from '@/lib/mockData';

// リクエストスキーマ
const requestSchema = z.object({
  messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1),
  companyInfo: z.object({
    companyName: z.string(),
    industry: z.string(),
    businessDescription: z.string(),
    employeeSize: z.string(),
    challenges: z.string(),
    proposedService: z.string(),
    salesPhase: z.string(),
    contactRole: z.string(),
  }),
  scenario: z.object({
    customerName: z.string(),
    customerRole: z.string(),
    situation: z.string(),
    objectives: z.array(z.string()),
    keyPoints: z.array(z.string()),
    openingLine: z.string(),
  }),
});

// AIが生成する採点項目（totalScore はサーバー側で計算）
const scoreEvalSchema = z.object({
  hearingScore: z
    .number()
    .min(0)
    .max(100)
    .describe('顧客ニーズ・状況を引き出すヒアリング力（0〜100の整数）'),
  problemClarificationScore: z
    .number()
    .min(0)
    .max(100)
    .describe('課題の本質を整理・明確化する力（0〜100の整数）'),
  proposalScore: z
    .number()
    .min(0)
    .max(100)
    .describe('課題に対する提案の適切さと説得力（0〜100の整数）'),
  objectionHandlingScore: z
    .number()
    .min(0)
    .max(100)
    .describe('反論・懸念事項への対応力（0〜100の整数）'),
  nextActionScore: z
    .number()
    .min(0)
    .max(100)
    .describe('次回アクションの明確な合意形成力（0〜100の整数）'),
  goodPoints: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe('良かった点（2〜3件、会話内容に基づく具体的なフィードバック）'),
  improvements: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe('改善点（2〜3件、会話内容に基づく具体的なフィードバック）'),
  nextPhraseTip: z
    .string()
    .describe('次回の商談でそのまま使える具体的な日本語の営業トークフレーズ'),
});

type ScoreEval = z.infer<typeof scoreEvalSchema>;

function calcTotalScore(ev: ScoreEval): number {
  const sum =
    ev.hearingScore +
    ev.problemClarificationScore +
    ev.proposalScore +
    ev.objectionHandlingScore +
    ev.nextActionScore;
  return Math.round(sum / 5);
}

export async function POST(request: Request) {
  // JSON 解析エラー → 400
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 必須項目バリデーション → 422
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid required fields', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { messages, companyInfo, scenario } = parsed.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite';

      const conversationHistory = messages
        .map((m) => `[${m.role === 'user' ? '営業担当' : '顧客'}] ${m.content}`)
        .join('\n');

      const prompt = `あなたは営業コーチです。以下の商談ロールプレイを採点してください。

## 営業対象企業情報
- 企業名: ${companyInfo.companyName}
- 業界: ${companyInfo.industry}
- 課題: ${companyInfo.challenges}
- 提案サービス: ${companyInfo.proposedService}
- 担当者: ${companyInfo.contactRole}
- 商談フェーズ: ${companyInfo.salesPhase}

## シナリオ目標
${scenario.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

## 会話履歴
${conversationHistory}

## 採点指示
会話履歴に実際に現れている内容のみを根拠に採点してください。
各スコアは0〜100の整数で返してください。
goodPoints と improvements はそれぞれ2〜3件、会話内容に基づいた具体的なフィードバックを日本語で生成してください。
nextPhraseTip は次回の商談でそのまま使える具体的な日本語の営業トークフレーズにしてください。`;

      // Zod v4 ネイティブの toJSONSchema で変換（$schema は Gemini 不要のため除去）
      const { $schema: _$schema, ...jsonSchema } = z.toJSONSchema(scoreEvalSchema) as Record<string, unknown>;

      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: jsonSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response');

      const rawJson: unknown = JSON.parse(text);
      const validated = scoreEvalSchema.parse(rawJson);

      const result: ScoreResult = {
        hearingScore: Math.round(validated.hearingScore),
        problemClarificationScore: Math.round(validated.problemClarificationScore),
        proposalScore: Math.round(validated.proposalScore),
        objectionHandlingScore: Math.round(validated.objectionHandlingScore),
        nextActionScore: Math.round(validated.nextActionScore),
        totalScore: calcTotalScore(validated),
        goodPoints: validated.goodPoints,
        improvements: validated.improvements,
        nextPhraseTip: validated.nextPhraseTip,
      };

      return NextResponse.json({ ...result, source: 'gemini' });
    } catch (error) {
      console.error('Gemini score error:', error);
    }
  }

  // フォールバック（GEMINI_API_KEY 未設定・APIエラー・429・JSON解析失敗）
  return NextResponse.json({ ...generateMockScore(), source: 'mock' });
}
