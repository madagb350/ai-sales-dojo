import type { CompanyInfo, Scenario, ChatMessage, ScoreResult, RoleplayDifficulty } from '@/types';

export function generateMockScenario(
  info: CompanyInfo,
  difficulty: RoleplayDifficulty = 'standard',
): Scenario {
  const difficultyNote =
    difficulty === 'beginner'
      ? `担当者は課題解決に積極的で、新しいソリューションの導入に前向きです。`
      : difficulty === 'advanced'
        ? `担当者は複数の競合サービスを比較検討中で、ROIや既存システムとの連携について厳しい確認が予想されます。`
        : `担当者はいくつかの懸念を持ちながらも、課題解決に関心を示しています。`;

  return {
    customerName: info.companyName,
    customerRole: info.contactRole,
    situation: `${info.companyName}は${info.industry}業界で活躍する企業です。${info.businessDescription}を主な事業として展開しており、従業員規模は${info.employeeSize}です。現在「${info.challenges}」という課題を抱えており、解決策を模索している状況です。${difficultyNote}`,
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

const BEGINNER_TEMPLATES = [
  (info: CompanyInfo) =>
    `ありがとうございます。「${info.challenges}」については改善したいと思っています。${info.proposedService}で具体的にどのように解決できますか？`,
  () => `なるほど、それは良さそうですね。導入にあたって何か準備が必要なことはありますか？`,
  (info: CompanyInfo) =>
    `${info.proposedService}の導入事例を少し教えていただけますか？参考にしたいです。`,
  () => `ご提案の内容はよく理解できました。社内での手続きを確認してみます。`,
  () => `前向きに検討したいと思います。次のステップはどうすればよいですか？`,
];

const STANDARD_TEMPLATES = [
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

const ADVANCED_TEMPLATES = [
  (info: CompanyInfo) =>
    `「${info.challenges}」は認識していますが、既に他社のソリューションと並行して検討しています。${info.proposedService}が他社と何が違うのか、具体的に教えていただけますか？`,
  () =>
    `ROIの根拠を数字で示してください。定性的な説明だけでは社内の承認を得られません。`,
  () =>
    `セキュリティ基準とコンプライアンス対応はどうなっていますか？当社は業界規制への準拠が必須です。`,
  () =>
    `既存の基幹システムとの連携はどのように実現しますか？移行リスクと期間の見積もりも必要です。`,
  () =>
    `社内稟議には複数の決裁者が関わります。費用対効果の試算と導入ロードマップを文書で提出していただけますか？`,
];

export function generateMockReply(
  messages: ChatMessage[],
  companyInfo: CompanyInfo,
  difficulty: RoleplayDifficulty = 'standard',
): string {
  const templates =
    difficulty === 'beginner'
      ? BEGINNER_TEMPLATES
      : difficulty === 'advanced'
        ? ADVANCED_TEMPLATES
        : STANDARD_TEMPLATES;
  const aiCount = messages.filter((m) => m.role === 'ai').length;
  const seededGreetingOffset = messages[0]?.role === 'ai' ? 1 : 0;
  const turn = Math.max(aiCount - seededGreetingOffset, 0);
  const index = Math.min(turn, templates.length - 1);
  return templates[index](companyInfo);
}

export function generateMockScore(difficulty: RoleplayDifficulty = 'standard'): ScoreResult {
  const offset = difficulty === 'beginner' ? 8 : difficulty === 'advanced' ? -8 : 0;
  return {
    totalScore: 72 + offset,
    hearingScore: 75 + offset,
    problemClarificationScore: 68 + offset,
    proposalScore: 80 + offset,
    objectionHandlingScore: 65 + offset,
    nextActionScore: 70 + offset,
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
