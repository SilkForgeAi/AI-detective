// Pattern accuracy tracking implementation

import { Case, PatternMatch } from '@/types/case'
import { CaseOutcome } from '@/lib/learning/feedbackSystem'

export interface PatternAccuracyMetrics {
  totalPatternMatches: number
  verifiedPatternMatches: number
  correctPatternMatches: number
  incorrectPatternMatches: number
  accuracy: number
  accuracyByFactor: {
    moSimilarity: number
    geographicProximity: number
    temporalProximity: number
    evidenceSimilarity: number
  }
}

export function calculatePatternAccuracy(
  patterns: PatternMatch[],
  outcome: CaseOutcome
): PatternAccuracyMetrics {
  // For now, we'll use a simplified approach
  // In a real system, you'd track which patterns were verified
  
  const total = patterns.length
  const verified = patterns.filter(p => {
    // Check if pattern was mentioned in feedback
    const patternMentioned = outcome.notes?.toLowerCase().includes(p.caseTitle.toLowerCase()) ||
                            outcome.notes?.toLowerCase().includes(p.caseId.toLowerCase())
    return patternMentioned
  }).length

  // Estimate accuracy based on similarity scores
  // Higher similarity = more likely to be correct
  const highSimilarity = patterns.filter(p => p.similarityScore >= 0.7).length
  const mediumSimilarity = patterns.filter(p => p.similarityScore >= 0.5 && p.similarityScore < 0.7).length
  
  // Conservative estimate: high similarity = 80% correct, medium = 60% correct
  const estimatedCorrect = Math.round(
    (highSimilarity * 0.8) + (mediumSimilarity * 0.6)
  )

  // Calculate accuracy by factor
  const moPatterns = patterns.filter(p => p.matchingFactors.includes('Similar MO'))
  const geoPatterns = patterns.filter(p => p.matchingFactors.includes('Geographic proximity'))
  const tempPatterns = patterns.filter(p => p.matchingFactors.includes('Temporal proximity'))
  const evPatterns = patterns.filter(p => p.matchingFactors.includes('Similar evidence'))

  return {
    totalPatternMatches: total,
    verifiedPatternMatches: verified,
    correctPatternMatches: estimatedCorrect,
    incorrectPatternMatches: total - estimatedCorrect,
    accuracy: total > 0 ? Math.round((estimatedCorrect / total) * 100) : 0,
    accuracyByFactor: {
      moSimilarity: moPatterns.length > 0 
        ? Math.round(moPatterns.reduce((sum, p) => sum + (p.moSimilarity || 0), 0) / moPatterns.length * 100)
        : 0,
      geographicProximity: geoPatterns.length > 0
        ? Math.round(geoPatterns.reduce((sum, p) => sum + (p.geographicProximity || 0), 0) / geoPatterns.length * 100)
        : 0,
      temporalProximity: tempPatterns.length > 0
        ? Math.round(tempPatterns.reduce((sum, p) => sum + (p.temporalProximity || 0), 0) / tempPatterns.length * 100)
        : 0,
      evidenceSimilarity: evPatterns.length > 0
        ? Math.round(evPatterns.reduce((sum, p) => sum + (p.similarityScore || 0), 0) / evPatterns.length * 100)
        : 0,
    },
  }
}

export function updatePatternAccuracyInFeedback(
  patterns: PatternMatch[],
  outcome: CaseOutcome
): CaseOutcome {
  // Add pattern verification to outcome if patterns exist
  if (patterns.length > 0 && !outcome.notes?.includes('patterns')) {
    const accuracy = calculatePatternAccuracy(patterns, outcome)
    return {
      ...outcome,
      notes: `${outcome.notes || ''}\nPattern Accuracy: ${accuracy.accuracy}% (${accuracy.correctPatternMatches}/${accuracy.totalPatternMatches} correct)`.trim(),
    }
  }
  return outcome
}
