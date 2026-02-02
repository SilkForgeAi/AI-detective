// Intelligent pattern recognition with semantic understanding

import { Case, PatternMatch } from '@/types/case'
import { advancedPatternMatcher, PatternInsight } from './advancedPatternMatcher'

export interface IntelligentPattern {
  id: string
  name: string
  type: 'serial_offender' | 'geographic_cluster' | 'temporal_series' | 'evidence_chain' | 'suspect_link'
  confidence: number
  cases: Case[]
  description: string
  indicators: string[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export class IntelligentPatternAnalyzer {
  async analyzePatterns(targetCase: Case, allCases: Case[]): Promise<{
    patterns: IntelligentPattern[]
    serialOffenderProbability: number
    recommendations: string[]
  }> {
    const { matches, insights, clusters } = await advancedPatternMatcher.findAdvancedPatterns(
      targetCase,
      allCases
    )

    const intelligentPatterns: IntelligentPattern[] = []

    // 1. Serial Offender Pattern Detection
    const serialPattern = this.detectSerialOffenderPattern(targetCase, allCases, matches)
    if (serialPattern) {
      intelligentPatterns.push(serialPattern)
    }

    // 2. Geographic Cluster Analysis
    clusters.forEach((cluster, idx) => {
      intelligentPatterns.push({
        id: `geo-cluster-${idx}`,
        name: `Geographic Cluster ${idx + 1}`,
        type: 'geographic_cluster',
        confidence: this.calculateClusterConfidence(cluster),
        cases: cluster,
        description: `${cluster.length} cases in similar geographic area`,
        indicators: this.extractGeographicIndicators(cluster),
        recommendations: [
          'Map all locations to identify patterns',
          'Check for surveillance footage in area',
          'Review local police reports for similar incidents',
        ],
        riskLevel: cluster.length >= 5 ? 'high' : cluster.length >= 3 ? 'medium' : 'low',
      })
    })

    // 3. Temporal Series Detection
    const temporalSeries = this.detectTemporalSeries(targetCase, allCases)
    if (temporalSeries) {
      intelligentPatterns.push(temporalSeries)
    }

    // 4. Evidence Chain Analysis
    const evidenceChains = this.detectEvidenceChains(targetCase, allCases)
    intelligentPatterns.push(...evidenceChains)

    // 5. Suspect Link Analysis
    const suspectLinks = this.detectSuspectLinks(targetCase, allCases)
    intelligentPatterns.push(...suspectLinks)

    // Calculate serial offender probability
    const serialOffenderProbability = this.calculateSerialOffenderProbability(
      targetCase,
      allCases,
      intelligentPatterns
    )

    // Generate recommendations
    const recommendations = this.generateIntelligentRecommendations(
      targetCase,
      intelligentPatterns,
      serialOffenderProbability
    )

    return {
      patterns: intelligentPatterns.sort((a, b) => b.confidence - a.confidence),
      serialOffenderProbability,
      recommendations,
    }
  }

  private detectSerialOffenderPattern(
    targetCase: Case,
    allCases: Case[],
    matches: PatternMatch[]
  ): IntelligentPattern | null {
    const highSimilarityMatches = matches.filter(m => m.similarityScore >= 0.7)
    
    if (highSimilarityMatches.length < 2) return null

    const matchingCases = allCases.filter(c => 
      highSimilarityMatches.some(m => m.caseId === c.id)
    )

    if (matchingCases.length < 2) return null

    const moConsistency = this.calculateMOConsistency([targetCase, ...matchingCases])
    const temporalPattern = this.analyzeTemporalPattern([targetCase, ...matchingCases])
    const geographicPattern = this.analyzeGeographicPattern([targetCase, ...matchingCases])

    const confidence = Math.round(
      (moConsistency * 0.4) +
      (temporalPattern * 0.3) +
      (geographicPattern * 0.3)
    )

    if (confidence < 60) return null

    return {
      id: 'serial-offender-pattern',
      name: 'Potential Serial Offender Pattern',
      type: 'serial_offender',
      confidence,
      cases: [targetCase, ...matchingCases],
      description: `Strong indicators of serial offender activity across ${matchingCases.length + 1} cases`,
      indicators: [
        `MO similarity: ${Math.round(moConsistency)}%`,
        `Temporal pattern: ${temporalPattern > 70 ? 'Strong' : 'Moderate'}`,
        `Geographic pattern: ${geographicPattern > 70 ? 'Concentrated' : 'Scattered'}`,
      ],
      recommendations: [
        'Coordinate investigation across jurisdictions',
        'Create task force if not already established',
        'Cross-reference all cases for suspect overlap',
        'Review unsolved cases in same timeframe',
        'Check for similar cases in adjacent jurisdictions',
      ],
      riskLevel: confidence >= 80 ? 'critical' : confidence >= 65 ? 'high' : 'medium',
    }
  }

  private detectTemporalSeries(targetCase: Case, allCases: Case[]): IntelligentPattern | null {
    const targetDate = new Date(targetCase.date)
    const nearbyCases = allCases
      .filter(c => c.id !== targetCase.id)
      .map(c => ({
        case: c,
        daysDiff: Math.abs((new Date(c.date).getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .filter(item => item.daysDiff <= 365)
      .sort((a, b) => a.daysDiff - b.daysDiff)
      .slice(0, 5)

    if (nearbyCases.length < 2) return null

    // Check if there's a pattern (e.g., monthly, seasonal)
    const dates = [targetDate, ...nearbyCases.map(item => new Date(item.case.date))]
    const pattern = this.detectDatePattern(dates)

    if (!pattern) return null

    return {
      id: 'temporal-series',
      name: 'Temporal Pattern Detected',
      type: 'temporal_series',
      confidence: 75,
      cases: [targetCase, ...nearbyCases.map(item => item.case)],
      description: `Cases show temporal clustering: ${pattern.description}`,
      indicators: [
        `${nearbyCases.length} cases within 1 year`,
        `Pattern: ${pattern.type}`,
      ],
      recommendations: [
        'Investigate what was happening during pattern periods',
        'Check for events that might explain timing',
        'Review cases before/after pattern for context',
      ],
      riskLevel: 'medium',
    }
  }

  private detectEvidenceChains(targetCase: Case, allCases: Case[]): IntelligentPattern[] {
    const chains: IntelligentPattern[] = []
    const targetEvidenceTypes = new Set(targetCase.evidence.map(e => e.type))

    // Find cases with similar evidence types
    const similarCases = allCases.filter(c => {
      if (c.id === targetCase.id) return false
      const otherTypes = new Set(c.evidence.map(e => e.type))
      const overlap = new Set([...targetEvidenceTypes].filter(x => otherTypes.has(x)))
      return overlap.size >= Math.ceil(targetEvidenceTypes.size * 0.6)
    })

    if (similarCases.length >= 2) {
      chains.push({
        id: 'evidence-chain',
        name: 'Evidence Type Chain',
        type: 'evidence_chain',
        confidence: 70,
        cases: [targetCase, ...similarCases],
        description: `${similarCases.length + 1} cases share similar evidence types`,
        indicators: [
          `Common evidence types: ${Array.from(targetEvidenceTypes).join(', ')}`,
          `${similarCases.length} matching cases`,
        ],
        recommendations: [
          'Cross-reference evidence collection methods',
          'Check if same lab processed evidence',
          'Review chain of custody for all cases',
        ],
        riskLevel: 'medium',
      })
    }

    return chains
  }

  private detectSuspectLinks(targetCase: Case, allCases: Case[]): IntelligentPattern[] {
    const links: IntelligentPattern[] = []
    const suspectKeywords = ['suspect', 'perpetrator', 'description', 'witness saw']

    const targetHasSuspect = suspectKeywords.some(kw =>
      targetCase.description.toLowerCase().includes(kw) ||
      targetCase.evidence.some(e => e.description.toLowerCase().includes(kw))
    )

    if (!targetHasSuspect) return links

    const similarSuspectCases = allCases.filter(c => {
      if (c.id === targetCase.id) return false
      
      const hasSuspect = suspectKeywords.some(kw =>
        c.description.toLowerCase().includes(kw) ||
        c.evidence.some(e => e.description.toLowerCase().includes(kw))
      )

      if (!hasSuspect) return false

      // Check description similarity
      const descSimilarity = this.calculateDescriptionSimilarity(targetCase.description, c.description)
      return descSimilarity > 0.4
    })

    if (similarSuspectCases.length >= 2) {
      links.push({
        id: 'suspect-link',
        name: 'Suspect Description Link',
        type: 'suspect_link',
        confidence: 65,
        cases: [targetCase, ...similarSuspectCases],
        description: `${similarSuspectCases.length + 1} cases have similar suspect descriptions`,
        indicators: [
          'Similar witness descriptions',
          'Potential same perpetrator',
        ],
        recommendations: [
          'Create composite sketch from all descriptions',
          'Cross-reference with known offender databases',
          'Review mugshot databases for matches',
        ],
        riskLevel: 'high',
      })
    }

    return links
  }

  private calculateMOConsistency(cases: Case[]): number {
    if (cases.length < 2) return 0

    let totalSimilarity = 0
    let comparisons = 0

    for (let i = 0; i < cases.length; i++) {
      for (let j = i + 1; j < cases.length; j++) {
        const similarity = this.calculateCaseSimilarity(cases[i], cases[j])
        totalSimilarity += similarity
        comparisons++
      }
    }

    return comparisons > 0 ? Math.round((totalSimilarity / comparisons) * 100) : 0
  }

  private calculateCaseSimilarity(case1: Case, case2: Case): number {
    // Description similarity
    const descSim = this.calculateDescriptionSimilarity(case1.description, case2.description)
    
    // Evidence similarity
    const evSim = this.calculateEvidenceSimilarity(case1.evidence, case2.evidence)
    
    // Jurisdiction similarity
    const jurSim = case1.jurisdiction && case2.jurisdiction
      ? (case1.jurisdiction === case2.jurisdiction ? 1.0 : 0.5)
      : 0.5

    return (descSim * 0.4) + (evSim * 0.4) + (jurSim * 0.2)
  }

  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    // Use fuzzy matching
    const words1 = new Set(desc1.toLowerCase().split(/\s+/))
    const words2 = new Set(desc2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  private calculateEvidenceSimilarity(ev1: any[], ev2: any[]): number {
    const types1 = new Set(ev1.map(e => e.type))
    const types2 = new Set(ev2.map(e => e.type))
    
    const intersection = new Set([...types1].filter(x => types2.has(x)))
    const union = new Set([...types1, ...types2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  private analyzeTemporalPattern(cases: Case[]): number {
    if (cases.length < 2) return 0

    const dates = cases.map(c => new Date(c.date)).sort((a, b) => a.getTime() - b.getTime())
    const intervals: number[] = []

    for (let i = 1; i < dates.length; i++) {
      const diffDays = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      intervals.push(diffDays)
    }

    // Check consistency of intervals
    if (intervals.length === 0) return 0

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length

    // Lower variance = more consistent pattern
    const consistency = Math.max(0, 100 - (variance / avgInterval) * 100)
    return Math.round(consistency)
  }

  private analyzeGeographicPattern(cases: Case[]): number {
    const jurisdictions = cases.map(c => c.jurisdiction).filter(Boolean)
    if (jurisdictions.length === 0) return 50

    const unique = new Set(jurisdictions)
    
    // More concentrated = higher score
    return Math.round((1 - (unique.size / jurisdictions.length)) * 100)
  }

  private detectDatePattern(dates: Date[]): { type: string; description: string } | null {
    if (dates.length < 3) return null

    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
    const intervals: number[] = []

    for (let i = 1; i < sorted.length; i++) {
      intervals.push((sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24))
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length

    // Check for monthly pattern (28-31 days)
    if (avgInterval >= 28 && avgInterval <= 31) {
      return { type: 'monthly', description: 'Cases occur approximately monthly' }
    }

    // Check for seasonal pattern (90-120 days)
    if (avgInterval >= 90 && avgInterval <= 120) {
      return { type: 'seasonal', description: 'Cases occur seasonally' }
    }

    // Check for weekly pattern (5-9 days)
    if (avgInterval >= 5 && avgInterval <= 9) {
      return { type: 'weekly', description: 'Cases occur approximately weekly' }
    }

    return null
  }

  private extractGeographicIndicators(cluster: Case[]): string[] {
    const indicators: string[] = []
    const jurisdictions = cluster.map(c => c.jurisdiction).filter(Boolean)

    if (jurisdictions.length > 0) {
      const unique = new Set(jurisdictions)
      if (unique.size === 1) {
        indicators.push(`All cases in: ${jurisdictions[0]}`)
      } else {
        indicators.push(`${unique.size} different jurisdictions`)
      }
    }

    return indicators
  }

  private calculateClusterConfidence(cluster: Case[]): number {
    const sizeScore = Math.min(100, cluster.length * 15)
    const consistencyScore = this.analyzeGeographicPattern(cluster)
    return Math.round((sizeScore * 0.5) + (consistencyScore * 0.5))
  }

  private calculateSerialOffenderProbability(
    targetCase: Case,
    allCases: Case[],
    patterns: IntelligentPattern[]
  ): number {
    const serialPattern = patterns.find(p => p.type === 'serial_offender')
    if (!serialPattern) return 0

    let probability = serialPattern.confidence

    // Increase probability based on number of matching cases
    if (serialPattern.cases.length >= 5) probability += 10
    if (serialPattern.cases.length >= 10) probability += 10

    // Increase if temporal pattern exists
    const temporalPattern = patterns.find(p => p.type === 'temporal_series')
    if (temporalPattern) probability += 5

    // Increase if geographic cluster exists
    const geoPattern = patterns.find(p => p.type === 'geographic_cluster')
    if (geoPattern && geoPattern.cases.length >= 3) probability += 5

    return Math.min(100, probability)
  }

  private generateIntelligentRecommendations(
    targetCase: Case,
    patterns: IntelligentPattern[],
    serialProbability: number
  ): string[] {
    const recommendations: string[] = []

    if (serialProbability >= 70) {
      recommendations.push('HIGH PRIORITY: Strong indicators of serial offender - escalate to task force')
      recommendations.push('Coordinate with all jurisdictions involved in pattern')
    }

    const serialPattern = patterns.find(p => p.type === 'serial_offender')
    if (serialPattern) {
      recommendations.push(...serialPattern.recommendations)
    }

    const geoPattern = patterns.find(p => p.type === 'geographic_cluster')
    if (geoPattern) {
      recommendations.push('Map all locations to identify geographic pattern')
      recommendations.push('Check for surveillance cameras in identified area')
    }

    const temporalPattern = patterns.find(p => p.type === 'temporal_series')
    if (temporalPattern) {
      recommendations.push('Investigate what occurs during pattern periods')
      recommendations.push('Check for events that might explain timing')
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue standard investigation procedures')
      recommendations.push('Monitor for similar cases')
    }

    return recommendations
  }
}

export const intelligentPatternAnalyzer = new IntelligentPatternAnalyzer()
