import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { ChatMessage, CompanyInfo } from '@/types';
import { generateMockReply } from '@/lib/mockData';

interface RequestBody {
  messages: ChatMessage[];
  companyInfo: CompanyInfo;
}

export async function POST(request: Request) {
  try {
    const { messages, companyInfo }: RequestBody = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `あなたは${companyInfo.companyName}の${companyInfo.contactRole}の田中です。
${companyInfo.companyName}は${companyInfo.industry}業界の企業で、${companyInfo.businessDescription}を展開しています。
従業員規模は${companyInfo.employeeSize}で、現在「${companyInfo.challenges}」という課題を抱えています。
相手は「${companyInfo.proposedService}」を提案する営業担当者です。
ビジネスの顧客として自然に振る舞い、日本語で1〜3文の簡潔な返答をしてください。
簡単には購入を決めず、質問や懸念を適切に示してください。`;

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
    return NextResponse.json({ content: generateMockReply(messages, companyInfo) });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
