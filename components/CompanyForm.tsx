'use client'

import { useState } from 'react'
import type { CompanyInfo, RoleplayDifficulty, RoleplaySettings } from '@/types'

interface Props {
  onSubmit: (info: CompanyInfo, settings: RoleplaySettings) => void
  isGenerating?: boolean
  error?: string | null
}

const DIFFICULTY_OPTIONS: {
  value: RoleplayDifficulty
  label: string
  description: string
}[] = [
  {
    value: 'beginner',
    label: '初級',
    description: '協力的な顧客。課題解決に前向きで、提案を歓迎してくれます。',
  },
  {
    value: 'standard',
    label: '中級',
    description: '現実的な顧客。適度な懸念や質問を示しながら対話します。',
  },
  {
    value: 'advanced',
    label: '上級',
    description: '警戒心の強い顧客。競合比較・ROI・リスクを厳しく確認します。',
  },
]

const INDUSTRY_OPTIONS = [
  'IT・テクノロジー',
  '製造業',
  '小売・流通',
  '金融・保険',
  '不動産',
  '医療・ヘルスケア',
  '教育',
  'コンサルティング',
  'その他',
]

const EMPLOYEE_SIZE_OPTIONS = [
  '1〜10名',
  '11〜50名',
  '51〜200名',
  '201〜500名',
  '501〜1000名',
  '1001名以上',
]

const SALES_PHASE_OPTIONS = [
  '初回接触',
  'ヒアリング',
  '提案',
  'クロージング',
  'フォローアップ',
]

const INITIAL_FORM: CompanyInfo = {
  companyName: '',
  industry: '',
  businessDescription: '',
  employeeSize: '',
  challenges: '',
  proposedService: '',
  salesPhase: '',
  contactRole: '',
}

export default function CompanyForm({ onSubmit, isGenerating = false, error = null }: Props) {
  const [form, setForm] = useState<CompanyInfo>(INITIAL_FORM)
  const [difficulty, setDifficulty] = useState<RoleplayDifficulty>('standard')

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isValid = Object.values(form).every((v) => v.trim() !== '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isGenerating) return
    onSubmit(form, { difficulty })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">企業情報の入力</h2>
        <p className="text-slate-500 mt-2">
          商談先の企業情報を入力して、ロールプレイシナリオを生成します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              企業名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="例：株式会社サンプル"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              業種 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            >
              <option value="">選択してください</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              事業内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.businessDescription}
              onChange={(e) => handleChange('businessDescription', e.target.value)}
              placeholder="例：中小企業向けのクラウド型会計ソフトの開発・販売"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              従業員規模 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.employeeSize}
              onChange={(e) => handleChange('employeeSize', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            >
              <option value="">選択してください</option>
              {EMPLOYEE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              営業フェーズ <span className="text-red-500">*</span>
            </label>
            <select
              value={form.salesPhase}
              onChange={(e) => handleChange('salesPhase', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            >
              <option value="">選択してください</option>
              {SALES_PHASE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              想定課題 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.challenges}
              onChange={(e) => handleChange('challenges', e.target.value)}
              placeholder="例：既存の経理業務が手作業で非効率で、月次決算に時間がかかっている"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              提案したいサービス <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.proposedService}
              onChange={(e) => handleChange('proposedService', e.target.value)}
              placeholder="例：クラウド型SFA（営業支援システム）"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              商談相手の役職 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.contactRole}
              onChange={(e) => handleChange('contactRole', e.target.value)}
              placeholder="例：営業部長、IT部門マネージャー"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* 難易度選択 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            難易度 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDifficulty(opt.value)}
                className={`rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                  difficulty === opt.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span
                  className={`block text-sm font-semibold mb-1 ${
                    difficulty === opt.value ? 'text-blue-700' : 'text-slate-800'
                  }`}
                >
                  {opt.label}
                </span>
                <span className="block text-xs text-slate-500 leading-relaxed">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isValid || isGenerating}
              className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm"
            >
              {isGenerating ? 'AIがシナリオを作成中...' : 'ロープレを作成する →'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
