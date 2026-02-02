// Self-improvement system that learns from feedback and adjusts analysis

import { Case, CaseAnalysis } from '@/types/case'
import { feedbackSystem, LearningMetrics } from './feedbackSystem'
import { accuracyTracker } from './accuracyTracker'
import { LlamaClient } from '../llm/llamaClient'

export interface ImprovementStrategy {
  focusAreas: string[]
  adjustments: {
    confidenceThreshold: number
    patternMatchingWeight: number
    anomalySensitivity: number
  }
  learnedRules: string[]
}

class SelfImprovementSystem {
  private strategies: ImprovementStrategy[] = []
  private currentStrategy: ImprovementStrategy | null = null

  async analyzeWithLearning(
    caseData: Case,
    allCases: Case[],
    llamaClient?: LlamaClient
  ): Promise<CaseAnalysis> {
    const metrics = feedbackSystem.calculateMetrics()
    const strategy = this.getCurrentStrategy(metrics)

    // Adjust analysis based on learned patterns
    const adjustedAnalysis = await this.applyStrategy(
      caseData,
      allCases,
      strategy,
      metrics,
      llamaClient
    )

    return adjustedAnalysis
  }

  private getCurrentStrategy(metrics: LearningMetrics): ImprovementStrategy {
    if (this.currentStrategy && metrics.verifiedCases > 0) {
      // Refine existing strategy
      return this.refineStrategy(this.currentStrategy, metrics)
    }

    // Create initial strategy
    const strategy: ImprovementStrategy = {
      focusAreas: [],
      adjustments: {
        confidenceThreshold: 60,
        patternMatchingWeight: 0.3,
        anomalySensitivity: 0.7,
      },
      learnedRules: [],
    }

    // Adjust based on common mistakes
    if (metrics.commonMistakes.length > 0) {
      const topMistake = metrics.commonMistakes[0]
      if (topMistake.description.includes('Pattern')) {
        strategy.adjustments.patternMatchingWeight = 0.2 // Be more conservative
        strategy.focusAreas.push('Improve pattern matching validation')
      }
      if (topMistake.description.includes('Timeline')) {
        strategy.focusAreas.push('Enhance timeline analysis')
      }
      if (topMistake.description.includes('Evidence')) {
        strategy.focusAreas.push('Improve evidence interpretation')
      }
    }

    // Adjust confidence threshold based on accuracy
    if (metrics.averageAccuracy < 80) {
      strategy.adjustments.confidenceThreshold = 70 // Require higher confidence
    } else if (metrics.averageAccuracy > 90) {
      strategy.adjustments.confidenceThreshold = 50 // Can be more aggressive
    }

    this.currentStrategy = strategy
    return strategy
  }

  private refineStrategy(
    current: ImprovementStrategy,
    metrics: LearningMetrics
  ): ImprovementStrategy {
    const refined = { ...current }

    // Adjust confidence threshold based on recent performance
    if (metrics.improvementTrend.length >= 3) {
      const recent = metrics.improvementTrend.slice(-3)
      const trend = recent[recent.length - 1] - recent[0]

      if (trend > 5) {
        // Improving - can be slightly more aggressive
        refined.adjustments.confidenceThreshold = Math.max(50, 
          refined.adjustments.confidenceThreshold - 5
        )
      } else if (trend < -5) {
        // Declining - be more conservative
        refined.adjustments.confidenceThreshold = Math.min(80,
          refined.adjustments.confidenceThreshold + 5
        )
      }
    }

    // Learn from common mistakes
    metrics.commonMistakes.forEach(mistake => {
      if (mistake.count >= 3) {
        const rule = `Avoid: ${mistake.description}`
        if (!refined.learnedRules.includes(rule)) {
          refined.learnedRules.push(rule)
        }
      }
    })

    return refined
  }

  private async applyStrategy(
    caseData: Case,
    allCases: Case[],
    strategy: ImprovementStrategy,
    metrics: LearningMetrics,
    llamaClient?: LlamaClient
  ): Promise<CaseAnalysis> {
    // Generate learning-enhanced prompt
    const learningPrompt = feedbackSystem.generateLearningPrompt(metrics)

    // If Llama is available, use it for enhanced analysis
    if (llamaClient) {
      try {
        const enhancedInsights = await this.getLlamaEnhancedInsights(
          caseData,
          strategy,
          learningPrompt,
          llamaClient
        )
        // Merge with standard analysis
        // (This would be integrated into the main analysis flow)
      } catch (error) {
        console.error('Llama enhancement failed:', error)
      }
    }

    // Return analysis with strategy adjustments applied
    // (The actual analysis would be done in the main analyze route)
    return {} as CaseAnalysis // Placeholder
  }

  private async getLlamaEnhancedInsights(
    caseData: Case,
    strategy: ImprovementStrategy,
    learningPrompt: string,
    llamaClient: LlamaClient
  ): Promise<string[]> {
    const prompt = `${learningPrompt}

Now analyze this case with your improved understanding:

Case: ${caseData.title}
Date: ${caseData.date}
Description: ${caseData.description}

Focus Areas: ${strategy.focusAreas.join(', ')}
Learned Rules: ${strategy.learnedRules.join('; ')}

Provide 5-8 specific, actionable insights that incorporate your learning.`

    const response = await llamaClient.generate(prompt, 
      'You are an AI detective that learns from mistakes and continuously improves. Provide concise, accurate insights.'
    )

    return response
      .split('\n')
      .filter(line => line.trim() && (line.match(/^\d+\./) || line.startsWith('-')))
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 8)
  }

  getCurrentStrategy(): ImprovementStrategy | null {
    return this.currentStrategy
  }

  getTargetAccuracy(): number {
    return 95 // Target 95% accuracy
  }

  getProgressToTarget(): number {
    const metrics = feedbackSystem.calculateMetrics()
    const target = this.getTargetAccuracy()
    const current = metrics.averageAccuracy
    return Math.min(100, Math.round((current / target) * 100))
  }
}

export const selfImprovementSystem = new SelfImprovementSystem()
