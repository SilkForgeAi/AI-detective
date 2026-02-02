'use client'

import { Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Case } from '@/types/case'

interface CaseListProps {
  cases: Case[]
  selectedCase: Case | null
  onSelectCase: (caseData: Case) => void
}

export default function CaseList({ cases, selectedCase, onSelectCase }: CaseListProps) {
  const getStatusIcon = (status: Case['status']) => {
    switch (status) {
      case 'solved':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'analyzing':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
      case 'cold':
        return <AlertCircle className="w-4 h-4 text-gray-400" />
      default:
        return <FileText className="w-4 h-4 text-blue-400" />
    }
  }

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'solved':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'analyzing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cold':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  if (cases.length === 0) {
    return (
      <div className="bg-detective-secondary/50 rounded-xl p-8 border border-detective-secondary text-center">
        <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No cases yet. Upload your first case to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-white mb-4">Cases ({cases.length})</h2>
      {cases.map((caseItem) => (
        <button
          key={caseItem.id}
          onClick={() => onSelectCase(caseItem)}
          className={`w-full text-left p-4 rounded-lg border transition-all ${
            selectedCase?.id === caseItem.id
              ? 'bg-detective-accent/20 border-detective-accent shadow-lg shadow-detective-accent/10'
              : 'bg-detective-secondary/50 border-detective-secondary hover:border-detective-light hover:bg-detective-secondary/70'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm line-clamp-1">
                {caseItem.title}
              </h3>
              {caseItem.jurisdiction && (
                <p className="text-xs text-gray-500 mt-1">{caseItem.jurisdiction}</p>
              )}
            </div>
            {getStatusIcon(caseItem.status)}
          </div>
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
            {caseItem.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{caseItem.date}</span>
              {caseItem.analysis && (
                <span className="text-xs text-blue-400">
                  {caseItem.analysis.hypotheses?.length || 0} hypotheses
                </span>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                caseItem.status
              )}`}
            >
              {caseItem.status}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
