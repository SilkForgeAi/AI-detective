// Advanced pattern recognition with ML-like algorithms

import { Case, PatternMatch, EvidenceItem } from '@/types/case'
import { Fuse } from 'fuse.js'

export interface AdvancedPatternConfig {
  moWeight: number
  geographicWeight: number
  temporalWeight: number
  evidenceWeight: number
  witnessWeight: number
  forensicWeight: number
  minSimilarityThreshold: number
  enableFuzzyMatching: boolean
  enableSemanticAnalysis: boolean
}

const defaultConfig: AdvancedPatternConfig = {
  moWeight: 0.25,
  geographicWeight: 0.15,
  temporalWeight: 0.15,
  evidenceWeight: 0.20,
  witnessWeight: 0.10,
  forensicWeight: 0.15,
  minSimilarityThreshold: 0.35,
  enableFuzzyMatching: true,
  enableSemanticAnalysis: true,
}

export interface PatternInsight {
  type: 'mo_pattern' | 'geographic_cluster' | 'temporal_pattern' | 'evidence_pattern' | 'suspect_pattern'
  confidence: number
  description: string
  cases: string[]
  details: Record<string, any>
}

export class AdvancedPatternMatcher {
  private config: AdvancedPatternConfig
  private fuse: Fuse<Case> | null = null

  constructor(config: Partial<AdvancedPatternConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  async findAdvancedPatterns(
    targetCase: Case,
    allCases: Case[]
  ): Promise<{
    matches: PatternMatch[]
    insights: PatternInsight[]
    clusters: Case[][]
  }> {
    const matches: PatternMatch[] = []
    const insights: PatternInsight[] = []
    const clusters: Case[][] = []

    // 1. Enhanced MO Matching
    const moMatches = this.findMOPatterns(targetCase, allCases)
    matches.push(...moMatches)

    // 2. Geographic Clustering
    const geoClusters = this.findGeographicClusters(targetCase, allCases)
    clusters.push(...geoClusters)
    if (geoClusters.length > 0) {
      insights.push({
        type: 'geographic_cluster',
        confidence: this.calculateClusterConfidence(geoClusters[0]),
        description: `Geographic cluster detected: ${geoClusters[0].length} cases in similar location`,
        cases: geoClusters[0].map(c => c.id),
        details: { clusterSize: geoClusters[0].length },
      })
    }

    // 3. Temporal Patterns
    const temporalPatterns = this.findTemporalPatterns(targetCase, allCases)
    if (temporalPatterns.length > 0) {
      insights.push({
        type: 'temporal_pattern',
        confidence: 75,
        description: `Temporal pattern: ${temporalPatterns.length} cases within similar timeframe`,
        cases: temporalPatterns.map(c => c.id),
        details: { patternType: 'time_cluster' },
      })
    }

    // 4. Evidence Pattern Matching
    const evidencePatterns = this.findEvidencePatterns(targetCase, allCases)
    if (evidencePatterns.length > 0) {
      insights.push({
        type: 'evidence_pattern',
        confidence: 80,
        description: `Similar evidence patterns found in ${evidencePatterns.length} cases`,
        cases: evidencePatterns.map(c => c.id),
        details: { matchingEvidenceTypes: this.extractEvidenceTypes(evidencePatterns) },
      })
    }

    // 5. Suspect Pattern Analysis
    const suspectPatterns = this.findSuspectPatterns(targetCase, allCases)
    if (suspectPatterns.length > 0) {
      insights.push({
        type: 'suspect_pattern',
        confidence: 70,
        description: `Potential suspect pattern: similar descriptions in ${suspectPatterns.length} cases`,
        cases: suspectPatterns.map(c => c.id),
        details: { patternType: 'suspect_description' },
      })
    }

    // 6. Serial Offender Detection
    const serialPatterns = this.detectSerialOffenderPatterns(targetCase, allCases)
    if (serialPatterns.length > 0) {
      insights.push({
        type: 'mo_pattern',
        confidence: 85,
        description: `Potential serial offender pattern detected across ${serialPatterns.length} cases`,
        cases: serialPatterns.map(c => c.id),
        details: { 
          patternType: 'serial_offender',
          moSimilarity: this.calculateMOSimilarityScore(serialPatterns),
        },
      })
    }

    return {
      matches: matches.sort((a, b) => b.similarityScore - a.similarityScore),
      insights,
      clusters,
    }
  }

  private findMOPatterns(targetCase: Case, allCases: Case[]): PatternMatch[] {
    const matches: PatternMatch[] = []

    for (const otherCase of allCases) {
      if (otherCase.id === targetCase.id) continue

      const moSimilarity = this.calculateAdvancedMOSimilarity(targetCase, otherCase)
      
      if (moSimilarity >= this.config.minSimilarityThreshold) {
        const matchingFactors = this.extractMOMatchingFactors(targetCase, otherCase)
        
        matches.push({
          caseId: otherCase.id,
          caseTitle: otherCase.title,
          similarityScore: moSimilarity,
          matchingFactors,
          moSimilarity,
        })
      }
    }

    return matches
  }

  private calculateAdvancedMOSimilarity(case1: Case, case2: Case): number {
    let score = 0
    let factors = 0

    // 1. Description similarity (fuzzy matching)
    const descSimilarity = this.fuzzyStringMatch(
      case1.description.toLowerCase(),
      case2.description.toLowerCase()
    )
    score += descSimilarity * 0.3
    factors++

    // 2. Evidence type overlap
    const evidenceSimilarity = this.calculateEvidenceTypeSimilarity(case1.evidence, case2.evidence)
    score += evidenceSimilarity * 0.25
    factors++

    // 3. Keyword matching (MO indicators)
    const moKeywords = [
      'weapon', 'method', 'entry', 'escape', 'victim', 'location', 'time',
      'threat', 'demand', 'ransom', 'note', 'letter', 'call', 'witness',
      'forced', 'bound', 'gagged', 'stabbed', 'shot', 'strangled'
    ]
    const keywordMatch = this.calculateKeywordSimilarity(
      case1.description + ' ' + case1.evidence.map(e => e.description).join(' '),
      case2.description + ' ' + case2.evidence.map(e => e.description).join(' '),
      moKeywords
    )
    score += keywordMatch * 0.25
    factors++

    // 4. Jurisdiction proximity
    if (case1.jurisdiction && case2.jurisdiction) {
      const jurisdictionMatch = this.calculateJurisdictionProximity(case1.jurisdiction, case2.jurisdiction)
      score += jurisdictionMatch * 0.2
      factors++
    }

    return factors > 0 ? score / factors : 0
  }

  private fuzzyStringMatch(str1: string, str2: string): number {
    // Simple Jaccard similarity with n-grams
    const n = 3 // trigrams
    const getNgrams = (str: string): Set<string> => {
      const ngrams = new Set<string>()
      for (let i = 0; i <= str.length - n; i++) {
        ngrams.add(str.substring(i, i + n))
      }
      return ngrams
    }

    const ngrams1 = getNgrams(str1)
    const ngrams2 = getNgrams(str2)

    const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)))
    const union = new Set([...ngrams1, ...ngrams2])

    return union.size > 0 ? intersection.size / union.size : 0
  }

  private calculateEvidenceTypeSimilarity(evidence1: EvidenceItem[], evidence2: EvidenceItem[]): number {
    const types1 = new Set(evidence1.map(e => e.type))
    const types2 = new Set(evidence2.map(e => e.type))

    const intersection = new Set([...types1].filter(x => types2.has(x)))
    const union = new Set([...types1, ...types2])

    if (union.size === 0) return 0

    // Weight by evidence count
    const baseSimilarity = intersection.size / union.size
    const countSimilarity = Math.min(evidence1.length, evidence2.length) / Math.max(evidence1.length, evidence2.length, 1)

    return (baseSimilarity * 0.7) + (countSimilarity * 0.3)
  }

  private calculateKeywordSimilarity(text1: string, text2: string, keywords: string[]): number {
    const text1Lower = text1.toLowerCase()
    const text2Lower = text2.toLowerCase()

    let matches = 0
    let total = 0

    for (const keyword of keywords) {
      const in1 = text1Lower.includes(keyword)
      const in2 = text2Lower.includes(keyword)
      
      if (in1 || in2) {
        total++
        if (in1 && in2) matches++
      }
    }

    return total > 0 ? matches / total : 0
  }

  private calculateJurisdictionProximity(jurisdiction1: string, jurisdiction2: string): number {
    // Same jurisdiction = 1.0
    if (jurisdiction1 === jurisdiction2) return 1.0

    // Same state = 0.7
    const state1 = jurisdiction1.split(',')[1]?.trim()
    const state2 = jurisdiction2.split(',')[1]?.trim()
    if (state1 && state2 && state1 === state2) return 0.7

    // Same region = 0.4
    const region1 = this.getRegion(jurisdiction1)
    const region2 = this.getRegion(jurisdiction2)
    if (region1 && region2 && region1 === region2) return 0.4

    return 0.1
  }

  private getRegion(jurisdiction: string): string | null {
    // Simple region detection (can be enhanced)
    const lower = jurisdiction.toLowerCase()
    if (lower.includes('california') || lower.includes('west')) return 'west'
    if (lower.includes('new york') || lower.includes('east')) return 'east'
    if (lower.includes('texas') || lower.includes('south')) return 'south'
    if (lower.includes('illinois') || lower.includes('midwest')) return 'midwest'
    return null
  }

  private findGeographicClusters(targetCase: Case, allCases: Case[]): Case[][] {
    const clusters: Case[][] = []
    const processed = new Set<string>()

    for (const otherCase of allCases) {
      if (otherCase.id === targetCase.id || processed.has(otherCase.id)) continue

      if (!targetCase.jurisdiction || !otherCase.jurisdiction) continue

      const proximity = this.calculateJurisdictionProximity(targetCase.jurisdiction, otherCase.jurisdiction)
      
      if (proximity >= 0.7) {
        // Find or create cluster
        let cluster = clusters.find(c => 
          c.some(caseItem => 
            this.calculateJurisdictionProximity(caseItem.jurisdiction || '', otherCase.jurisdiction || '') >= 0.7
          )
        )

        if (!cluster) {
          cluster = [targetCase]
          clusters.push(cluster)
        }

        if (!cluster.includes(otherCase)) {
          cluster.push(otherCase)
        }
        processed.add(otherCase.id)
      }
    }

    return clusters.filter(c => c.length > 1)
  }

  private findTemporalPatterns(targetCase: Case, allCases: Case[]): Case[] {
    const targetDate = new Date(targetCase.date)
    const patterns: Case[] = []

    for (const otherCase of allCases) {
      if (otherCase.id === targetCase.id) continue

      const otherDate = new Date(otherCase.date)
      const diffDays = Math.abs((targetDate.getTime() - otherDate.getTime()) / (1000 * 60 * 60 * 24))

      // Cases within 90 days
      if (diffDays <= 90) {
        patterns.push(otherCase)
      }
    }

    return patterns
  }

  private findEvidencePatterns(targetCase: Case, allCases: Case[]): Case[] {
    const targetEvidenceTypes = new Set(targetCase.evidence.map(e => e.type))
    const patterns: Case[] = []

    for (const otherCase of allCases) {
      if (otherCase.id === targetCase.id) continue

      const otherEvidenceTypes = new Set(otherCase.evidence.map(e => e.type))
      const overlap = new Set([...targetEvidenceTypes].filter(x => otherEvidenceTypes.has(x)))

      // If 50%+ evidence types match
      if (overlap.size >= Math.ceil(targetEvidenceTypes.size * 0.5)) {
        patterns.push(otherCase)
      }
    }

    return patterns
  }

  private findSuspectPatterns(targetCase: Case, allCases: Case[]): Case[] {
    const patterns: Case[] = []
    const suspectKeywords = ['suspect', 'perpetrator', 'individual', 'person', 'man', 'woman', 'description']

    const targetHasSuspect = suspectKeywords.some(kw => 
      targetCase.description.toLowerCase().includes(kw) ||
      targetCase.evidence.some(e => e.description.toLowerCase().includes(kw))
    )

    if (!targetHasSuspect) return patterns

    for (const otherCase of allCases) {
      if (otherCase.id === targetCase.id) continue

      const otherHasSuspect = suspectKeywords.some(kw =>
        otherCase.description.toLowerCase().includes(kw) ||
        otherCase.evidence.some(e => e.description.toLowerCase().includes(kw))
      )

      if (otherHasSuspect) {
        // Check if descriptions are similar
        const descSimilarity = this.fuzzyStringMatch(
          targetCase.description.toLowerCase(),
          otherCase.description.toLowerCase()
        )
        
        if (descSimilarity > 0.3) {
          patterns.push(otherCase)
        }
      }
    }

    return patterns
  }

  private detectSerialOffenderPatterns(targetCase: Case, allCases: Case[]): Case[] {
    const serialPatterns: Case[] = []

    for (const otherCase of allCases) {
      if (otherCase.id === targetCase.id) continue

      // Check multiple factors
      const moSimilarity = this.calculateAdvancedMOSimilarity(targetCase, otherCase)
      const temporalProximity = this.calculateTemporalProximity(targetCase, otherCase)
      const geographicProximity = this.calculateGeographicProximity(targetCase, otherCase)

      // Serial offender indicators
      const isSerialPattern = 
        moSimilarity >= 0.6 &&
        temporalProximity >= 0.5 &&
        geographicProximity >= 0.4 &&
        (targetCase.evidence.length >= 3 && otherCase.evidence.length >= 3)

      if (isSerialPattern) {
        serialPatterns.push(otherCase)
      }
    }

    return serialPatterns
  }

  private calculateTemporalProximity(case1: Case, case2: Case): number {
    const date1 = new Date(case1.date)
    const date2 = new Date(case2.date)
    const diffDays = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 30) return 1.0
    if (diffDays <= 90) return 0.8
    if (diffDays <= 180) return 0.6
    if (diffDays <= 365) return 0.4
    if (diffDays <= 730) return 0.2
    return 0.1
  }

  private calculateGeographicProximity(case1: Case, case2: Case): number {
    if (!case1.jurisdiction || !case2.jurisdiction) return 0.5
    return this.calculateJurisdictionProximity(case1.jurisdiction, case2.jurisdiction)
  }

  private extractMOMatchingFactors(case1: Case, case2: Case): string[] {
    const factors: string[] = []

    // Check various MO factors
    const desc1 = (case1.description + ' ' + case1.evidence.map(e => e.description).join(' ')).toLowerCase()
    const desc2 = (case2.description + ' ' + case2.evidence.map(e => e.description).join(' ')).toLowerCase()

    const moIndicators = [
      { keyword: 'weapon', label: 'Similar weapon' },
      { keyword: 'method', label: 'Similar method' },
      { keyword: 'threat', label: 'Similar threats' },
      { keyword: 'note', label: 'Similar notes/letters' },
      { keyword: 'forced', label: 'Similar force used' },
    ]

    moIndicators.forEach(({ keyword, label }) => {
      if (desc1.includes(keyword) && desc2.includes(keyword)) {
        factors.push(label)
      }
    })

    // Evidence type match
    const types1 = new Set(case1.evidence.map(e => e.type))
    const types2 = new Set(case2.evidence.map(e => e.type))
    const typeOverlap = new Set([...types1].filter(x => types2.has(x)))
    if (typeOverlap.size >= 2) {
      factors.push('Similar evidence types')
    }

    // Geographic proximity
    if (case1.jurisdiction && case2.jurisdiction) {
      const prox = this.calculateJurisdictionProximity(case1.jurisdiction, case2.jurisdiction)
      if (prox >= 0.7) {
        factors.push('Same jurisdiction')
      } else if (prox >= 0.4) {
        factors.push('Nearby jurisdiction')
      }
    }

    return factors.length > 0 ? factors : ['General similarity']
  }

  private extractEvidenceTypes(cases: Case[]): string[] {
    const allTypes = new Set<string>()
    cases.forEach(c => c.evidence.forEach(e => allTypes.add(e.type)))
    return Array.from(allTypes)
  }

  private calculateClusterConfidence(cluster: Case[]): number {
    // Larger clusters = higher confidence
    const sizeScore = Math.min(100, cluster.length * 20)
    
    // Check consistency
    const jurisdictions = cluster.map(c => c.jurisdiction).filter(Boolean)
    const uniqueJurisdictions = new Set(jurisdictions)
    const consistencyScore = (jurisdictions.length - uniqueJurisdictions.size + 1) / jurisdictions.length * 100

    return Math.round((sizeScore * 0.6) + (consistencyScore * 0.4))
  }

  private calculateMOSimilarityScore(cases: Case[]): number {
    if (cases.length < 2) return 0

    let totalSimilarity = 0
    let comparisons = 0

    for (let i = 0; i < cases.length; i++) {
      for (let j = i + 1; j < cases.length; j++) {
        totalSimilarity += this.calculateAdvancedMOSimilarity(cases[i], cases[j])
        comparisons++
      }
    }

    return comparisons > 0 ? Math.round((totalSimilarity / comparisons) * 100) : 0
  }
}

export const advancedPatternMatcher = new AdvancedPatternMatcher()
