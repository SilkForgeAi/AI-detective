'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, TrendingUp, Clock, CheckCircle, AlertCircle,
  BarChart3, Target, Brain, Activity
} from 'lucide-react'
import { Case } from '@/types/case'

interface DashboardProps {
  cases: Case[]
  onSelectCase: (caseId: string) => void
}

export default function Dashboard({ cases, onSelectCase }: DashboardProps) {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    analyzing: 0,
    solved: 0,
    cold: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  })

  useEffect(() => {
    const newStats = {
      total: cases.length,
      open: cases.filter(c => c.status === 'open').length,
      analyzing: cases.filter(c => c.status === 'analyzing').length,
      solved: cases.filter(c => c.status === 'solved').length,
      cold: cases.filter(c => c.status === 'cold').length,
      critical: cases.filter(c => c.priority === 'critical').length,
      high: cases.filter(c => c.priority === 'high').length,
      medium: cases.filter(c => c.priority === 'medium').length,
      low: cases.filter(c => c.priority === 'low').length,
    }
    setStats(newStats)
  }, [cases])

  const recentCases = cases
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-detective-secondary/50 rounded-xl p-4 border border-detective-secondary">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-400">Total Cases</p>
        </div>

        <div className="bg-detective-secondary/50 rounded-xl p-4 border border-detective-secondary">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.open}</span>
          </div>
          <p className="text-sm text-gray-400">Open Cases</p>
        </div>

        <div className="bg-detective-secondary/50 rounded-xl p-4 border border-detective-secondary">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{stats.analyzing}</span>
          </div>
          <p className="text-sm text-gray-400">Analyzing</p>
        </div>

        <div className="bg-detective-secondary/50 rounded-xl p-4 border border-detective-secondary">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.solved}</span>
          </div>
          <p className="text-sm text-gray-400">Solved</p>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-detective-accent" />
          Priority Breakdown
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.high}</div>
            <div className="text-sm text-gray-400">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
            <div className="text-sm text-gray-400">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.low}</div>
            <div className="text-sm text-gray-400">Low</div>
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-detective-accent" />
          Recent Cases
        </h3>
        {recentCases.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No cases yet. Create your first case!</p>
        ) : (
          <div className="space-y-2">
            {recentCases.map((caseItem) => (
              <button
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem.id)}
                className="w-full p-3 bg-detective-darker/50 hover:bg-detective-darker rounded-lg border border-detective-light text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-white">{caseItem.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    caseItem.status === 'solved' ? 'bg-green-500/20 text-green-400' :
                    caseItem.status === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                    caseItem.status === 'cold' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {caseItem.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Updated {new Date(caseItem.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
