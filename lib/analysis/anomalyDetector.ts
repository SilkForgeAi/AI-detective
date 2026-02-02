// Anomaly detection for inconsistencies and data quality issues

import { Case, Anomaly, TimelineEvent, EvidenceItem } from '@/types/case'

export function detectAnomalies(caseData: Case): Anomaly[] {
  const anomalies: Anomaly[] = []

  // Timeline inconsistencies
  const timelineAnomalies = detectTimelineAnomalies(caseData)
  anomalies.push(...timelineAnomalies)

  // Evidence conflicts
  const evidenceAnomalies = detectEvidenceConflicts(caseData)
  anomalies.push(...evidenceAnomalies)

  // Witness statement inconsistencies
  const witnessAnomalies = detectWitnessInconsistencies(caseData)
  anomalies.push(...witnessAnomalies)

  // Data quality issues
  const qualityAnomalies = detectDataQualityIssues(caseData)
  anomalies.push(...qualityAnomalies)

  return anomalies.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

function detectTimelineAnomalies(caseData: Case): Anomaly[] {
  const anomalies: Anomaly[] = []

  if (!caseData.analysis?.timeline || caseData.analysis.timeline.length < 2) {
    return anomalies
  }

  const timeline = caseData.analysis.timeline.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Check for gaps in timeline
  for (let i = 1; i < timeline.length; i++) {
    const prevDate = new Date(timeline[i - 1].date)
    const currDate = new Date(timeline[i].date)
    const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays > 30 && diffDays < 365) {
      anomalies.push({
        id: `timeline-gap-${i}`,
        type: 'timeline_gap',
        severity: 'medium',
        description: `Significant gap of ${Math.round(diffDays)} days between events`,
        affectedElements: [timeline[i - 1].id, timeline[i].id],
        suggestedInvestigation: [
          'Review records for missing events during this period',
          'Check for additional witness statements',
          'Verify evidence collection dates',
        ],
      })
    }
  }

  // Check for impossible sequences (e.g., evidence collected before incident)
  const incidentDate = new Date(caseData.date)
  const evidenceBeforeIncident = caseData.evidence.filter(e => {
    if (!e.date) return false
    return new Date(e.date) < incidentDate
  })

  if (evidenceBeforeIncident.length > 0) {
    anomalies.push({
      id: 'timeline-impossible',
      type: 'timeline_gap',
      severity: 'high',
      description: 'Evidence dated before the incident date',
      affectedElements: evidenceBeforeIncident.map(e => e.id),
      suggestedInvestigation: [
        'Verify evidence collection dates',
        'Check for data entry errors',
        'Review chain of custody documentation',
      ],
    })
  }

  return anomalies
}

function detectEvidenceConflicts(caseData: Case): Anomaly[] {
  const anomalies: Anomaly[] = []

  // Check for contradictory evidence descriptions
  const evidenceDescriptions = caseData.evidence.map(e => e.description.toLowerCase())
  const keywords = ['weapon', 'location', 'time', 'suspect', 'vehicle']

  for (const keyword of keywords) {
    const mentions = evidenceDescriptions
      .map((desc, idx) => ({ desc, idx }))
      .filter(({ desc }) => desc.includes(keyword))

    if (mentions.length > 1) {
      // Check for contradictions (simplified - can be enhanced with NLP)
      const uniqueValues = new Set(
        mentions.map(({ desc }) => {
          // Extract potential values (simplified extraction)
          const match = desc.match(new RegExp(`${keyword}[\\s:]+([^,;.]+)`, 'i'))
          return match ? match[1].trim() : null
        })
      )

      if (uniqueValues.size > 1 && uniqueValues.size === mentions.length) {
        anomalies.push({
          id: `evidence-conflict-${keyword}`,
          type: 'evidence_conflict',
          severity: 'high',
          description: `Conflicting information about ${keyword} across evidence items`,
          affectedElements: mentions.map(({ idx }) => caseData.evidence[idx].id),
          suggestedInvestigation: [
            'Review original evidence sources',
            'Verify evidence authenticity',
            'Check for transcription errors',
            'Re-interview witnesses if applicable',
          ],
        })
      }
    }
  }

  return anomalies
}

function detectWitnessInconsistencies(caseData: Case): Anomaly[] {
  const anomalies: Anomaly[] = []

  const witnessStatements = caseData.evidence.filter(
    e => e.type === 'witness_statement'
  )

  if (witnessStatements.length < 2) {
    return anomalies
  }

  // Check for significant differences in witness accounts
  const statements = witnessStatements.map(e => e.description.toLowerCase())
  
  // Simple keyword-based inconsistency detection
  const keyDetails = ['time', 'location', 'description', 'suspect']
  let inconsistencyCount = 0

  for (const detail of keyDetails) {
    const mentions = statements.filter(s => s.includes(detail))
    if (mentions.length >= 2) {
      // Check if descriptions are significantly different (simplified)
      const uniquePhrases = new Set(
        mentions.map(s => {
          const match = s.match(new RegExp(`${detail}[\\s:]+([^,;.]+)`, 'i'))
          return match ? match[1].trim().substring(0, 20) : null
        })
      )
      if (uniquePhrases.size > 1) inconsistencyCount++
    }
  }

  if (inconsistencyCount >= 2) {
    anomalies.push({
      id: 'witness-inconsistency',
      type: 'witness_discrepancy',
      severity: 'medium',
      description: 'Significant inconsistencies detected across witness statements',
      affectedElements: witnessStatements.map(e => e.id),
      suggestedInvestigation: [
        'Re-interview witnesses separately',
        'Review original statement recordings',
        'Check for memory contamination',
        'Consider witness credibility assessment',
      ],
    })
  }

  return anomalies
}

function detectDataQualityIssues(caseData: Case): Anomaly[] {
  const anomalies: Anomaly[] = []

  // Missing critical information
  if (!caseData.description || caseData.description.length < 50) {
    anomalies.push({
      id: 'data-quality-description',
      type: 'data_quality',
      severity: 'low',
      description: 'Case description is brief or missing',
      affectedElements: ['description'],
      suggestedInvestigation: ['Gather additional case details'],
    })
  }

  // Insufficient evidence
  if (caseData.evidence.length < 3) {
    anomalies.push({
      id: 'data-quality-evidence',
      type: 'data_quality',
      severity: 'medium',
      description: 'Limited evidence available for analysis',
      affectedElements: caseData.evidence.map(e => e.id),
      suggestedInvestigation: [
        'Review case files for additional evidence',
        'Check for archived materials',
        'Verify all evidence has been catalogued',
      ],
    })
  }

  // Missing dates
  const evidenceWithoutDates = caseData.evidence.filter(e => !e.date)
  if (evidenceWithoutDates.length > caseData.evidence.length * 0.3) {
    anomalies.push({
      id: 'data-quality-dates',
      type: 'data_quality',
      severity: 'low',
      description: 'Many evidence items missing dates',
      affectedElements: evidenceWithoutDates.map(e => e.id),
      suggestedInvestigation: ['Update evidence records with collection dates'],
    })
  }

  return anomalies
}
