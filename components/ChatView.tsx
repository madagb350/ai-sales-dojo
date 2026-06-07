'use client'

import { useState, useRef, useEffect } from 'react'
import type { CompanyInfo, ChatMessage, Scenario } from '@/types'

interface Props {
  messages: ChatMessage[]
  scenario: Scenario
  companyInfo: CompanyInfo
  onSendMessage: (content: string) => void
  onScore: () => void
  onBack: () => void
  isAiTyping?: boolean
  isScoring?: boolean
  scoreError?: string | null
}

export default function ChatView({
  messages,
  scenario,
  companyInfo,
  onSendMessage,
  onScore,
  onBack,
  isAiTyping = false,
  isScoring = false,
  scoreError = null,
}: Props) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const userMessageCount = messages.filter((m) => m.role === 'user').length

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ヘッダー情報 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">ロープレ相手</p>
            <p className="font-semibold text-slate-800">
              {companyInfo.companyName} ・ {scenario.customerRole}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
              進行中
            </span>
            <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
              {companyInfo.salesPhase}
            </span>
          </div>
        </div>
      </div>

      {/* チャットエリア */}
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden"
        style={{ height: '480px' }}
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  msg.role === 'user'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {msg.role === 'user' ? '営' : '客'}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-700 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isAiTyping && (
            <div className="flex gap-3 flex-row">
              <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-slate-200 text-slate-700">
                客
              </div>
              <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-slate-100 text-slate-500 rounded-tl-sm">
                <p className="text-sm">入力中...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="営業担当として返答を入力してください..."
              rows={2}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAiTyping}
              className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-medium transition-colors shrink-0"
            >
              送信
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Enter で送信・Shift+Enter で改行</p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col gap-2">
        {scoreError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {scoreError}
          </p>
        )}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            disabled={isScoring}
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            ← シナリオに戻る
          </button>
          <button
            onClick={onScore}
            disabled={userMessageCount < 1 || isScoring || isAiTyping}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm"
          >
            {isScoring ? 'AIが採点中...' : `採点する（${userMessageCount}回発言済み）`}
          </button>
        </div>
      </div>
    </div>
  )
}
