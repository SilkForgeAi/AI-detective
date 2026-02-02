// Accuracy tracking and performance monitoring

import { CaseAnalysis, Hypothesis, Anomaly } from '@/types/case'
import { CaseOutcome } from './feedbackSystem'

export interface AccuracyMetrics {
  caseId: string
  timestamp: string
  overallAccuracy: number
  componentAccuracy: {
    insights: number
    hypotheses: number
    anomalies: number
    patterns: number
  }
  confidenceCalibration: {
    highConfidence: { predicted: number; actual: number }
    mediumConfidence: { predicted: number; actual: number }
    lowConfidence: { predicted: number; actual: number }
  }
}

export class AccuracyTracker {
  private metrics: AccuracyMetrics[] = []

  calculateAccuracy(
    analysis: CaseAnalysis,
    outcome: CaseOutcome
  ): AccuracyMetrics {
    // Calculate accuracy for each component
    const insightAccuracy = this.calculateInsightAccuracy(
      analysis.insights || [],
      outcome
    )
    const hypothesisAccuracy = this.calculateHypothesisAccuracy(
      analysis.hypotheses || [],
      outcome
    )
    const anomalyAccuracy = this.calculateAnomalyAccuracy(
      analysis.anomalies || [],
      outcome
    )
    const patternAccuracy = this.calculatePatternAccuracy(
      analysis.patterns || [],
      outcome
    )

    // Overall accuracy (weighted average)
    const overallAccuracy = Math.round(
      (insightAccuracy * 0.25) +
      (hypothesisAccuracy * 0.3) +
      (anomalyAccuracy * 0.25) +
      (patternAccuracy * 0.2)
    )

    // Confidence calibration
    const confidenceCalibration = this.calculateConfidenceCalibration(
      analysis,
      outcome
    )

    const metrics: AccuracyMetrics = {
      caseId: analysis.caseId,
      timestamp: new Date().toISOString(),
      overallAccuracy,
      componentAccuracy: {
        insights: insightAccuracy,
        hypotheses: hypothesisAccuracy,
        anomalies: anomalyAccuracy,
        patterns: this.calculatePatternAccuracy(analysis, outcome),
      },
      confidenceCalibration,
    }

    this.metrics.push(metrics)
    return metrics
  }

  private calculateInsightAccuracy(
    insights: string[],
    outcome: CaseOutcome
  ): number {
    if (insights.length === 0) return 0

    const correct = outcome.correctInsights?.length || 0
    const incorrect = outcome.incorrectInsights?.length || 0
    const total = correct + incorrect

    if (total === 0) return 50 // Unknown accuracy

    return Math.round((correct / total) * 100)
  }

  private calculateHypothesisAccuracy(
    hypotheses: Hypothesis[],
    outcome: CaseOutcome
  ): number {
    if (hypotheses.length === 0) return 0

    const correct = outcome.correctHypotheses?.length || 0
    const incorrect = outcome.incorrectHypotheses?.length || 0
    const total = correct + incorrect

    if (total === 0) {
      // Estimate based on confidence scores if no feedback
      const avgConfidence = hypotheses.reduce((sum, h) => sum + h.confidence, 0) / hypotheses.length
      return Math.round(avgConfidence * 0.8) // Conservative estimate
    }

    return Math.round((correct / total) * 100)
  }

  private calculateAnomalyAccuracy(
    anomalies: Anomaly[],
    outcome: CaseOutcome
  ): number {
    if (anomalies.length === 0) return 0

    const correct = outcome.correctAnomalies?.length || 0
    const incorrect = outcome.incorrectAnomalies?.length || 0
    const total = correct + incorrect

    if (total === 0) {
      // Estimate based on severity
      const highSeverity = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical').length
      return Math.round(60 + (highSeverity / anomalies.length) * 30) // Higher severity = more likely correct
    }

    return Math.round((correct / total) * 100)
  }

  private calculatePatternAccuracy(
    patterns: any[],
    outcome: CaseOutcome
  ): number {
    if (patterns.length === 0) return 0

    const metrics = calculatePatternAccuracy(patterns, outcome)
    return metrics.accuracy
  }

  private calculateConfidenceCalibration(
    analysis: CaseAnalysis,
    outcome: CaseOutcome
  ): AccuracyMetrics['confidenceCalibration'] {
    // Group hypotheses by confidence
    const highConf = analysis.hypotheses?.filter(h => h.confidence >= 70) || []
    const mediumConf = analysis.hypotheses?.filter(h => h.confidence >= 50 && h.confidence < 70) || []
    const lowConf = analysis.hypotheses?.filter(h => h.confidence < 50) || []

    const getActualAccuracy = (hypotheses: Hypothesis[]): number => {
      if (hypotheses.length === 0) return 0
      const correct = hypotheses.filter(h => 
        outcome.correctHypotheses?.includes(h.id)
      ).length
      return Math.round((correct / hypotheses.length) * 100)
    }

    return {
      highConfidence: {
        predicted: highConf.length > 0 ? Math.round(highConf.reduce((s, h) => s + h.confidence, 0) / highConf.length) : 0,
        actual: getActualAccuracy(highConf),
      },
      mediumConfidence: {
        predicted: mediumConf.length > 0 ? Math.round(mediumConf.reduce((s, h) => s + h.confidence, 0) / mediumConf.length) : 0,
        actual: getActualAccuracy(mediumConf),
      },
      lowConfidence: {
        predicted: lowConf.length > 0 ? Math.round(lowConf.reduce((s, h) => s + h.confidence, 0) / lowConf.length) : 0,
        actual: getActualAccuracy(lowConf),
      },
    }
  }

  getAverageAccuracy(): number {
    if (this.metrics.length === 0) return 0
    const sum = this.metrics.reduce((s, m) => s + m.overallAccuracy, 0)
    return Math.round(sum / this.metrics.length)
  }

  getAccuracyTrend(): number[] {
    return this.metrics.map(m => m.overallAccuracy)
  }

  getMetrics(): AccuracyMetrics[] {
    return [...this.metrics]
  }
}

export const accuracyTracker = new AccuracyTracker()
