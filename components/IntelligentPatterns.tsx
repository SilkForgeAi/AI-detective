'use client'

import { useState } from 'react'
import { 
  Target, MapPin, Clock, Link2, AlertTriangle, 
  TrendingUp, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react'
import { IntelligentPattern } from '@/types/case'

interface IntelligentPatternsProps {
  patterns: IntelligentPattern[]
  serialOffenderProbability?: number
}

export default function IntelligentPatterns({ patterns, serialOffenderProbability }: IntelligentPatternsProps) {
  const [expandedPatterns, setExpandedPatterns] = useState<Set<string>>(new Set())

  const togglePattern = (id: string) => {
    const newSet = new Set(expandedPatterns)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedPatterns(newSet)
  }

  const getPatternIcon = (type: IntelligentPattern['type']) => {
    switch (type) {
      case 'serial_offender': return <Target className="w-5 h-5 text-red-400" />
      case 'geographic_cluster': return <MapPin className="w-5 h-5 text-blue-400" />
      case 'temporal_series': return <Clock className="w-5 h-5 text-yellow-400" />
      case 'evidence_chain': return <Link2 className="w-5 h-5 text-purple-400" />
      case 'suspect_link': return <AlertTriangle className="w-5 h-5 text-orange-400" />
      default: return <TrendingUp className="w-5 h-5 text-gray-400" />
    }
  }

  const getRiskColor = (risk: IntelligentPattern['riskLevel']) => {
    switch (risk) {
      case 'critical': return 'border-red-500/50 bg-red-500/10'
      case 'high': return 'border-orange-500/50 bg-orange-500/10'
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10'
      case 'low': return 'border-blue-500/50 bg-blue-500/10'
    }
  }

  if (patterns.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Serial Offender Probability */}
      {serialOffenderProbability !== undefined && serialOffenderProbability > 0 && (
        <div className={`rounded-xl p-6 border ${
          serialOffenderProbability >= 70 
            ? 'border-red-500/50 bg-red-500/10' 
            : serialOffenderProbability >= 50
            ? 'border-orange-500/50 bg-orange-500/10'
            : 'border-yellow-500/50 bg-yellow-500/10'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-6 h-6 ${
                serialOffenderProbability >= 70 ? 'text-red-400' :
                serialOffenderProbability >= 50 ? 'text-orange-400' :
                'text-yellow-400'
              }`} />
              <h3 className="text-lg font-bold text-white">Serial Offender Probability</h3>
            </div>
            <div className={`text-3xl font-bold ${
              serialOffenderProbability >= 70 ? 'text-red-400' :
              serialOffenderProbability >= 50 ? 'text-orange-400' :
              'text-yellow-400'
            }`}>
              {serialOffenderProbability}%
            </div>
          </div>
          <p className="text-sm text-gray-300">
            {serialOffenderProbability >= 70 
              ? 'HIGH PROBABILITY: Strong indicators suggest serial offender activity. Immediate task force coordination recommended.'
              : serialOffenderProbability >= 50
              ? 'MODERATE PROBABILITY: Patterns suggest possible serial offender. Coordinate investigation across cases.'
              : 'LOW PROBABILITY: Some patterns detected but insufficient evidence for serial offender conclusion.'
            }
          </p>
        </div>
      )}

      {/* Intelligent Patterns */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-detective-accent" />
          Intelligent Pattern Analysis
        </h3>
        <div className="space-y-3">
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`rounded-lg border ${getRiskColor(pattern.riskLevel)} transition-all`}
            >
              <button
                onClick={() => togglePattern(pattern.id)}
                className="w-full p-4 flex items-start justify-between hover:bg-opacity-20 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getPatternIcon(pattern.type)}</div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{pattern.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        pattern.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                        pattern.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        pattern.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {pattern.riskLevel}
                      </span>
                      <span className="text-xs text-gray-400">
                        {pattern.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{pattern.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{pattern.cases.length} cases</span>
                      <span>•</span>
                      <span>{pattern.indicators.length} indicators</span>
                    </div>
                  </div>
                </div>
                {expandedPatterns.has(pattern.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                )}
              </button>

              {expandedPatterns.has(pattern.id) && (
                <div className="px-4 pb-4 pt-0 border-t border-opacity-20 mt-2">
                  <div className="mt-3 space-y-3">
                    {/* Indicators */}
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-2">Key Indicators:</div>
                      <ul className="space-y-1">
                        {pattern.indicators.map((indicator, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-detective-accent mt-1">•</span>
                            <span>{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-2">Recommendations:</div>
                      <ul className="space-y-1">
                        {pattern.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
