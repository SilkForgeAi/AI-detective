// Enhanced Case data model with comprehensive fields

export interface EvidenceItem {
  id: string
  type: 'document' | 'image' | 'audio' | 'video' | 'physical' | 'witness_statement' | 'forensic' | 'other'
  description: string
  source?: string
  date?: string
  fileUrl?: string
  metadata?: Record<string, any>
  confidence?: number
}

export interface Hypothesis {
  id: string
  title: string
  description: string
  confidence: number // 0-100
  supportingEvidence: string[]
  conflictingEvidence?: string[]
  recommendedActions: string[]
  category: 'suspect' | 'timeline' | 'motive' | 'connection' | 'location' | 'other'
}

export interface PatternMatch {
  caseId: string
  caseTitle: string
  similarityScore: number
  matchingFactors: string[]
  moSimilarity?: number
  geographicProximity?: number
  temporalProximity?: number
}

export interface Anomaly {
  id: string
  type: 'inconsistency' | 'timeline_gap' | 'evidence_conflict' | 'witness_discrepancy' | 'data_quality'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedElements: string[]
  suggestedInvestigation: string[]
}

export interface TimelineEvent {
  id: string
  date: string
  time?: string
  description: string
  source: string
  confidence: number
  category: 'incident' | 'witness' | 'evidence' | 'investigation' | 'other'
}

export interface Location {
  id: string
  name: string
  coordinates?: { lat: number; lng: number }
  address?: string
  type: 'crime_scene' | 'witness_location' | 'suspect_location' | 'evidence_location' | 'other'
  date?: string
}

export interface IntelligentPattern {
  id: string
  name: string
  type: 'serial_offender' | 'geographic_cluster' | 'temporal_series' | 'evidence_chain' | 'suspect_link'
  confidence: number
  cases: string[] // Case IDs
  description: string
  indicators: string[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface CaseAnalysis {
  caseId: string
  timestamp: string
  insights: string[]
  hypotheses: Hypothesis[]
  patterns: PatternMatch[]
  intelligentPatterns?: IntelligentPattern[]
  anomalies: Anomaly[]
  timeline: TimelineEvent[]
  locations: Location[]
  confidenceScores: {
    overall: number
    evidenceQuality: number
    witnessReliability: number
    forensicStrength: number
    serialOffenderProbability?: number
  }
  recommendations: string[]
  sources: string[]
  auditTrail: AnalysisAuditEntry[]
}

export interface AnalysisAuditEntry {
  timestamp: string
  action: string
  userId?: string
  details: Record<string, any>
}

export interface Case {
  id: string
  title: string
  date: string
  status: 'open' | 'analyzing' | 'solved' | 'cold' | 'closed'
  description: string
  evidence: EvidenceItem[]
  insights?: string[]
  analysis?: CaseAnalysis
  tags: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  jurisdiction?: string
  caseNumber?: string
  assignedOfficer?: string
  createdAt: string
  updatedAt: string
  privacyFlags: {
    anonymized: boolean
    publicDataOnly: boolean
    requiresVerification: boolean
  }
}
