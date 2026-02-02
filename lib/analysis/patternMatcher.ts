// Pattern recognition and cross-case analysis

import { Case, PatternMatch, EvidenceItem } from '@/types/case'

export interface PatternMatchingConfig {
  moWeight: number
  geographicWeight: number
  temporalWeight: number
  evidenceWeight: number
  minSimilarityThreshold: number
}

const defaultConfig: PatternMatchingConfig = {
  moWeight: 0.3,
  geographicWeight: 0.2,
  temporalWeight: 0.2,
  evidenceWeight: 0.3,
  minSimilarityThreshold: 0.4,
}

export function findPatternMatches(
  targetCase: Case,
  allCases: Case[],
  config: PatternMatchingConfig = defaultConfig
): PatternMatch[] {
  const matches: PatternMatch[] = []

  for (const otherCase of allCases) {
    if (otherCase.id === targetCase.id) continue

    const moSimilarity = calculateMOSimilarity(targetCase, otherCase)
    const geographicProximity = calculateGeographicProximity(targetCase, otherCase)
    const temporalProximity = calculateTemporalProximity(targetCase, otherCase)
    const evidenceSimilarity = calculateEvidenceSimilarity(targetCase, otherCase)

    const overallScore =
      moSimilarity * config.moWeight +
      geographicProximity * config.geographicWeight +
      temporalProximity * config.temporalWeight +
      evidenceSimilarity * config.evidenceWeight

    if (overallScore >= config.minSimilarityThreshold) {
      const matchingFactors: string[] = []
      if (moSimilarity > 0.5) matchingFactors.push('Similar MO')
      if (geographicProximity > 0.5) matchingFactors.push('Geographic proximity')
      if (temporalProximity > 0.5) matchingFactors.push('Temporal proximity')
      if (evidenceSimilarity > 0.5) matchingFactors.push('Similar evidence')

      matches.push({
        caseId: otherCase.id,
        caseTitle: otherCase.title,
        similarityScore: overallScore,
        matchingFactors,
        moSimilarity,
        geographicProximity,
        temporalProximity,
      })
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore)
}

function calculateMOSimilarity(case1: Case, case2: Case): number {
  // Simple keyword-based MO matching (can be enhanced with NLP)
  const desc1 = (case1.description + ' ' + case1.evidence.map(e => e.description).join(' ')).toLowerCase()
  const desc2 = (case2.description + ' ' + case2.evidence.map(e => e.description).join(' ')).toLowerCase()

  const keywords = ['weapon', 'method', 'entry', 'escape', 'victim', 'location', 'time']
  let matches = 0

  for (const keyword of keywords) {
    if (desc1.includes(keyword) && desc2.includes(keyword)) matches++
  }

  return matches / keywords.length
}

function calculateGeographicProximity(case1: Case, case2: Case): number {
  // If locations are available, calculate distance
  // For now, use jurisdiction matching
  if (case1.jurisdiction && case2.jurisdiction) {
    return case1.jurisdiction === case2.jurisdiction ? 1.0 : 0.3
  }
  return 0.5 // Unknown proximity
}

function calculateTemporalProximity(case1: Case, case2: Case): number {
  const date1 = new Date(case1.date)
  const date2 = new Date(case2.date)
  const diffDays = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))

  // Cases within 30 days = high similarity, within 1 year = medium, beyond = low
  if (diffDays <= 30) return 1.0
  if (diffDays <= 365) return 0.6
  if (diffDays <= 1825) return 0.3 // 5 years
  return 0.1
}

function calculateEvidenceSimilarity(case1: Case, case2: Case): number {
  const types1 = new Set(case1.evidence.map(e => e.type))
  const types2 = new Set(case2.evidence.map(e => e.type))

  const intersection = new Set([...types1].filter(x => types2.has(x)))
  const union = new Set([...types1, ...types2])

  return union.size > 0 ? intersection.size / union.size : 0
}
