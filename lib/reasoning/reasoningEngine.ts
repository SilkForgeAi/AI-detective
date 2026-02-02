// Advanced self-reasoning engine with chain-of-thought and self-reflection

import { Case, EvidenceItem, Hypothesis, Anomaly } from '@/types/case'

export interface ReasoningStep {
  id: string
  step: number
  type: 'observation' | 'inference' | 'hypothesis' | 'validation' | 'conclusion' | 'reflection'
  content: string
  evidence: string[]
  confidence: number
  reasoning: string
  alternatives?: string[]
  validation?: {
    passed: boolean
    reason: string
  }
}

export interface ReasoningChain {
  id: string
  caseId: string
  timestamp: string
  steps: ReasoningStep[]
  overallConfidence: number
  reasoningQuality: number // 0-10 scale
  conclusions: string[]
  selfReflection: {
    strengths: string[]
    weaknesses: string[]
    improvements: string[]
    confidenceLevel: 'high' | 'medium' | 'low'
  }
  validated: boolean
}

export interface ReasoningConfig {
  maxSteps: number
  requireValidation: boolean
  minConfidence: number
  enableSelfReflection: boolean
  enableSelfCorrection: boolean
}

const defaultConfig: ReasoningConfig = {
  maxSteps: 15,
  requireValidation: true,
  minConfidence: 0.5,
  enableSelfReflection: true,
  enableSelfCorrection: true,
}

export class ReasoningEngine {
  private config: ReasoningConfig

  constructor(config: Partial<ReasoningConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  async reasonThroughCase(
    caseData: Case,
    allCases: Case[],
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<ReasoningChain> {
    const chain: ReasoningChain = {
      id: `reasoning-${Date.now()}`,
      caseId: caseData.id,
      timestamp: new Date().toISOString(),
      steps: [],
      overallConfidence: 0,
      reasoningQuality: 0,
      conclusions: [],
      selfReflection: {
        strengths: [],
        weaknesses: [],
        improvements: [],
        confidenceLevel: 'medium',
      },
      validated: false,
    }

    // Step 1: Initial Observations
    const observations = await this.makeObservations(caseData, generateFn)
    chain.steps.push(...observations)

    // Step 2: Evidence Analysis
    const evidenceAnalysis = await this.analyzeEvidence(caseData, chain.steps, generateFn)
    chain.steps.push(...evidenceAnalysis)

    // Step 3: Pattern Recognition
    const patterns = await this.recognizePatterns(caseData, allCases, chain.steps, generateFn)
    chain.steps.push(...patterns)

    // Step 4: Hypothesis Generation with Reasoning
    const hypotheses = await this.generateReasonedHypotheses(caseData, chain.steps, generateFn)
    chain.steps.push(...hypotheses)

    // Step 5: Validation and Cross-Checking
    if (this.config.requireValidation) {
      const validations = await this.validateReasoning(chain.steps, generateFn)
      chain.steps.push(...validations)
    }

    // Step 6: Self-Reflection
    if (this.config.enableSelfReflection) {
      const reflection = await this.selfReflect(chain, generateFn)
      chain.selfReflection = reflection
    }

    // Step 7: Self-Correction
    if (this.config.enableSelfCorrection) {
      await this.selfCorrect(chain, generateFn)
    }

    // Step 8: Final Conclusions
    const conclusions = await this.drawConclusions(chain.steps, generateFn)
    chain.conclusions = conclusions

    // Calculate overall metrics
    chain.overallConfidence = this.calculateOverallConfidence(chain.steps)
    chain.reasoningQuality = this.scoreReasoningQuality(chain)
    chain.validated = chain.reasoningQuality >= 8

    return chain
  }

  private async makeObservations(
    caseData: Case,
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<ReasoningStep[]> {
    const prompt = `Analyze this case and make initial observations. List 5-7 key observations with reasoning.

Case: ${caseData.title}
Date: ${caseData.date}
Description: ${caseData.description}
Evidence Count: ${caseData.evidence.length}

For each observation, explain:
1. What you observe
2. Why it's significant
3. What evidence supports it

Format as numbered list.`

    const response = await generateFn(
      prompt,
      'You are a meticulous detective making careful observations. Be specific and evidence-based.'
    )

    return this.parseReasoningSteps(response, 'observation', 1)
  }

  private async analyzeEvidence(
    caseData: Case,
    previousSteps: ReasoningStep[],
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<ReasoningStep[]> {
    const evidenceSummary = caseData.evidence.map(e => `- ${e.type}: ${e.description}`).join('\n')
    const context = previousSteps.map(s => `${s.type}: ${s.content}`).join('\n')

    const prompt = `Based on previous observations, analyze the evidence systematically.

Previous Observations:
${context}

Evidence:
${evidenceSummary}

For each piece of evidence, determine:
1. What it tells us
2. How it connects to observations
3. What questions it raises
4. Reliability assessment

Format as numbered list with reasoning.`

    const response = await generateFn(
      prompt,
      'You are analyzing evidence methodically, looking for connections and inconsistencies.'
    )

    return this.parseReasoningSteps(response, 'inference', previousSteps.length + 1)
  }

  private async recognizePatterns(
    caseData: Case,
    allCases: Case[],
    previousSteps: ReasoningStep[],
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<ReasoningStep[]> {
    const similarCases = allCases
      .filter(c => c.id !== caseData.id)
      .slice(0, 5)
      .map(c => `- ${c.title} (${c.date})`)
      .join('\n')

    const context = previousSteps
      .filter(s => s.type === 'observation' || s.type === 'inference')
      .map(s => s.content)
      .join('\n')

    const prompt = `Identify patterns and connections.

Case Context:
${context}

Similar Cases:
${similarCases}

Analyze:
1. Patterns in MO, timing, location
2. Connections to other cases
3. What patterns suggest
4. Confidence in pattern matches

Format as numbered list with detailed reasoning.`

    const response = await generateFn(
      prompt,
      'You are identifying patterns with careful reasoning, avoiding false connections.'
    )

    return this.parseReasoningSteps(response, 'hypothesis', previousSteps.length + 1)
  }

  private async generateReasonedHypotheses(
    caseData: Case,
    previousSteps: ReasoningStep[],
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<ReasoningStep[]> {
    const reasoningChain = previousSteps
      .map(s => `Step ${s.step} (${s.type}): ${s.content}`)
      .join('\n')

    const prompt = `Generate hypotheses based on the reasoning chain.

Reasoning So Far:
${reasoningChain}

For each hypothesis:
1. State the hypothesis clearly
2. Explain the reasoning that leads to it
3. List supporting evidence
4. Consider alternative explanations
5. Assess confidence level

Format as numbered list with full reasoning.`

    const response = await generateFn(
      prompt,
      'You are generating hypotheses with clear logical reasoning, considering alternatives.'
    )

    return this.parseReasoningSteps(response, 'hypothesis', previousSteps.length + 1)
  }

  private async validateReasoning(
    steps: ReasoningStep[],
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<ReasoningStep[]> {
    const reasoningSummary = steps
      .map(s => `Step ${s.step}: ${s.content} (Confidence: ${s.confidence}%)`)
      .join('\n')

    const prompt = `Validate the reasoning chain. Check each step for:
1. Logical consistency
2. Evidence support
3. Potential errors or biases
4. Missing considerations

Reasoning Chain:
${reasoningSummary}

For each validation:
- Identify what you're checking
- Explain why it's valid or invalid
- Suggest improvements if needed

Format as numbered list.`

    const response = await generateFn(
      prompt,
      'You are a critical validator, checking reasoning for errors and improvements.'
    )

    const validationSteps = this.parseReasoningSteps(response, 'validation', steps.length + 1)
    
    // Update original steps with validation results
    validationSteps.forEach(vStep => {
      const stepNum = this.extractStepNumber(vStep.content)
      if (stepNum && steps[stepNum - 1]) {
        steps[stepNum - 1].validation = {
          passed: !vStep.content.toLowerCase().includes('invalid') && 
                  !vStep.content.toLowerCase().includes('error'),
          reason: vStep.content,
        }
      }
    })

    return validationSteps
  }

  private async selfReflect(
    chain: ReasoningChain,
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<ReasoningChain['selfReflection']> {
    const reasoningSummary = chain.steps
      .map(s => `${s.type}: ${s.content} (Confidence: ${s.confidence}%)`)
      .join('\n')

    const prompt = `Reflect on your reasoning process. Be honest and critical.

Reasoning Process:
${reasoningSummary}

Assess:
1. Strengths: What did you do well?
2. Weaknesses: Where could you improve?
3. Improvements: Specific ways to enhance reasoning
4. Overall confidence: High, Medium, or Low and why

Be specific and actionable.`

    const response = await generateFn(
      prompt,
      'You are engaging in honest self-reflection to improve your reasoning.'
    )

    return this.parseReflection(response)
  }

  private async selfCorrect(
    chain: ReasoningChain,
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<void> {
    if (chain.selfReflection.weaknesses.length === 0) return

    const weaknesses = chain.selfReflection.weaknesses.join('\n')
    const stepsToCorrect = chain.steps
      .filter(s => s.confidence < 70 || !s.validation?.passed)
      .map(s => `Step ${s.step}: ${s.content}`)
      .join('\n')

    const prompt = `Correct weaknesses in your reasoning.

Identified Weaknesses:
${weaknesses}

Steps Needing Correction:
${stepsToCorrect}

Provide corrected reasoning for each weak step.`

    const response = await generateFn(
      prompt,
      'You are correcting your reasoning to improve accuracy and quality.'
    )

    // Update steps with corrections
    const corrections = this.parseReasoningSteps(response, 'reflection', chain.steps.length + 1)
    chain.steps.push(...corrections)
  }

  private async drawConclusions(
    steps: ReasoningStep[],
    generateFn: (prompt: string, systemPrompt?: string) => Promise<string>
  ): Promise<string[]> {
    const keySteps = steps
      .filter(s => s.type === 'hypothesis' || s.type === 'conclusion')
      .map(s => s.content)
      .join('\n')

    const prompt = `Draw final conclusions based on the complete reasoning chain.

Key Reasoning:
${keySteps}

Provide 5-8 specific, actionable conclusions. Each should:
1. Be clearly stated
2. Be supported by the reasoning chain
3. Include confidence level
4. Be actionable

Format as numbered list.`

    const response = await generateFn(
      prompt,
      'You are drawing final conclusions with clear reasoning and appropriate confidence.'
    )

    return response
      .split('\n')
      .filter(line => line.trim() && (line.match(/^\d+\./) || line.startsWith('-')))
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 8)
  }

  private parseReasoningSteps(
    response: string,
    type: ReasoningStep['type'],
    startStep: number
  ): ReasoningStep[] {
    const lines = response.split('\n').filter(line => line.trim())
    const steps: ReasoningStep[] = []
    let currentStep = startStep

    for (const line of lines) {
      if (line.match(/^\d+\./) || line.match(/^[-*]/)) {
        const content = line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim()
        if (content.length > 10) {
          // Extract confidence if mentioned
          const confidenceMatch = content.match(/(\d+)%?\s*(confidence|confident)/i)
          const confidence = confidenceMatch 
            ? parseInt(confidenceMatch[1]) 
            : this.estimateConfidence(content)

          steps.push({
            id: `step-${currentStep}-${Date.now()}`,
            step: currentStep++,
            type,
            content,
            evidence: this.extractEvidenceReferences(content),
            confidence,
            reasoning: content,
          })
        }
      }
    }

    return steps
  }

  private parseReflection(response: string): ReasoningChain['selfReflection'] {
    const reflection: ReasoningChain['selfReflection'] = {
      strengths: [],
      weaknesses: [],
      improvements: [],
      confidenceLevel: 'medium',
    }

    const sections = response.split(/(?:strengths?|weaknesses?|improvements?|confidence)/i)
    
    sections.forEach(section => {
      const lower = section.toLowerCase()
      if (lower.includes('strength')) {
        reflection.strengths = this.extractListItems(section)
      } else if (lower.includes('weakness')) {
        reflection.weaknesses = this.extractListItems(section)
      } else if (lower.includes('improve')) {
        reflection.improvements = this.extractListItems(section)
      } else if (lower.includes('confidence')) {
        if (lower.includes('high')) reflection.confidenceLevel = 'high'
        else if (lower.includes('low')) reflection.confidenceLevel = 'low'
      }
    })

    return reflection
  }

  private extractListItems(text: string): string[] {
    return text
      .split('\n')
      .filter(line => line.match(/^\d+\.|^[-*]/))
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(item => item.length > 5)
  }

  private extractEvidenceReferences(content: string): string[] {
    const matches = content.match(/evidence\s+[A-Z0-9]+/gi) || []
    return matches.map(m => m.trim())
  }

  private extractStepNumber(content: string): number | null {
    const match = content.match(/step\s+(\d+)/i)
    return match ? parseInt(match[1]) : null
  }

  private estimateConfidence(content: string): number {
    const lower = content.toLowerCase()
    if (lower.includes('certain') || lower.includes('definite')) return 90
    if (lower.includes('likely') || lower.includes('probable')) return 75
    if (lower.includes('possible') || lower.includes('might')) return 50
    if (lower.includes('uncertain') || lower.includes('unclear')) return 30
    return 60 // Default medium confidence
  }

  private calculateOverallConfidence(steps: ReasoningStep[]): number {
    if (steps.length === 0) return 0
    const sum = steps.reduce((acc, step) => acc + step.confidence, 0)
    return Math.round(sum / steps.length)
  }

  private scoreReasoningQuality(chain: ReasoningChain): number {
    let score = 0

    // Step count (max 2 points)
    if (chain.steps.length >= 10) score += 2
    else if (chain.steps.length >= 5) score += 1

    // Validation (max 2 points)
    const validatedSteps = chain.steps.filter(s => s.validation?.passed).length
    if (validatedSteps >= chain.steps.length * 0.8) score += 2
    else if (validatedSteps >= chain.steps.length * 0.5) score += 1

    // Self-reflection (max 2 points)
    if (chain.selfReflection.strengths.length > 0 && 
        chain.selfReflection.weaknesses.length > 0) score += 2
    else if (chain.selfReflection.strengths.length > 0 || 
             chain.selfReflection.weaknesses.length > 0) score += 1

    // Confidence consistency (max 2 points)
    const confidences = chain.steps.map(s => s.confidence)
    const avgConf = confidences.reduce((a, b) => a + b, 0) / confidences.length
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConf, 2), 0) / confidences.length
    if (variance < 100) score += 2
    else if (variance < 200) score += 1

    // Conclusion quality (max 2 points)
    if (chain.conclusions.length >= 5) score += 2
    else if (chain.conclusions.length >= 3) score += 1

    return Math.min(10, score)
  }
}

export const reasoningEngine = new ReasoningEngine()
