import type { ScoreResult } from '@/types'

interface Props {
  scoreResult: ScoreResult
  onReset: () => void
}

interface ScoreBarProps {
  label: string
  score: number
  barColor: string
}

function ScoreBar({ label, score, barColor }: ScoreBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-800">
          {score}
          <span className="text-slate-400 font-normal text-xs"> / 100</span>
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function getTotalScoreLabel(score: number): { label: string; colorClass: string } {
  if (score >= 90) return { label: '素晴らしい！', colorClass: 'text-green-600' }
  if (score >= 75) return { label: 'よくできました', colorClass: 'text-blue-600' }
  if (score >= 60) return { label: 'もう一息！', colorClass: 'text-amber-600' }
  return { label: '要改善', colorClass: 'text-red-600' }
}

export default function ScoreView({ scoreResult, onReset }: Props) {
  const { label, colorClass } = getTotalScoreLabel(scoreResult.totalScore)

  return (
    <div className="space-y-6">
      {/* 総合スコア */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">採点結果</h2>
        <div className="inline-flex flex-col items-center">
          <div className="w-36 h-36 rounded-full border-8 border-blue-700 flex flex-col items-center justify-center mb-4">
            <span className="text-5xl font-bold text-blue-700">{scoreResult.totalScore}</span>
            <span className="text-sm text-slate-400">/ 100</span>
          </div>
          <span className={`text-lg font-semibold ${colorClass}`}>{label}</span>
        </div>
      </div>

      {/* 詳細スコア */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-5">詳細スコア</h3>
        <div className="space-y-5">
          <ScoreBar label="ヒアリング力" score={scoreResult.hearingScore} barColor="bg-blue-500" />
          <ScoreBar label="課題整理力" score={scoreResult.problemClarificationScore} barColor="bg-purple-500" />
          <ScoreBar label="提案力" score={scoreResult.proposalScore} barColor="bg-green-500" />
          <ScoreBar label="反論対応力" score={scoreResult.objectionHandlingScore} barColor="bg-orange-500" />
          <ScoreBar label="次回アクション設定" score={scoreResult.nextActionScore} barColor="bg-teal-500" />
        </div>
      </div>

      {/* 良かった点・改善点 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-green-500 text-lg">✓</span>
            良かった点
          </h3>
          <ul className="space-y-3">
            {scoreResult.goodPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-green-500 mt-0.5 flex-shrink-0">●</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-amber-500 text-lg">△</span>
            改善点
          </h3>
          <ul className="space-y-3">
            {scoreResult.improvements.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">●</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 次回使える一言 */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-800 mb-3">次回使える一言</h3>
        <p className="text-blue-900 text-sm leading-relaxed">{scoreResult.nextPhraseTip}</p>
      </div>

      {/* リセットボタン */}
      <div className="flex justify-center pb-4">
        <button
          onClick={onReset}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-10 py-3 rounded-xl transition-colors shadow-sm"
        >
          もう一度挑戦する
        </button>
      </div>
    </div>
  )
}
