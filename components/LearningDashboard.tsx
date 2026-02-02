'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Target, BarChart3, AlertCircle, CheckCircle } from 'lucide-react'
import { LearningMetrics } from '@/lib/learning/feedbackSystem'

export default function LearningDashboard() {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/feedback')
      const data = await response.json()
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-detective-secondary/50 rounded-xl p-8 border border-detective-secondary text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-detective-accent mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading learning metrics...</p>
      </div>
    )
  }

  if (!metrics || metrics.verifiedCases === 0) {
    return (
      <div className="bg-detective-secondary/50 rounded-xl p-8 border border-detective-secondary text-center">
        <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Learning Data Yet</h3>
        <p className="text-gray-400">
          Provide feedback on case analyses to help the AI learn and improve accuracy.
        </p>
      </div>
    )
  }

  const progressTo95 = Math.min(100, (metrics.averageAccuracy / 95) * 100)

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-detective-accent" />
          <h2 className="text-xl font-bold text-white">Learning Performance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
            <div className="text-sm text-gray-400 mb-1">Average Accuracy</div>
            <div className="text-3xl font-bold text-white">{metrics.averageAccuracy}%</div>
            <div className="text-xs text-gray-500 mt-1">Target: 95%</div>
          </div>
          <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
            <div className="text-sm text-gray-400 mb-1">Verified Cases</div>
            <div className="text-3xl font-bold text-white">{metrics.verifiedCases}</div>
            <div className="text-xs text-gray-500 mt-1">of {metrics.totalCases} total</div>
          </div>
          <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
            <div className="text-sm text-gray-400 mb-1">Progress to 95%</div>
            <div className="text-3xl font-bold text-white">{Math.round(progressTo95)}%</div>
            <div className="w-full bg-detective-light rounded-full h-2 mt-2">
              <div
                className="bg-detective-accent h-2 rounded-full transition-all"
                style={{ width: `${progressTo95}%` }}
              />
            </div>
          </div>
        </div>

        {/* Accuracy Trend */}
        {metrics.improvementTrend.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">Recent Accuracy Trend</div>
            <div className="flex items-end gap-2 h-20">
              {metrics.improvementTrend.map((acc, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-detective-accent rounded-t transition-all"
                    style={{ height: `${acc}%` }}
                  />
                  <div className="text-xs text-gray-500 mt-1">{acc}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Component Accuracy */}
      <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-detective-accent" />
          <h2 className="text-xl font-bold text-white">Accuracy by Component</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
            <div className="text-sm text-gray-400 mb-2">Insights</div>
            <div className="text-2xl font-bold text-white">{metrics.accuracyByCategory.insights}%</div>
            <div className="w-full bg-detective-light rounded-full h-2 mt-2">
              <div
                className="bg-blue-400 h-2 rounded-full"
                style={{ width: `${metrics.accuracyByCategory.insights}%` }}
              />
            </div>
          </div>
          <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
            <div className="text-sm text-gray-400 mb-2">Hypotheses</div>
            <div className="text-2xl font-bold text-white">{metrics.accuracyByCategory.hypotheses}%</div>
            <div className="w-full bg-detective-light rounded-full h-2 mt-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${metrics.accuracyByCategory.hypotheses}%` }}
              />
            </div>
          </div>
          <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
            <div className="text-sm text-gray-400 mb-2">Anomalies</div>
            <div className="text-2xl font-bold text-white">{metrics.accuracyByCategory.anomalies}%</div>
            <div className="w-full bg-detective-light rounded-full h-2 mt-2">
              <div
                className="bg-orange-400 h-2 rounded-full"
                style={{ width: `${metrics.accuracyByCategory.anomalies}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Common Mistakes */}
      {metrics.commonMistakes.length > 0 && (
        <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Common Mistakes (Learning From)</h2>
          </div>
          <div className="space-y-2">
            {metrics.commonMistakes.map((mistake, idx) => (
              <div
                key={idx}
                className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">{mistake.description}</div>
                  <div className="text-sm text-gray-400 mt-1">{mistake.count} occurrences</div>
                </div>
                <div className="text-xs text-gray-500">Learning from this...</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
