import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import type { CompanyInfo, Scenario, RoleplayDifficulty } from '@/types';
import { generateMockScenario } from '@/lib/mockData';

const boundedText = (max: number) => z.string().trim().min(1).max(max)

const requestSchema = z.object({
  companyName: boundedText(120),
  industry: boundedText(80),
  businessDescription: boundedText(1000),
  employeeSize: boundedText(40),
  challenges: boundedText(1000),
  proposedService: boundedText(200),
  salesPhase: boundedText(80),
  contactRole: boundedText(120),
  difficulty: z.enum(['beginner', 'standard', 'advanced']).default('standard'),
});

const DIFFICULTY_INSTRUCTION: Record<RoleplayDifficulty, string> = {
  beginner:
    '顧客の警戒度：低。課題解決に積極的で提案を歓迎している。懸念は軽く、コミュニケーションしやすい相手として設定する。',
  standard:
    '顧客の警戒度：中。現実的な判断力を持ち、いくつかの懸念を示しながらも建設的に対話できる相手として設定する。',
  advanced:
    '顧客の警戒度：高。複数の競合と比較検討中で、ROI・セキュリティ・既存システム連携・稟議プロセスを厳しく確認してくる相手として設定する。難易度を高く設定すること。',
};

const scenarioSchema = z.object({
  customerName: z.string().describe('顧客企業名'),
  customerRole: z.string().describe('商談相手の役職名'),
  situation: z
    .string()
    .describe('商談の状況設定（顧客の事業背景・課題・状況を2〜4文で説明する文章）'),
  objectives: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('商談の目標（3件程度）'),
  keyPoints: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('攻略のポイント（3件程度）'),
  openingLine: z
    .string()
    .describe('営業担当がそのまま使えるオープニングトーク（自然な日本語、1〜2文）'),
});

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Gemini timeout (${ms}ms)`)), ms)
  })
  return Promise.race([promise.finally(() => clearTimeout(timer)), timeout])
}

/**
 * POST /api/scenario
 * CompanyInfo を受け取り Gemini でシナリオを生成する。失敗時はモックにフォールバック。
 */
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

  const { difficulty, ...infoFields } = parsed.data;
  const info = infoFields as CompanyInfo;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite';

      const prompt = `あなたはB2B営業トレーニングの専門家です。以下の企業情報を基に、営業ロールプレイのシナリオを日本語で生成してください。

## 企業情報
- 企業名: ${info.companyName}
- 業種: ${info.industry}
- 事業内容: ${info.businessDescription}
- 従業員規模: ${info.employeeSize}
- 想定課題: ${info.challenges}
- 提案サービス: ${info.proposedService}
- 営業フェーズ: ${info.salesPhase}
- 商談相手の役職: ${info.contactRole}

## 生成ルール
- 提供された情報のみを根拠にする。入力されていない事実や企業固有の実績は断定的に創作しない
- 不明・未確認の情報は「〜と思われる」「〜が想定される」などの仮説表現を使う
- 営業フェーズ（${info.salesPhase}）に応じて商談の目的・難易度・温度感を変える
- 商談相手の役職（${info.contactRole}）の関心事・意思決定観点を具体的に反映する
- 毎回同じ定型文にならないよう、入力内容に即して具体的な文章にする
- customerName は企業名をそのまま使用する
- situation は顧客の事業背景・課題・状況を2〜4文で説明する
- objectives は${info.salesPhase}フェーズで達成すべき具体的な目標を3件程度
- keyPoints は${info.contactRole}の観点や課題に応じた攻略ポイントを3件程度
- openingLine は${info.salesPhase}フェーズにふさわしい、営業担当がそのまま使える自然な日本語のオープニングトーク

## 難易度設定
${DIFFICULTY_INSTRUCTION[difficulty]}`;

      // $schema は Gemini 不要のため除去
      const rawSchema = z.toJSONSchema(scenarioSchema) as Record<string, unknown>;
      const jsonSchema = Object.fromEntries(
        Object.entries(rawSchema).filter(([k]) => k !== '$schema'),
      );

      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: jsonSchema,
          },
        }),
        15000,
      );

      const text = response.text;
      if (!text) throw new Error('Empty response');

      const rawJson: unknown = JSON.parse(text);
      const validated = scenarioSchema.parse(rawJson);

      const scenario: Scenario = {
        customerName: validated.customerName,
        customerRole: validated.customerRole,
        situation: validated.situation,
        objectives: validated.objectives,
        keyPoints: validated.keyPoints,
        openingLine: validated.openingLine,
      };

      return NextResponse.json({ ...scenario, source: 'gemini' });
    } catch (error) {
      console.error('Gemini scenario error:', error);
    }
  }

  // フォールバック（GEMINI_API_KEY 未設定・429・通信エラー・JSON解析エラー・スキーマ検証失敗）
  return NextResponse.json({ ...generateMockScenario(info, difficulty), source: 'mock' });
}
