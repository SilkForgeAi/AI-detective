// Case repository for database operations
import { db } from './db'
import { cases, evidence, analyses } from './schema'
import { eq, desc, and, or, like } from 'drizzle-orm'
import { Case, CaseAnalysis, EvidenceItem } from '@/types/case'

export class CaseRepository {
  async getAll(userId?: string): Promise<Case[]> {
    let query = db.select().from(cases)
    
    // Filter by user if provided
    if (userId) {
      query = query.where(eq(cases.userId, userId)) as any
    }
    
    const dbCases = await query.orderBy(desc(cases.createdAt))
    const result: Case[] = []

    for (const dbCase of dbCases) {
      const caseEvidence = await db.select()
        .from(evidence)
        .where(eq(evidence.caseId, dbCase.id))

      const caseAnalysis = await db.select()
        .from(analyses)
        .where(eq(analyses.caseId, dbCase.id))
        .orderBy(desc(analyses.createdAt))
        .limit(1)

      result.push({
        id: dbCase.id,
        title: dbCase.title,
        date: dbCase.date,
        status: dbCase.status as Case['status'],
        description: dbCase.description,
        evidence: caseEvidence.map(e => ({
          id: e.id,
          type: e.type as EvidenceItem['type'],
          description: e.description,
          source: e.source,
          date: e.date || undefined,
          fileUrl: e.fileUrl || undefined,
          metadata: e.metadata ? JSON.parse(e.metadata) : undefined,
          confidence: e.confidence || undefined,
        })),
        insights: caseAnalysis[0]?.insights ? JSON.parse(caseAnalysis[0].insights) : undefined,
        analysis: caseAnalysis[0] ? this.parseAnalysis(caseAnalysis[0]) : undefined,
        tags: dbCase.tags ? JSON.parse(dbCase.tags) : [],
        priority: dbCase.priority as Case['priority'],
        jurisdiction: dbCase.jurisdiction || undefined,
        caseNumber: dbCase.caseNumber || undefined,
        assignedOfficer: dbCase.assignedOfficer || undefined,
        createdAt: dbCase.createdAt,
        updatedAt: dbCase.updatedAt,
        privacyFlags: dbCase.privacyFlags ? JSON.parse(dbCase.privacyFlags) : {
          anonymized: false,
          publicDataOnly: true,
          requiresVerification: false,
        },
      })
    }

    return result
  }

  async getByUserId(userId: string): Promise<Case[]> {
    return this.getAll(userId)
  }

  async getById(id: string): Promise<Case | null> {
    const dbCase = await db.select().from(cases).where(eq(cases.id, id)).limit(1)
    if (dbCase.length === 0) return null

    const caseData = dbCase[0]
    const caseEvidence = await db.select()
      .from(evidence)
      .where(eq(evidence.caseId, id))

    const caseAnalysis = await db.select()
      .from(analyses)
      .where(eq(analyses.caseId, id))
      .orderBy(desc(analyses.createdAt))
      .limit(1)

    return {
      id: caseData.id,
      title: caseData.title,
      date: caseData.date,
      status: caseData.status as Case['status'],
      description: caseData.description,
      evidence: caseEvidence.map(e => ({
        id: e.id,
        type: e.type as EvidenceItem['type'],
        description: e.description,
        source: e.source,
        date: e.date || undefined,
        fileUrl: e.fileUrl || undefined,
        metadata: e.metadata ? JSON.parse(e.metadata) : undefined,
        confidence: e.confidence || undefined,
      })),
      insights: caseAnalysis[0]?.insights ? JSON.parse(caseAnalysis[0].insights) : undefined,
      analysis: caseAnalysis[0] ? this.parseAnalysis(caseAnalysis[0]) : undefined,
      tags: caseData.tags ? JSON.parse(caseData.tags) : [],
      priority: caseData.priority as Case['priority'],
      jurisdiction: caseData.jurisdiction || undefined,
      caseNumber: caseData.caseNumber || undefined,
      assignedOfficer: caseData.assignedOfficer || undefined,
      createdAt: caseData.createdAt,
      updatedAt: caseData.updatedAt,
      privacyFlags: caseData.privacyFlags ? JSON.parse(caseData.privacyFlags) : {
        anonymized: false,
        publicDataOnly: true,
        requiresVerification: false,
      },
    }
  }

  async create(caseData: Case & { userId?: string }): Promise<Case> {
    await db.insert(cases).values({
      id: caseData.id,
      userId: caseData.userId || null,
      title: caseData.title,
      date: caseData.date,
      status: caseData.status,
      description: caseData.description,
      jurisdiction: caseData.jurisdiction || null,
      caseNumber: caseData.caseNumber || null,
      assignedOfficer: caseData.assignedOfficer || null,
      priority: caseData.priority,
      tags: JSON.stringify(caseData.tags || []),
      createdAt: caseData.createdAt,
      updatedAt: caseData.updatedAt,
      privacyFlags: JSON.stringify(caseData.privacyFlags),
    })

    // Insert evidence
    if (caseData.evidence.length > 0) {
      await db.insert(evidence).values(
        caseData.evidence.map(e => ({
          id: e.id,
          caseId: caseData.id,
          type: e.type,
          description: e.description,
          source: e.source || null,
          date: e.date || null,
          fileUrl: e.fileUrl || null,
          metadata: e.metadata ? JSON.stringify(e.metadata) : null,
          confidence: e.confidence || null,
        }))
      )
    }

    return caseData
  }

  async update(caseData: Case): Promise<Case> {
    await db.update(cases)
      .set({
        title: caseData.title,
        date: caseData.date,
        status: caseData.status,
        description: caseData.description,
        jurisdiction: caseData.jurisdiction || null,
        caseNumber: caseData.caseNumber || null,
        assignedOfficer: caseData.assignedOfficer || null,
        priority: caseData.priority,
        tags: JSON.stringify(caseData.tags || []),
        updatedAt: new Date().toISOString(),
        privacyFlags: JSON.stringify(caseData.privacyFlags),
      })
      .where(eq(cases.id, caseData.id))

    // Update evidence (delete old, insert new)
    await db.delete(evidence).where(eq(evidence.caseId, caseData.id))
    if (caseData.evidence.length > 0) {
      await db.insert(evidence).values(
        caseData.evidence.map(e => ({
          id: e.id,
          caseId: caseData.id,
          type: e.type,
          description: e.description,
          source: e.source || null,
          date: e.date || null,
          fileUrl: e.fileUrl || null,
          metadata: e.metadata ? JSON.stringify(e.metadata) : null,
          confidence: e.confidence || null,
        }))
      )
    }

    return caseData
  }

  async saveAnalysis(caseId: string, analysis: CaseAnalysis): Promise<void> {
    await db.insert(analyses).values({
      id: `analysis-${Date.now()}`,
      caseId,
      timestamp: analysis.timestamp,
      insights: JSON.stringify(analysis.insights),
      hypotheses: JSON.stringify(analysis.hypotheses),
      patterns: JSON.stringify(analysis.patterns),
      anomalies: JSON.stringify(analysis.anomalies),
      timeline: JSON.stringify(analysis.timeline),
      locations: JSON.stringify(analysis.locations),
      confidenceScores: JSON.stringify(analysis.confidenceScores),
      recommendations: JSON.stringify(analysis.recommendations),
      sources: JSON.stringify(analysis.sources),
      auditTrail: JSON.stringify(analysis.auditTrail),
      reasoningChain: (analysis as any)._reasoningChain ? JSON.stringify((analysis as any)._reasoningChain) : null,
    })
  }

  async search(query: string, filters?: {
    status?: string[]
    jurisdiction?: string
    priority?: string[]
    dateFrom?: string
    dateTo?: string
    userId?: string
  }): Promise<Case[]> {
    let queryBuilder = db.select().from(cases)

    const conditions = []
    
    if (query) {
      conditions.push(
        or(
          like(cases.title, `%${query}%`),
          like(cases.description, `%${query}%`),
          like(cases.caseNumber, `%${query}%`)
        )
      )
    }

    if (filters?.status && filters.status.length > 0) {
      conditions.push(
        or(...filters.status.map(s => eq(cases.status, s)))
      )
    }

    if (filters?.jurisdiction) {
      conditions.push(eq(cases.jurisdiction, filters.jurisdiction))
    }

    if (filters?.priority && filters.priority.length > 0) {
      conditions.push(
        or(...filters.priority.map(p => eq(cases.priority, p)))
      )
    }

    if (filters?.userId) {
      conditions.push(eq(cases.userId, filters.userId))
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any
    }

    const dbCases = await queryBuilder.orderBy(desc(cases.createdAt))
    
    // Load full case data
    const result: Case[] = []
    for (const dbCase of dbCases) {
      const fullCase = await this.getById(dbCase.id)
      if (fullCase) result.push(fullCase)
    }

    return result
  }

  private parseAnalysis(dbAnalysis: any): CaseAnalysis {
    return {
      caseId: dbAnalysis.caseId,
      timestamp: dbAnalysis.timestamp,
      insights: dbAnalysis.insights ? JSON.parse(dbAnalysis.insights) : [],
      hypotheses: dbAnalysis.hypotheses ? JSON.parse(dbAnalysis.hypotheses) : [],
      patterns: dbAnalysis.patterns ? JSON.parse(dbAnalysis.patterns) : [],
      anomalies: dbAnalysis.anomalies ? JSON.parse(dbAnalysis.anomalies) : [],
      timeline: dbAnalysis.timeline ? JSON.parse(dbAnalysis.timeline) : [],
      locations: dbAnalysis.locations ? JSON.parse(dbAnalysis.locations) : [],
      confidenceScores: dbAnalysis.confidenceScores ? JSON.parse(dbAnalysis.confidenceScores) : {
        overall: 0,
        evidenceQuality: 0,
        witnessReliability: 0,
        forensicStrength: 0,
      },
      recommendations: dbAnalysis.recommendations ? JSON.parse(dbAnalysis.recommendations) : [],
      sources: dbAnalysis.sources ? JSON.parse(dbAnalysis.sources) : [],
      auditTrail: dbAnalysis.auditTrail ? JSON.parse(dbAnalysis.auditTrail) : [],
      ...(dbAnalysis.reasoningChain ? { _reasoningChain: JSON.parse(dbAnalysis.reasoningChain) } : {}),
    }
  }
}

export const caseRepository = new CaseRepository()
