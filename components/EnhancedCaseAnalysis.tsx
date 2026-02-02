'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, Clock, FileText, TrendingUp, AlertCircle, CheckCircle, 
  Loader2, MapPin, Target, Lightbulb, BarChart3, Shield, 
  ChevronDown, ChevronUp, ExternalLink 
} from 'lucide-react'
import { Case, Hypothesis, Anomaly, PatternMatch } from '@/types/case'
import FeedbackModal from './FeedbackModal'
import ReasoningViewer from './ReasoningViewer'
import IntelligentPatterns from './IntelligentPatterns'
import CaseComments from './CaseComments'
import MapViewer from './MapViewer'
import { ReasoningChain } from '@/lib/reasoning/reasoningEngine'

interface EnhancedCaseAnalysisProps {
  caseData: Case
  onAnalyze: (caseId: string) => void
  currentUser?: { id: string; name: string; email: string; role: string } | null
}

export default function EnhancedCaseAnalysis({ caseData, onAnalyze, currentUser = null }: EnhancedCaseAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['insights']))
  const [showFeedback, setShowFeedback] = useState(false)

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await onAnalyze(caseData.id)
    setIsAnalyzing(false)
  }

  const analysis = caseData.analysis
  const hasAnalysis = analysis && (analysis.insights?.length > 0 || analysis.hypotheses?.length > 0)
  const reasoningChain = (analysis as any)?._reasoningChain as ReasoningChain | undefined

  return (
    <div className="space-y-6">
      {/* Case Header */}
      <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
        <div className="flex items-start justify-between mb-4">
          {currentUser && (
            <div className="flex items-center gap-2">
              <CaseBookmarks
                caseId={caseData.id}
                userId={currentUser.id}
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{caseData.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {caseData.date}
              </div>
              {caseData.jurisdiction && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {caseData.jurisdiction}
                </div>
              )}
              {caseData.caseNumber && (
                <span className="text-gray-500">Case #{caseData.caseNumber}</span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                caseData.status === 'solved' ? 'bg-green-500/20 text-green-400' :
                caseData.status === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                caseData.status === 'cold' ? 'bg-gray-500/20 text-gray-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {caseData.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {hasAnalysis && (
              <button
                onClick={() => setShowFeedback(true)}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Provide Feedback
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || caseData.status === 'analyzing'}
              className="flex items-center gap-2 px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors shadow-lg shadow-detective-accent/20"
            >
              {isAnalyzing || caseData.status === 'analyzing' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Run AI Analysis
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">{caseData.description}</p>
      </div>

      {/* Confidence Scores */}
      {analysis?.confidenceScores && (
        <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-detective-accent" />
            <h2 className="text-xl font-bold text-white">Confidence Scores</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
              <div className="text-sm text-gray-400 mb-1">Overall</div>
              <div className="text-2xl font-bold text-white">{analysis.confidenceScores.overall}%</div>
            </div>
            <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
              <div className="text-sm text-gray-400 mb-1">Evidence Quality</div>
              <div className="text-2xl font-bold text-white">{analysis.confidenceScores.evidenceQuality}%</div>
            </div>
            <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
              <div className="text-sm text-gray-400 mb-1">Witness Reliability</div>
              <div className="text-2xl font-bold text-white">{analysis.confidenceScores.witnessReliability}%</div>
            </div>
            <div className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
              <div className="text-sm text-gray-400 mb-1">Forensic Strength</div>
              <div className="text-2xl font-bold text-white">{analysis.confidenceScores.forensicStrength}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Section */}
      <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-detective-accent" />
          <h2 className="text-xl font-bold text-white">Evidence</h2>
          <span className="text-sm text-gray-400">({caseData.evidence.length} items)</span>
        </div>
        <div className="space-y-2">
          {caseData.evidence.length > 0 ? (
            caseData.evidence.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-detective-darker/50 rounded-lg border border-detective-light flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                      {item.type.replace('_', ' ')}
                    </span>
                    {item.date && (
                      <span className="text-xs text-gray-500">{item.date}</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                  {item.source && (
                    <p className="text-xs text-gray-500 mt-1">Source: {item.source}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No evidence items listed</p>
          )}
        </div>
      </div>

      {/* Reasoning Chain */}
      {reasoningChain && (
        <>
          <SectionHeader
            title="Advanced Reasoning (10/10)"
            icon={Brain}
            count={reasoningChain.steps.length}
            expanded={expandedSections.has('reasoning')}
            onToggle={() => toggleSection('reasoning')}
          />
          {expandedSections.has('reasoning') && (
            <ReasoningViewer reasoningChain={reasoningChain} />
          )}
        </>
      )}

      {/* AI Insights */}
      {hasAnalysis && (
        <>
          <SectionHeader
            title="AI Insights"
            icon={TrendingUp}
            count={analysis?.insights?.length || 0}
            expanded={expandedSections.has('insights')}
            onToggle={() => toggleSection('insights')}
          />
          {expandedSections.has('insights') && analysis?.insights && (
            <div className="bg-gradient-to-br from-detective-accent/10 to-detective-secondary/50 rounded-xl p-6 border border-detective-accent/30 space-y-3">
              {analysis.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-detective-darker/50 rounded-lg border border-detective-accent/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-detective-accent mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200 leading-relaxed flex-1">{insight}</p>
                </div>
              ))}
            </div>
          )}

          {/* Hypotheses */}
          {analysis?.hypotheses && analysis.hypotheses.length > 0 && (
            <>
              <SectionHeader
                title="Hypotheses"
                icon={Lightbulb}
                count={analysis.hypotheses.length}
                expanded={expandedSections.has('hypotheses')}
                onToggle={() => toggleSection('hypotheses')}
              />
              {expandedSections.has('hypotheses') && (
                <div className="space-y-4">
                  {analysis.hypotheses.map((hypothesis) => (
                    <HypothesisCard key={hypothesis.id} hypothesis={hypothesis} />
                  ))}
                </div>
              )}
            </>
          )}

      {/* Intelligent Patterns */}
      {analysis?.intelligentPatterns && analysis.intelligentPatterns.length > 0 && (
        <>
          <SectionHeader
            title="Intelligent Pattern Analysis"
            icon={TrendingUp}
            count={analysis.intelligentPatterns.length}
            expanded={expandedSections.has('intelligent-patterns')}
            onToggle={() => toggleSection('intelligent-patterns')}
          />
          {expandedSections.has('intelligent-patterns') && (
            <IntelligentPatterns
              patterns={analysis.intelligentPatterns}
              serialOffenderProbability={analysis.confidenceScores?.serialOffenderProbability}
            />
          )}
        </>
      )}

      {/* Pattern Matches */}
      {analysis?.patterns && analysis.patterns.length > 0 && (
        <>
          <SectionHeader
            title="Pattern Matches"
            icon={Target}
            count={analysis.patterns.length}
            expanded={expandedSections.has('patterns')}
            onToggle={() => toggleSection('patterns')}
          />
          {expandedSections.has('patterns') && (
            <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary space-y-3">
              {analysis.patterns.map((pattern, index) => (
                <PatternMatchCard key={index} pattern={pattern} />
              ))}
            </div>
          )}
        </>
      )}

          {/* Anomalies */}
          {analysis?.anomalies && analysis.anomalies.length > 0 && (
            <>
              <SectionHeader
                title="Anomalies Detected"
                icon={AlertCircle}
                count={analysis.anomalies.length}
                expanded={expandedSections.has('anomalies')}
                onToggle={() => toggleSection('anomalies')}
              />
              {expandedSections.has('anomalies') && (
                <div className="space-y-3">
                  {analysis.anomalies.map((anomaly) => (
                    <AnomalyCard key={anomaly.id} anomaly={anomaly} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Recommendations */}
          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <>
              <SectionHeader
                title="Recommendations"
                icon={CheckCircle}
                count={analysis.recommendations.length}
                expanded={expandedSections.has('recommendations')}
                onToggle={() => toggleSection('recommendations')}
              />
              {expandedSections.has('recommendations') && (
                <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-detective-darker/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Locations / 3D Globe */}
          {analysis?.locations && analysis.locations.length > 0 && (
            <>
              <SectionHeader
                title="Case Locations"
                icon={MapPin}
                count={analysis.locations.length}
                expanded={expandedSections.has('locations')}
                onToggle={() => toggleSection('locations')}
              />
              {expandedSections.has('locations') && (
                <MapViewer locations={analysis.locations} caseTitle={caseData.title} />
              )}
            </>
          )}

          {/* Ethical Safeguards Notice */}
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Human Verification Required</h3>
              <p className="text-xs text-gray-400 mb-2">
                All AI-generated insights are suggestions requiring human verification. 
                This analysis is based on public data only and should be reviewed by qualified investigators.
              </p>
              <p className="text-xs text-yellow-300/90 font-semibold">
                ⚠️ If you discover any new information, report it to local authorities immediately. Do NOT take matters into your own hands.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Analysis Prompt */}
      {!hasAnalysis && caseData.status !== 'analyzing' && (
        <div className="bg-detective-secondary/30 rounded-xl p-8 border border-detective-secondary text-center">
          <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Ready for AI Analysis
          </h3>
          <p className="text-gray-400 mb-4">
            Click "Run AI Analysis" to let our AI detective analyze this case and uncover hidden patterns, connections, and insights.
          </p>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && analysis && (
        <FeedbackModal
          caseData={caseData}
          analysis={analysis}
          onClose={() => setShowFeedback(false)}
          onFeedbackSubmitted={() => {
            setShowFeedback(false)
            // Could refresh metrics or show success message
          }}
        />
      )}
    </div>
  )
}

function SectionHeader({ 
  title, 
  icon: Icon, 
  count, 
  expanded, 
  onToggle 
}: { 
  title: string
  icon: any
  count: number
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full bg-detective-secondary/50 rounded-xl p-4 border border-detective-secondary flex items-center justify-between hover:bg-detective-secondary/70 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-detective-accent" />
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <span className="text-sm text-gray-400">({count})</span>
      </div>
      {expanded ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  )
}

function HypothesisCard({ hypothesis }: { hypothesis: Hypothesis }) {
  const confidenceColor = 
    hypothesis.confidence >= 70 ? 'text-green-400' :
    hypothesis.confidence >= 50 ? 'text-yellow-400' : 'text-orange-400'

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{hypothesis.title}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${confidenceColor} bg-opacity-20`}>
          {hypothesis.confidence}% confidence
        </div>
      </div>
      <p className="text-gray-300 mb-4">{hypothesis.description}</p>
      {hypothesis.recommendedActions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-detective-light">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Recommended Actions:</h4>
          <ul className="space-y-1">
            {hypothesis.recommendedActions.map((action, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-detective-accent mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function PatternMatchCard({ pattern }: { pattern: PatternMatch }) {
  return (
    <div className="p-4 bg-detective-darker/50 rounded-lg border border-detective-light">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-white">{pattern.caseTitle}</h4>
          <p className="text-xs text-gray-400 mt-1">Case ID: {pattern.caseId}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-detective-accent">
            {Math.round(pattern.similarityScore * 100)}%
          </div>
          <div className="text-xs text-gray-400">similarity</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {pattern.matchingFactors.map((factor, idx) => (
          <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
            {factor}
          </span>
        ))}
      </div>
    </div>
  )
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const severityColors = {
    critical: 'border-red-500/50 bg-red-500/10',
    high: 'border-orange-500/50 bg-orange-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-blue-500/50 bg-blue-500/10',
  }

  return (
    <div className={`rounded-xl p-4 border ${severityColors[anomaly.severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-5 h-5 ${
            anomaly.severity === 'critical' ? 'text-red-400' :
            anomaly.severity === 'high' ? 'text-orange-400' :
            anomaly.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
          }`} />
          <h4 className="font-semibold text-white">{anomaly.type.replace('_', ' ').toUpperCase()}</h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-semibold ${
          anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
          anomaly.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
          anomaly.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {anomaly.severity}
        </span>
      </div>
      <p className="text-gray-300 text-sm mb-3">{anomaly.description}</p>
      {anomaly.suggestedInvestigation.length > 0 && (
        <div className="mt-3 pt-3 border-t border-opacity-20">
          <h5 className="text-xs font-semibold text-gray-400 mb-2">Suggested Investigation:</h5>
          <ul className="space-y-1">
            {anomaly.suggestedInvestigation.map((action, idx) => (
              <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
