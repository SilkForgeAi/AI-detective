// Feedback and learning system for continuous improvement

import { Case, CaseAnalysis, Hypothesis, Anomaly } from '@/types/case'
import { calculatePatternAccuracy } from '@/lib/analysis/patternAccuracy'

export interface CaseOutcome {
  caseId: string
  verified: boolean
  accuracy: number // 0-100
  correctInsights: string[]
  incorrectInsights: string[]
  correctHypotheses: string[]
  incorrectHypotheses: string[]
  correctAnomalies: string[]
  incorrectAnomalies: string[]
  actualOutcome?: 'solved' | 'closed' | 'ongoing'
  solvedBy?: string // What actually solved it
  notes?: string
  verifiedBy?: string
  verifiedAt: string
}

export interface LearningMetrics {
  totalCases: number
  verifiedCases: number
  averageAccuracy: number
  accuracyByCategory: {
    insights: number
    hypotheses: number
    anomalies: number
    patterns: number
  }
  improvementTrend: number[] // Accuracy over time
  commonMistakes: Array<{
    type: string
    count: number
    description: string
  }>
}

export interface TrainingExample {
  input: {
    case: Case
    context: string
  }
  output: {
    insights: string[]
    hypotheses: Hypothesis[]
    anomalies: Anomaly[]
  }
  feedback: {
    accuracy: number
    corrections: string[]
  }
  timestamp: string
}

class FeedbackSystem {
  private outcomes: Map<string, CaseOutcome> = new Map()
  private trainingExamples: TrainingExample[] = []

  recordOutcome(outcome: CaseOutcome): void {
    this.outcomes.set(outcome.caseId, outcome)
    // Store in localStorage for persistence (in browser)
    if (typeof window !== 'undefined') {
      const stored = this.getStoredOutcomes()
      stored[outcome.caseId] = outcome
      localStorage.setItem('ai-detective-outcomes', JSON.stringify(stored))
    }
  }

  getOutcome(caseId: string): CaseOutcome | undefined {
    if (typeof window !== 'undefined') {
      const stored = this.getStoredOutcomes()
      return stored[caseId] || this.outcomes.get(caseId)
    }
    return this.outcomes.get(caseId)
  }

  getAllOutcomes(): CaseOutcome[] {
    if (typeof window !== 'undefined') {
      return Object.values(this.getStoredOutcomes())
    }
    return Array.from(this.outcomes.values())
  }

  private getStoredOutcomes(): Record<string, CaseOutcome> {
    if (typeof window === 'undefined') return {}
    try {
      const stored = localStorage.getItem('ai-detective-outcomes')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  calculateMetrics(): LearningMetrics {
    const outcomes = this.getAllOutcomes()
    const verified = outcomes.filter(o => o.verified)

    if (verified.length === 0) {
      return {
        totalCases: outcomes.length,
        verifiedCases: 0,
        averageAccuracy: 0,
        accuracyByCategory: {
          insights: 0,
          hypotheses: 0,
          anomalies: 0,
          patterns: 0,
        },
        improvementTrend: [],
        commonMistakes: [],
      }
    }

    const avgAccuracy = verified.reduce((sum, o) => sum + o.accuracy, 0) / verified.length

    // Calculate accuracy by category
    const insightAccuracy = this.calculateCategoryAccuracy(verified, 'insights')
    const hypothesisAccuracy = this.calculateCategoryAccuracy(verified, 'hypotheses')
    const anomalyAccuracy = this.calculateCategoryAccuracy(verified, 'anomalies')

    // Improvement trend (last 10 cases)
    const recentOutcomes = verified.slice(-10)
    const improvementTrend = recentOutcomes.map(o => o.accuracy)

    // Common mistakes
    const mistakes = this.identifyCommonMistakes(verified)

    return {
      totalCases: outcomes.length,
      verifiedCases: verified.length,
      averageAccuracy: Math.round(avgAccuracy),
      accuracyByCategory: {
        insights: insightAccuracy,
        hypotheses: hypothesisAccuracy,
        anomalies: anomalyAccuracy,
        patterns: this.calculatePatternAccuracy(outcomes),
      },
      improvementTrend,
      commonMistakes: mistakes,
    }
  }

  private calculateCategoryAccuracy(
    outcomes: CaseOutcome[],
    category: 'insights' | 'hypotheses' | 'anomalies'
  ): number {
    let total = 0
    let correct = 0

    outcomes.forEach(outcome => {
      const correctItems = outcome[`correct${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof CaseOutcome] as string[]
      const incorrectItems = outcome[`incorrect${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof CaseOutcome] as string[]

      total += (correctItems?.length || 0) + (incorrectItems?.length || 0)
      correct += correctItems?.length || 0
    })

    return total > 0 ? Math.round((correct / total) * 100) : 0
  }

  private calculatePatternAccuracy(outcomes: CaseOutcome[]): number {
    // Extract pattern accuracy from notes or calculate from outcomes
    let totalPatterns = 0
    let correctPatterns = 0

    outcomes.forEach(outcome => {
      // Try to extract pattern info from notes
      const patternMatch = outcome.notes?.match(/Pattern Accuracy: (\d+)% \((\d+)\/(\d+)\)/)
      if (patternMatch) {
        const accuracy = parseInt(patternMatch[1])
        const correct = parseInt(patternMatch[2])
        const total = parseInt(patternMatch[3])
        totalPatterns += total
        correctPatterns += correct
      }
    })

    return totalPatterns > 0 ? Math.round((correctPatterns / totalPatterns) * 100) : 0
  }

  private identifyCommonMistakes(outcomes: CaseOutcome[]): Array<{ type: string; count: number; description: string }> {
    const mistakeTypes: Record<string, { count: number; description: string }> = {}

    outcomes.forEach(outcome => {
      // Analyze incorrect insights
      outcome.incorrectInsights?.forEach(insight => {
        const type = this.categorizeMistake(insight)
        if (!mistakeTypes[type]) {
          mistakeTypes[type] = { count: 0, description: type }
        }
        mistakeTypes[type].count++
      })

      // Analyze incorrect hypotheses
      outcome.incorrectHypotheses?.forEach(hyp => {
        const type = 'Incorrect Hypothesis'
        if (!mistakeTypes[type]) {
          mistakeTypes[type] = { count: 0, description: type }
        }
        mistakeTypes[type].count++
      })
    })

    return Object.values(mistakeTypes)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private categorizeMistake(insight: string): string {
    const lower = insight.toLowerCase()
    if (lower.includes('pattern') || lower.includes('similar')) return 'Pattern Matching Error'
    if (lower.includes('timeline') || lower.includes('date')) return 'Timeline Error'
    if (lower.includes('evidence') || lower.includes('forensic')) return 'Evidence Interpretation Error'
    if (lower.includes('witness') || lower.includes('statement')) return 'Witness Analysis Error'
    return 'General Analysis Error'
  }

  createTrainingExample(
    caseData: Case,
    analysis: CaseAnalysis,
    outcome: CaseOutcome
  ): TrainingExample {
    return {
      input: {
        case: caseData,
        context: `Case from ${caseData.date} in ${caseData.jurisdiction || 'unknown jurisdiction'}`,
      },
      output: {
        insights: analysis.insights || [],
        hypotheses: analysis.hypotheses || [],
        anomalies: analysis.anomalies || [],
      },
      feedback: {
        accuracy: outcome.accuracy,
        corrections: [
          ...(outcome.incorrectInsights || []).map(i => `Incorrect: ${i}`),
          ...(outcome.correctInsights || []).map(i => `Correct: ${i}`),
        ],
      },
      timestamp: new Date().toISOString(),
    }
  }

  addTrainingExample(example: TrainingExample): void {
    this.trainingExamples.push(example)
    // Store for future fine-tuning
    if (typeof window !== 'undefined') {
      const stored = this.getStoredTrainingExamples()
      stored.push(example)
      localStorage.setItem('ai-detective-training', JSON.stringify(stored.slice(-100))) // Keep last 100
    }
  }

  getTrainingExamples(): TrainingExample[] {
    if (typeof window !== 'undefined') {
      return this.getStoredTrainingExamples()
    }
    return this.trainingExamples
  }

  private getStoredTrainingExamples(): TrainingExample[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('ai-detective-training')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  generateLearningPrompt(metrics: LearningMetrics): string {
    return `You are an AI detective learning from past cases. Here's your performance:

Overall Accuracy: ${metrics.averageAccuracy}%
Insight Accuracy: ${metrics.accuracyByCategory.insights}%
Hypothesis Accuracy: ${metrics.accuracyByCategory.hypotheses}%
Anomaly Accuracy: ${metrics.accuracyByCategory.anomalies}%

Common Mistakes:
${metrics.commonMistakes.map(m => `- ${m.description}: ${m.count} occurrences`).join('\n')}

Recent Accuracy Trend: ${metrics.improvementTrend.join('%, ')}%

Based on this feedback, adjust your analysis approach to improve accuracy. Focus on:
1. Avoiding the common mistakes identified
2. Being more conservative with low-confidence findings
3. Cross-referencing patterns more carefully
4. Validating anomalies before flagging them`
  }
}

export const feedbackSystem = new FeedbackSystem()
