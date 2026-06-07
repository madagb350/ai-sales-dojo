import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { ChatMessage, CompanyInfo, RoleplayDifficulty } from '@/types';
import { generateMockReply } from '@/lib/mockData';

interface RequestBody {
  messages: ChatMessage[];
  companyInfo: CompanyInfo;
  difficulty?: RoleplayDifficulty;
}

const DIFFICULTY_INSTRUCTION: Record<RoleplayDifficulty, string> = {
  beginner:
    '難易度：初級。顧客は協力的で課題解決に前向きです。提案に対して建設的な質問をし、懸念は軽めです。',
  standard:
    '難易度：中級。顧客は現実的で、適度な懸念や質問を示しながら対話します。強い抵抗はないが簡単には決めません。',
  advanced:
    '難易度：上級。顧客は警戒心が強く、以下を厳しく確認してください：競合との差別化、ROIの数値根拠、セキュリティ・コンプライアンス対応、既存システムとの連携・移行リスク、社内稟議・決裁プロセス。会話履歴を踏まえ、同じ指摘を繰り返さず新たな視点から返答してください。',
};

/**
 * チャット API エンドポイント。
 * Gemini API が利用可能な場合はそちらでレスポンスを生成し、
 * 利用不可またはエラー時はモックデータにフォールバックする。
 */
export async function POST(request: Request) {
  try {
    const { messages, companyInfo, difficulty = 'standard' }: RequestBody = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `あなたは${companyInfo.companyName}の${companyInfo.contactRole}の田中です。
${companyInfo.companyName}は${companyInfo.industry}業界の企業で、${companyInfo.businessDescription}を展開しています。
従業員規模は${companyInfo.employeeSize}で、現在「${companyInfo.challenges}」という課題を抱えています。
相手は「${companyInfo.proposedService}」を提案する営業担当者です。
ビジネスの顧客として自然に振る舞い、日本語で1〜3文の簡潔な返答をしてください。
${DIFFICULTY_INSTRUCTION[difficulty]}`;

        // 最初のAIメッセージ（アプリが生成した挨拶）をスキップし、user→user、ai→model にマッピング
        const startIndex = messages[0]?.role === 'ai' ? 1 : 0;
        const contents = messages.slice(startIndex).map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite';
        const response = await ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction },
        });

        const text = response.text;
        if (text) {
          return NextResponse.json({ content: text });
        }
      } catch (error) {
        console.error('Gemini API error:', error);
      }
    }

    // Gemini が使えない場合はモックにフォールバック
    return NextResponse.json({ content: generateMockReply(messages, companyInfo, difficulty) });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
