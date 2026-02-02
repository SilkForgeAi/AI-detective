'use client'

import { Case } from '@/types/case'
import { FileText, AlertCircle, CheckCircle, X } from 'lucide-react'

interface CaseComparisonProps {
  cases: Case[]
  onClose: () => void
}

export default function CaseComparison({ cases, onClose }: CaseComparisonProps) {
  if (cases.length < 2) {
    return (
      <div className="bg-detective-secondary/50 rounded-xl p-8 border border-detective-secondary text-center">
        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Select at least 2 cases to compare</p>
      </div>
    )
  }

  const allFields = [
    'title', 'date', 'status', 'jurisdiction', 'priority', 'evidence', 'insights'
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-detective-secondary border-b border-detective-light p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-detective-accent" />
            <h2 className="text-2xl font-bold text-white">Case Comparison</h2>
            <span className="text-sm text-gray-400">({cases.length} cases)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-detective-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-detective-light">
                  <th className="text-left p-3 text-sm font-semibold text-gray-300">Field</th>
                  {cases.map((c, idx) => (
                    <th key={c.id} className="text-left p-3 text-sm font-semibold text-white min-w-[300px]">
                      Case {idx + 1}: {c.title.substring(0, 30)}...
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-detective-light/50">
                  <td className="p-3 text-sm font-semibold text-gray-400">Title</td>
                  {cases.map(c => (
                    <td key={c.id} className="p-3 text-sm text-gray-300">{c.title}</td>
                  ))}
                </tr>
                <tr className="border-b border-detective-light/50">
                  <td className="p-3 text-sm font-semibold text-gray-400">Date</td>
                  {cases.map(c => (
                    <td key={c.id} className="p-3 text-sm text-gray-300">{c.date}</td>
                  ))}
                </tr>
                <tr className="border-b border-detective-light/50">
                  <td className="p-3 text-sm font-semibold text-gray-400">Status</td>
                  {cases.map(c => (
                    <td key={c.id} className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        c.status === 'solved' ? 'bg-green-500/20 text-green-400' :
                        c.status === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                        c.status === 'cold' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-detective-light/50">
                  <td className="p-3 text-sm font-semibold text-gray-400">Jurisdiction</td>
                  {cases.map(c => (
                    <td key={c.id} className="p-3 text-sm text-gray-300">{c.jurisdiction || 'N/A'}</td>
                  ))}
                </tr>
                <tr className="border-b border-detective-light/50">
                  <td className="p-3 text-sm font-semibold text-gray-400">Priority</td>
                  {cases.map(c => (
                    <td key={c.id} className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        c.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        c.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        c.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-detective-light/50">
                  <td className="p-3 text-sm font-semibold text-gray-400">Evidence Count</td>
                  {cases.map(c => (
                    <td key={c.id} className="p-3 text-sm text-gray-300">{c.evidence.length}</td>
                  ))}
                </tr>
                <tr className="border-b border-detective-light/50">
                  <td className="p-3 text-sm font-semibold text-gray-400">Insights</td>
                  {cases.map(c => (
                    <td key={c.id} className="p-3 text-sm text-gray-300">
                      {c.insights?.length || 0} insights
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-sm font-semibold text-gray-400">Analysis</td>
                  {cases.map(c => (
                    <td key={c.id} className="p-3 text-sm text-gray-300">
                      {c.analysis ? (
                        <div className="space-y-1">
                          <div>Hypotheses: {c.analysis.hypotheses?.length || 0}</div>
                          <div>Patterns: {c.analysis.patterns?.length || 0}</div>
                          <div>Anomalies: {c.analysis.anomalies?.length || 0}</div>
                          <div>Confidence: {c.analysis.confidenceScores?.overall || 0}%</div>
                        </div>
                      ) : (
                        'No analysis'
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
