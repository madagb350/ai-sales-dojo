'use client'

import { useState } from 'react'
import CompanyForm from '@/components/CompanyForm'
import ScenarioView from '@/components/ScenarioView'
import ChatView from '@/components/ChatView'
import ScoreView from '@/components/ScoreView'
import { generateMockScenario, generateMockReply, generateMockScore } from '@/lib/mockData'
import type { AppPhase, CompanyInfo, Scenario, ChatMessage, ScoreResult } from '@/types'

const PHASE_STEPS: { phase: AppPhase; label: string }[] = [
  { phase: 'input', label: '企業情報入力' },
  { phase: 'scenario', label: 'シナリオ確認' },
  { phase: 'chat', label: 'ロープレ' },
  { phase: 'score', label: '採点結果' },
]

function StepIndicator({ currentPhase }: { currentPhase: AppPhase }) {
  const currentIndex = PHASE_STEPS.findIndex((s) => s.phase === currentPhase)
  return (
    <div className="flex items-center gap-0">
      {PHASE_STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isActive = i === currentIndex
        return (
          <div key={step.phase} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-blue-700 text-white'
                    : isActive
                    ? 'bg-white text-blue-700 border-2 border-blue-700'
                    : 'bg-blue-800 text-blue-300'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs mt-1 hidden sm:block ${
                  isActive ? 'text-white font-semibold' : 'text-blue-300'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-10 sm:w-16 mx-1 mb-4 transition-colors ${
                  i < currentIndex ? 'bg-blue-400' : 'bg-blue-800'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('input')
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)

  const handleCreateScenario = (info: CompanyInfo) => {
    setCompanyInfo(info)
    setScenario(generateMockScenario(info))
    setPhase('scenario')
  }

  const handleStartChat = () => {
    if (!companyInfo) return
    setMessages([
      {
        role: 'ai',
        content: `はじめまして。${companyInfo.companyName}の${companyInfo.contactRole}の田中と申します。本日はどのようなご用件でしょうか？`,
        timestamp: new Date(),
      },
    ])
    setPhase('chat')
  }

  const handleSendMessage = (content: string) => {
    if (!companyInfo) return
    const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date() }
    setMessages((prev) => {
      const updated = [...prev, userMsg]
      setTimeout(() => {
        const aiReply: ChatMessage = {
          role: 'ai',
          content: generateMockReply(updated, companyInfo),
          timestamp: new Date(),
        }
        setMessages((latest) => [...latest, aiReply])
      }, 800)
      return updated
    })
  }

  const handleScore = () => {
    setScoreResult(generateMockScore(messages))
    setPhase('score')
  }

  const handleReset = () => {
    setPhase('input')
    setCompanyInfo(null)
    setScenario(null)
    setMessages([])
    setScoreResult(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-900 text-white py-5 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI営業道場</h1>
            <p className="text-blue-300 text-sm mt-0.5">
              企業情報からロールプレイシナリオを生成し、商談力を鍛えよう
            </p>
          </div>
          <StepIndicator currentPhase={phase} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        {phase === 'input' && <CompanyForm onSubmit={handleCreateScenario} />}

        {phase === 'scenario' && scenario && companyInfo && (
          <ScenarioView
            scenario={scenario}
            companyInfo={companyInfo}
            onStart={handleStartChat}
            onBack={() => setPhase('input')}
          />
        )}

        {phase === 'chat' && scenario && companyInfo && (
          <ChatView
            messages={messages}
            scenario={scenario}
            companyInfo={companyInfo}
            onSendMessage={handleSendMessage}
            onScore={handleScore}
            onBack={() => setPhase('scenario')}
          />
        )}

        {phase === 'score' && scoreResult && (
          <ScoreView scoreResult={scoreResult} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
