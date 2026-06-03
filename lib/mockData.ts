import type { CompanyInfo, Scenario, ChatMessage, ScoreResult } from '@/types';

export function generateMockScenario(info: CompanyInfo): Scenario {
  return {
    customerName: info.companyName,
    customerRole: info.contactRole,
    situation: `${info.companyName}は${info.industry}業界で活躍する企業です。${info.businessDescription}を主な事業として展開しており、従業員規模は${info.employeeSize}です。現在「${info.challenges}」という課題を抱えており、解決策を模索している状況です。`,
    objectives: [
      `「${info.challenges}」の詳細と現状の深刻度をヒアリングする`,
      `${info.proposedService}の導入によって解決できる価値を具体的に訴求する`,
      `${info.salesPhase}フェーズとして次のアクションを明確に合意する`,
    ],
    keyPoints: [
      `${info.contactRole}の役割・権限を把握し、意思決定プロセスを確認する`,
      `課題の表面だけでなく、その背景にある本質的なペインポイントを引き出す`,
      `具体的な数値・事例を用いて${info.proposedService}の費用対効果を示す`,
    ],
    openingLine: `お時間をいただきありがとうございます。本日は${info.proposedService}についてご紹介させていただければと思っています。最初に、御社の現状についていくつかお聞きしてもよろしいでしょうか？`,
  };
}

const AI_REPLY_TEMPLATES = [
  (info: CompanyInfo) =>
    `ご連絡いただきありがとうございます。「${info.challenges}」については確かに頭を悩ませているところです。具体的にどのような解決策をお持ちでしょうか？`,
  () =>
    `なるほど、それは興味深いですね。ただ、現在すでに別のサービスを利用しているのですが、乗り換えの際のコストや移行期間はどの程度かかりますか？`,
  (info: CompanyInfo) =>
    `${info.proposedService}の導入コストについて、もう少し具体的に教えていただけますか？社内で稟議を通すために、ROIの試算も必要になります。`,
  () =>
    `競合他社と比べた場合の強みは何でしょうか？実際に導入した企業の事例なども参考にしたいです。`,
  () =>
    `ご提案の内容は理解しました。社内で一度検討してみます。次回はいつ頃お時間をいただけますか？`,
];

export function generateMockReply(messages: ChatMessage[], companyInfo: CompanyInfo): string {
  const aiCount = messages.filter((m) => m.role === 'ai').length;
  const index = Math.min(aiCount, AI_REPLY_TEMPLATES.length - 1);
  return AI_REPLY_TEMPLATES[index](companyInfo);
}

export function generateMockScore(_messages: ChatMessage[]): ScoreResult {
  return {
    totalScore: 72,
    hearingScore: 75,
    problemClarificationScore: 68,
    proposalScore: 80,
    objectionHandlingScore: 65,
    nextActionScore: 70,
    goodPoints: [
      '顧客の課題に対して共感を示す姿勢が随所に見られました',
      'サービスの具体的なメリットをわかりやすく伝えられていました',
      '質問を通じて顧客の状況を理解しようとする積極的な姿勢が印象的でした',
    ],
    improvements: [
      '反論への対応がやや弱く、より具体的なエビデンスや事例を活用できると良いでしょう',
      'ヒアリングの深度を増し、表面的な課題の背後にある本質的なペインを引き出すと効果的です',
      '次回アクションをより明確に合意することで、商談を前進させやすくなります',
    ],
    nextPhraseTip:
      '「御社の現状をもう少し詳しく伺えますか？特に〇〇の部分で何かお困りのことやご不満はございますか？」',
  };
}
