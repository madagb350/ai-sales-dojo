import type { CompanyInfo, Scenario } from '@/types'

interface Props {
  scenario: Scenario
  companyInfo: CompanyInfo
  onStart: () => void
  onBack: () => void
}

export default function ScenarioView({ scenario, companyInfo, onStart, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">ロープレシナリオ</h2>
            <p className="text-slate-500 mt-1">
              {companyInfo.companyName}との商談シナリオが生成されました
            </p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
            {companyInfo.salesPhase}フェーズ
          </span>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              状況設定
            </h3>
            <p className="text-slate-700 leading-relaxed">{scenario.situation}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              商談目標
            </h3>
            <ul className="space-y-3">
              {scenario.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-700 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-slate-700">{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              攻略のポイント
            </h3>
            <ul className="space-y-3">
              {scenario.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5 text-lg leading-none">⚡</span>
                  <span className="text-slate-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
              オープニングトーク例
            </h3>
            <p className="text-blue-900 leading-relaxed">「{scenario.openingLine}」</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
        >
          ← 入力に戻る
        </button>
        <button
          onClick={onStart}
          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm"
        >
          ロープレ開始 →
        </button>
      </div>
    </div>
  )
}
