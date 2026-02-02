'use client'

import { Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ExportChatProps {
  messages: Message[]
  caseTitle?: string
}

export default function ExportChat({ messages, caseTitle }: ExportChatProps) {
  const handleExport = (format: 'txt' | 'json') => {
    if (messages.length === 0) {
      toast.error('No messages to export')
      return
    }

    if (format === 'txt') {
      const content = messages
        .map(msg => {
          const role = msg.role === 'user' ? 'User' : 'AI Detective'
          const time = msg.timestamp.toLocaleString()
          return `[${time}] ${role}:\n${msg.content}\n`
        })
        .join('\n---\n\n')

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-${caseTitle || 'export'}-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Chat exported as text file')
    } else {
      const data = {
        caseTitle,
        exportedAt: new Date().toISOString(),
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-${caseTitle || 'export'}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Chat exported as JSON file')
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('txt')}
        className="flex items-center gap-2 px-3 py-2 bg-detective-secondary hover:bg-detective-light/20 text-gray-300 rounded-lg transition-colors text-sm"
        title="Export as text"
      >
        <FileText className="w-4 h-4" />
        TXT
      </button>
      <button
        onClick={() => handleExport('json')}
        className="flex items-center gap-2 px-3 py-2 bg-detective-secondary hover:bg-detective-light/20 text-gray-300 rounded-lg transition-colors text-sm"
        title="Export as JSON"
      >
        <Download className="w-4 h-4" />
        JSON
      </button>
    </div>
  )
}
