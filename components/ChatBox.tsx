'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { Case } from '@/types/case'
import ExportChat from './ExportChat'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  caseContext?: string // Case ID if message is about a specific case
}

interface ChatBoxProps {
  currentCase?: Case | null
  allCases?: Case[]
  onClose?: () => void
  minimized?: boolean
  onMinimize?: () => void
}

export default function ChatBox({ currentCase, allCases = [], onClose, minimized = false, onMinimize }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: currentCase
        ? `Hello! I'm your AI Detective assistant. I can help you analyze the case "${currentCase.title}", answer questions, generate insights, and more. What would you like to know?`
        : `Hello! I'm your AI Detective assistant. I can help you analyze cases, answer questions, generate insights, and more. What would you like to know?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      caseContext: currentCase?.id,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          currentCase: currentCase ? {
            id: currentCase.id,
            title: currentCase.title,
            description: currentCase.description,
            status: currentCase.status,
            evidence: currentCase.evidence.map(e => ({
              type: e.type,
              description: e.description,
            })),
          } : null,
          allCases: allCases.map(c => ({
            id: c.id,
            title: c.title,
            status: c.status,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        caseContext: currentCase?.id,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onMinimize}
          className="flex items-center gap-2 px-4 py-3 bg-detective-accent hover:bg-detective-accent/90 text-white rounded-lg font-semibold shadow-lg transition-colors"
        >
          <Bot className="w-5 h-5" />
          <span>Chat with Detective</span>
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-detective-secondary rounded-xl border border-detective-light shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-detective-light bg-detective-darker/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-detective-accent" />
          <h3 className="font-semibold text-white">AI Detective Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1.5 hover:bg-detective-light/20 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-detective-light/20 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-detective-accent/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-detective-accent" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-detective-accent text-white'
                  : 'bg-detective-darker/50 text-gray-200 border border-detective-light'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-detective-accent/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-detective-accent" />
            </div>
            <div className="bg-detective-darker/50 rounded-lg px-4 py-2 border border-detective-light">
              <Loader2 className="w-4 h-4 animate-spin text-detective-accent" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-detective-light bg-detective-darker/50 rounded-b-xl">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about the case..."
            className="flex-1 px-3 py-2 bg-detective-secondary border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
