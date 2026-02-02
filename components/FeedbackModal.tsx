'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { Case, CaseAnalysis } from '@/types/case'
import { CaseOutcome } from '@/lib/learning/feedbackSystem'

interface FeedbackModalProps {
  caseData: Case
  analysis: CaseAnalysis
  onClose: () => void
  onFeedbackSubmitted: () => void
}

export default function FeedbackModal({ caseData, analysis, onClose, onFeedbackSubmitted }: FeedbackModalProps) {
  const [accuracy, setAccuracy] = useState(50)
  const [verified, setVerified] = useState(true)
  const [actualOutcome, setActualOutcome] = useState<'solved' | 'closed' | 'ongoing'>('ongoing')
  const [solvedBy, setSolvedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedInsights, setSelectedInsights] = useState<Set<number>>(new Set())
  const [selectedHypotheses, setSelectedHypotheses] = useState<Set<string>>(new Set())
  const [selectedAnomalies, setSelectedAnomalies] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleInsight = (index: number) => {
    const newSet = new Set(selectedInsights)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedInsights(newSet)
  }

  const toggleHypothesis = (id: string) => {
    const newSet = new Set(selectedHypotheses)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedHypotheses(newSet)
  }

  const toggleAnomaly = (id: string) => {
    const newSet = new Set(selectedAnomalies)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedAnomalies(newSet)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Determine correct/incorrect items
    const correctInsights = analysis.insights
      .map((insight, idx) => selectedInsights.has(idx) ? insight : null)
      .filter(Boolean) as string[]
    
    const incorrectInsights = analysis.insights
      .map((insight, idx) => !selectedInsights.has(idx) ? insight : null)
      .filter(Boolean) as string[]

    const correctHypotheses = analysis.hypotheses
      .filter(h => selectedHypotheses.has(h.id))
      .map(h => h.id)
    
    const incorrectHypotheses = analysis.hypotheses
      .filter(h => !selectedHypotheses.has(h.id))
      .map(h => h.id)

    const correctAnomalies = analysis.anomalies
      .filter(a => selectedAnomalies.has(a.id))
      .map(a => a.id)
    
    const incorrectAnomalies = analysis.anomalies
      .filter(a => !selectedAnomalies.has(a.id))
      .map(a => a.id)

    const outcome: CaseOutcome = {
      caseId: caseData.id,
      verified,
      accuracy,
      correctInsights,
      incorrectInsights,
      correctHypotheses,
      incorrectHypotheses,
      correctAnomalies,
      incorrectAnomalies,
      actualOutcome,
      solvedBy: solvedBy || undefined,
      notes: notes || undefined,
      verifiedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outcome),
      })

      if (!response.ok) throw new Error('Failed to submit feedback')

      onFeedbackSubmitted()
      onClose()
    } catch (error) {
      console.error('Feedback submission error:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-detective-secondary border-b border-detective-light p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-detective-accent" />
            <h2 className="text-2xl font-bold text-white">Provide Feedback - Help AI Learn</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-detective-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Accuracy */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Overall Analysis Accuracy: {accuracy}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={accuracy}
              onChange={(e) => setAccuracy(Number(e.target.value))}
              className="w-full h-2 bg-detective-darker rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Verify Insights */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Verify Insights</h3>
            <div className="space-y-2">
              {analysis.insights.map((insight, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleInsight(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedInsights.has(idx)
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-detective-darker/50 border-detective-light hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedInsights.has(idx) ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-gray-300 text-sm">{insight}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Verify Hypotheses */}
          {analysis.hypotheses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Verify Hypotheses</h3>
              <div className="space-y-2">
                {analysis.hypotheses.map((hypothesis) => (
                  <button
                    key={hypothesis.id}
                    onClick={() => toggleHypothesis(hypothesis.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedHypotheses.has(hypothesis.id)
                        ? 'bg-green-500/20 border-green-500/50'
                        : 'bg-detective-darker/50 border-detective-light hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {selectedHypotheses.has(hypothesis.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{hypothesis.title}</div>
                        <div className="text-gray-400 text-xs mt-1">{hypothesis.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verify Anomalies */}
          {analysis.anomalies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Verify Anomalies</h3>
              <div className="space-y-2">
                {analysis.anomalies.map((anomaly) => (
                  <button
                    key={anomaly.id}
                    onClick={() => toggleAnomaly(anomaly.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedAnomalies.has(anomaly.id)
                        ? 'bg-green-500/20 border-green-500/50'
                        : 'bg-detective-darker/50 border-detective-light hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {selectedAnomalies.has(anomaly.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{anomaly.description}</div>
                        <div className="text-gray-400 text-xs mt-1">Severity: {anomaly.severity}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Case Outcome */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Case Outcome</label>
            <select
              value={actualOutcome}
              onChange={(e) => setActualOutcome(e.target.value as any)}
              className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white focus:outline-none focus:border-detective-accent"
            >
              <option value="ongoing">Ongoing</option>
              <option value="solved">Solved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {actualOutcome === 'solved' && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                What solved the case? (Optional)
              </label>
              <input
                type="text"
                value={solvedBy}
                onChange={(e) => setSolvedBy(e.target.value)}
                className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
                placeholder="e.g., DNA evidence, new witness, etc."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent min-h-[100px]"
              placeholder="Any additional feedback or corrections..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-detective-light hover:bg-detective-light/80 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
