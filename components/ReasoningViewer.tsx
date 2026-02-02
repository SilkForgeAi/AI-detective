'use client'

import { useState } from 'react'
import { 
  Brain, ChevronDown, ChevronUp, CheckCircle, XCircle, 
  AlertCircle, Lightbulb, Eye, Target, TrendingUp 
} from 'lucide-react'
import { ReasoningChain, ReasoningStep } from '@/lib/reasoning/reasoningEngine'

interface ReasoningViewerProps {
  reasoningChain: ReasoningChain
}

export default function ReasoningViewer({ reasoningChain }: ReasoningViewerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1, 2, 3]))
  const [showReflection, setShowReflection] = useState(true)

  const toggleStep = (stepNum: number) => {
    const newSet = new Set(expandedSteps)
    if (newSet.has(stepNum)) {
      newSet.delete(stepNum)
    } else {
      newSet.add(stepNum)
    }
    setExpandedSteps(newSet)
  }

  const getStepIcon = (type: ReasoningStep['type']) => {
    switch (type) {
      case 'observation': return <Eye className="w-4 h-4 text-blue-400" />
      case 'inference': return <Brain className="w-4 h-4 text-purple-400" />
      case 'hypothesis': return <Lightbulb className="w-4 h-4 text-yellow-400" />
      case 'validation': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'conclusion': return <Target className="w-4 h-4 text-detective-accent" />
      case 'reflection': return <TrendingUp className="w-4 h-4 text-orange-400" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStepColor = (type: ReasoningStep['type']) => {
    switch (type) {
      case 'observation': return 'border-blue-500/30 bg-blue-500/10'
      case 'inference': return 'border-purple-500/30 bg-purple-500/10'
      case 'hypothesis': return 'border-yellow-500/30 bg-yellow-500/10'
      case 'validation': return 'border-green-500/30 bg-green-500/10'
      case 'conclusion': return 'border-detective-accent/30 bg-detective-accent/10'
      case 'reflection': return 'border-orange-500/30 bg-orange-500/10'
      default: return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 9) return 'text-green-400'
    if (quality >= 7) return 'text-yellow-400'
    if (quality >= 5) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Reasoning Quality Header */}
      <div className="bg-gradient-to-r from-detective-accent/20 to-blue-500/20 rounded-xl p-6 border border-detective-accent/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-detective-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Reasoning Chain</h2>
              <p className="text-sm text-gray-400">Step-by-step analysis with self-reflection</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getQualityColor(reasoningChain.reasoningQuality)}`}>
              {reasoningChain.reasoningQuality}/10
            </div>
            <div className="text-sm text-gray-400">Reasoning Quality</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-detective-darker/50 rounded-lg p-3 border border-detective-light">
            <div className="text-xs text-gray-400 mb-1">Steps</div>
            <div className="text-xl font-bold text-white">{reasoningChain.steps.length}</div>
          </div>
          <div className="bg-detective-darker/50 rounded-lg p-3 border border-detective-light">
            <div className="text-xs text-gray-400 mb-1">Confidence</div>
            <div className="text-xl font-bold text-white">{reasoningChain.overallConfidence}%</div>
          </div>
          <div className="bg-detective-darker/50 rounded-lg p-3 border border-detective-light">
            <div className="text-xs text-gray-400 mb-1">Validated</div>
            <div className="text-xl font-bold text-white">
              {reasoningChain.validated ? (
                <span className="text-green-400">✓</span>
              ) : (
                <span className="text-yellow-400">~</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning Steps */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-detective-accent" />
          Reasoning Steps
        </h3>
        {reasoningChain.steps.map((step) => (
          <div
            key={step.id}
            className={`rounded-lg border ${getStepColor(step.type)} transition-all`}
          >
            <button
              onClick={() => toggleStep(step.step)}
              className="w-full p-4 flex items-start justify-between hover:bg-opacity-20 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">{getStepIcon(step.type)}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-1 bg-detective-darker/50 rounded border border-detective-light">
                      Step {step.step} - {step.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {step.confidence}% confidence
                    </span>
                    {step.validation && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        step.validation.passed
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {step.validation.passed ? 'Validated' : 'Needs Review'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200 text-sm line-clamp-2">
                    {step.content}
                  </p>
                </div>
              </div>
              {expandedSteps.has(step.step) ? (
                <ChevronUp className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
              )}
            </button>

            {expandedSteps.has(step.step) && (
              <div className="px-4 pb-4 pt-0 border-t border-opacity-20 mt-2">
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Reasoning:</div>
                    <p className="text-sm text-gray-300">{step.reasoning}</p>
                  </div>
                  {step.evidence.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Evidence:</div>
                      <div className="flex flex-wrap gap-2">
                        {step.evidence.map((ev, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {step.alternatives && step.alternatives.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Alternatives Considered:</div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {step.alternatives.map((alt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-500">•</span>
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {step.validation && (
                    <div className={`p-2 rounded border ${
                      step.validation.passed
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Validation:</div>
                      <p className="text-sm text-gray-300">{step.validation.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Self-Reflection */}
      {reasoningChain.selfReflection && (
        <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
          <button
            onClick={() => setShowReflection(!showReflection)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Self-Reflection
            </h3>
            {showReflection ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showReflection && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-green-400 mb-2">Strengths:</div>
                <ul className="space-y-1">
                  {reasoningChain.selfReflection.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-sm font-semibold text-red-400 mb-2">Weaknesses:</div>
                <ul className="space-y-1">
                  {reasoningChain.selfReflection.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-sm font-semibold text-yellow-400 mb-2">Improvements:</div>
                <ul className="space-y-1">
                  {reasoningChain.selfReflection.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-detective-light">
                <div className="text-sm font-semibold text-gray-400 mb-1">Overall Confidence Level:</div>
                <span className={`text-lg font-bold ${
                  reasoningChain.selfReflection.confidenceLevel === 'high' ? 'text-green-400' :
                  reasoningChain.selfReflection.confidenceLevel === 'medium' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {reasoningChain.selfReflection.confidenceLevel.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conclusions */}
      {reasoningChain.conclusions.length > 0 && (
        <div className="bg-gradient-to-br from-detective-accent/10 to-blue-500/10 rounded-xl p-6 border border-detective-accent/30">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-detective-accent" />
            Final Conclusions
          </h3>
          <div className="space-y-2">
            {reasoningChain.conclusions.map((conclusion, idx) => (
              <div
                key={idx}
                className="p-3 bg-detective-darker/50 rounded-lg border border-detective-light"
              >
                <p className="text-gray-200 text-sm">{conclusion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
