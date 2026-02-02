// Hypothesis generation with confidence scoring

import { Case, Hypothesis, EvidenceItem } from '@/types/case'

export function generateHypotheses(caseData: Case, allCases: Case[]): Hypothesis[] {
  const hypotheses: Hypothesis[] = []

  // Generate suspect-related hypotheses
  const suspectHypotheses = generateSuspectHypotheses(caseData)
  hypotheses.push(...suspectHypotheses)

  // Generate timeline hypotheses
  const timelineHypotheses = generateTimelineHypotheses(caseData)
  hypotheses.push(...timelineHypotheses)

  // Generate connection hypotheses
  const connectionHypotheses = generateConnectionHypotheses(caseData, allCases)
  hypotheses.push(...connectionHypotheses)

  // Generate location hypotheses
  const locationHypotheses = generateLocationHypotheses(caseData)
  hypotheses.push(...locationHypotheses)

  return hypotheses
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10) // Top 10 hypotheses
}

function generateSuspectHypotheses(caseData: Case): Hypothesis[] {
  const hypotheses: Hypothesis[] = []
  const evidence = caseData.evidence

  // Check for witness descriptions
  const witnessStatements = evidence.filter(e => e.type === 'witness_statement')
  const hasSuspectDescription = witnessStatements.some(e =>
    e.description.toLowerCase().match(/suspect|perpetrator|person|individual|man|woman/i)
  )

  if (hasSuspectDescription) {
    hypotheses.push({
      id: 'suspect-profile-1',
      title: 'Suspect Profile Development',
      description: 'Witness statements contain potential suspect descriptions. Recommend developing a composite profile.',
      confidence: 65,
      supportingEvidence: witnessStatements.map(e => e.id),
      recommendedActions: [
        'Create composite sketch from witness descriptions',
        'Cross-reference with known offender databases',
        'Review similar cases for suspect patterns',
      ],
      category: 'suspect',
    })
  }

  // Check for forensic evidence
  const forensicEvidence = evidence.filter(e => e.type === 'forensic')
  if (forensicEvidence.length > 0) {
    hypotheses.push({
      id: 'suspect-forensic-1',
      title: 'Forensic DNA/Evidence Analysis',
      description: 'Forensic evidence available for suspect identification. Recommend database comparison.',
      confidence: 75,
      supportingEvidence: forensicEvidence.map(e => e.id),
      recommendedActions: [
        'Submit evidence for DNA analysis if not already done',
        'Compare with CODIS database',
        'Consider genealogical DNA analysis for cold cases',
      ],
      category: 'suspect',
    })
  }

  return hypotheses
}

function generateTimelineHypotheses(caseData: Case): Hypothesis[] {
  const hypotheses: Hypothesis[] = []

  // Check for gaps in timeline
  if (caseData.analysis?.timeline) {
    const timeline = caseData.analysis.timeline
    if (timeline.length > 0) {
      const firstEvent = timeline[0]
      const lastEvent = timeline[timeline.length - 1]
      const incidentDate = new Date(caseData.date)

      // Check if timeline starts before incident
      if (new Date(firstEvent.date) < incidentDate) {
        hypotheses.push({
          id: 'timeline-pre-incident',
          title: 'Pre-Incident Activity Investigation',
          description: 'Timeline suggests activity before the reported incident. Investigate pre-incident events.',
          confidence: 60,
          supportingEvidence: [firstEvent.id],
          recommendedActions: [
            'Review surveillance footage from before incident',
            'Interview individuals present before the incident',
            'Check for related incidents in the area',
          ],
          category: 'timeline',
        })
      }
    }
  }

  return hypotheses
}

function generateConnectionHypotheses(caseData: Case, allCases: Case[]): Hypothesis[] {
  const hypotheses: Hypothesis[] = []

  // Check for similar cases
  const similarCases = allCases.filter(c => {
    if (c.id === caseData.id) return false
    
    // Simple similarity check
    const sameJurisdiction = c.jurisdiction === caseData.jurisdiction
    const similarDate = Math.abs(
      new Date(c.date).getTime() - new Date(caseData.date).getTime()
    ) < 365 * 24 * 60 * 60 * 1000 // Within 1 year

    return sameJurisdiction && similarDate
  })

  if (similarCases.length > 0) {
    hypotheses.push({
      id: 'connection-similar-cases',
      title: 'Potential Serial Offender Connection',
      description: `Found ${similarCases.length} similar case(s) in the same jurisdiction/timeframe. Possible serial offender pattern.`,
      confidence: 70,
      supportingEvidence: [],
      recommendedActions: [
        'Compare MO across similar cases',
        'Review geographic patterns',
        'Check for suspect overlap',
        'Consider task force coordination',
      ],
      category: 'connection',
    })
  }

  return hypotheses
}

function generateLocationHypotheses(caseData: Case): Hypothesis[] {
  const hypotheses: Hypothesis[] = []

  // Check for multiple locations
  const locationEvidence = caseData.evidence.filter(e =>
    e.description.toLowerCase().match(/location|scene|address|place|area/i)
  )

  if (locationEvidence.length > 1) {
    hypotheses.push({
      id: 'location-multiple',
      title: 'Multiple Location Analysis',
      description: 'Evidence suggests multiple locations. Investigate connections between locations.',
      confidence: 55,
      supportingEvidence: locationEvidence.map(e => e.id),
      recommendedActions: [
        'Map all locations on timeline',
        'Check for surveillance footage at each location',
        'Investigate routes between locations',
        'Review traffic camera footage',
      ],
      category: 'location',
    })
  }

  return hypotheses
}
