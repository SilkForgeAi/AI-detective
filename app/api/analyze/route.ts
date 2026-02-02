import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import OpenAI from 'openai'
import { Case, CaseAnalysis } from '@/types/case'
import { findPatternMatches } from '@/lib/analysis/patternMatcher'
import { advancedPatternMatcher } from '@/lib/analysis/advancedPatternMatcher'
import { intelligentPatternAnalyzer } from '@/lib/analysis/intelligentPatterns'
import { detectAnomalies } from '@/lib/analysis/anomalyDetector'
import { generateHypotheses } from '@/lib/analysis/hypothesisGenerator'
import { anonymizeText, validatePublicDataOnly, createAuditEntry } from '@/lib/ethics/privacy'
import { LlamaClient, llamaClient } from '@/lib/llm/llamaClient'
import { selfImprovementSystem } from '@/lib/learning/selfImprovement'
import { feedbackSystem } from '@/lib/learning/feedbackSystem'
import { reasoningEngine } from '@/lib/reasoning/reasoningEngine'
import { setReasoningChain, getReasoningChain } from '@/lib/reasoning/reasoningCache'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { caseData, allCases = [] } = await request.json()

    // Privacy validation
    const privacyCheck = validatePublicDataOnly(caseData)
    if (!privacyCheck.valid) {
      return NextResponse.json(
        { error: 'Privacy violation detected', warnings: privacyCheck.warnings },
        { status: 400 }
      )
    }

    // Anonymize sensitive data
    const anonymizedDescription = anonymizeText(caseData.description || '')
    const anonymizedCase = {
      ...caseData,
      description: anonymizedDescription,
    }

    // Run comprehensive analysis with advanced pattern matching
    const basicPatterns = findPatternMatches(anonymizedCase as Case, allCases as Case[])
    
    // Advanced intelligent pattern analysis
    const advancedAnalysis = await advancedPatternMatcher.findAdvancedPatterns(
      anonymizedCase as Case,
      allCases as Case[]
    )
    
    const intelligentAnalysis = await intelligentPatternAnalyzer.analyzePatterns(
      anonymizedCase as Case,
      allCases as Case[]
    )
    
    // Merge patterns (prioritize advanced matches)
    const patterns = [
      ...advancedAnalysis.matches,
      ...basicPatterns.filter(bp => 
        !advancedAnalysis.matches.some(ap => ap.caseId === bp.caseId)
      ),
    ]
    
    const anomalies = detectAnomalies(anonymizedCase as Case)
    const hypotheses = generateHypotheses(anonymizedCase as Case, allCases as Case[])

    // Check for Llama availability
    const useLlama = process.env.USE_LLAMA === 'true'
    let llama: LlamaClient | null = null
    
    if (useLlama) {
      try {
        const available = await llamaClient.checkAvailability()
        if (available) {
          llama = llamaClient
        }
      } catch (error) {
        console.log('Llama not available, falling back to OpenAI')
      }
    }

    // Get learning metrics for improved analysis
    const metrics = feedbackSystem.calculateMetrics()
    const strategy = selfImprovementSystem.getCurrentStrategy()

    // Generate AI insights using Llama, OpenAI, or fallback
    let insights: string[] = []
    let recommendations: string[] = []
    let reasoningChain = null

    // Create generate function for reasoning engine
    const generateFn = async (prompt: string, systemPrompt?: string): Promise<string> => {
      if (llama) {
        return await llama.generate(prompt, systemPrompt)
      } else if (process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt || 'You are an expert cold case detective.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        })
        return completion.choices[0]?.message?.content || ''
      }
      return '' // Fallback
    }

    // Run advanced reasoning if enabled
    const useReasoning = process.env.USE_REASONING !== 'false' // Default to true
    if (useReasoning && (llama || process.env.OPENAI_API_KEY)) {
      try {
        // Check cache first
        const cached = getReasoningChain(anonymizedCase.id)
        if (cached) {
          reasoningChain = cached
          insights = reasoningChain.conclusions
        } else {
          reasoningChain = await reasoningEngine.reasonThroughCase(
            anonymizedCase as Case,
            allCases as Case[],
            generateFn
          )
          // Cache the reasoning chain
          setReasoningChain(anonymizedCase.id, reasoningChain)
          // Use conclusions from reasoning chain as insights
          insights = reasoningChain.conclusions
        }
      } catch (reasoningError) {
        console.error('Reasoning engine error:', reasoningError)
        // Fall through to standard analysis
      }
    }

    if (insights.length === 0 && llama) {
      // Use Llama with learning enhancement
      try {
        const learningPrompt = feedbackSystem.generateLearningPrompt(metrics)
        const prompt = `You are an expert cold case detective analyzing a case. ${learningPrompt}

Case Title: ${anonymizedCase.title}
Date: ${anonymizedCase.date}
Description: ${anonymizedDescription}
Evidence: ${(anonymizedCase.evidence || []).map((e: any) => e.description || e).join(', ')}

Detected Anomalies: ${anomalies.map(a => a.description).join('; ')}
Pattern Matches: ${patterns.length} similar cases found
Hypotheses: ${hypotheses.length} hypotheses generated

${strategy?.learnedRules.length ? `Learned Rules: ${strategy.learnedRules.join('; ')}` : ''}

Provide:
1. Key patterns or anomalies detected
2. Potential connections to other cases
3. Critical evidence that needs further investigation
4. Recommended next steps
5. Any red flags or inconsistencies

Format your response as a list of specific, actionable insights (one per line, maximum 8 insights).`

        const response = await llama.generate(prompt,
          'You are an expert cold case detective with decades of experience. You learn from past mistakes and continuously improve. Provide concise, actionable insights. Always emphasize that findings are suggestions requiring human verification.'
        )

        insights = response
          .split('\n')
          .filter((line) => line.trim() && (line.match(/^\d+\./) || line.startsWith('-')))
          .map((line) => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
          .filter((line) => line.length > 0)
          .slice(0, 8)

        recommendations = [
          'Review all anomalies flagged by the system',
          'Investigate pattern matches with similar cases',
          'Prioritize high-confidence hypotheses for follow-up',
          'Verify all AI-generated insights with original evidence',
          'Consider human-in-the-loop verification for critical findings',
          ...(metrics.averageAccuracy < 80 ? ['Note: System is learning - verify findings carefully'] : []),
        ]
      } catch (llamaError) {
        console.error('Llama analysis error:', llamaError)
        // Fall through to OpenAI or fallback
      }
    }

    if (insights.length === 0 && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `You are an expert cold case detective analyzing a case. Provide detailed insights and analysis.

Case Title: ${anonymizedCase.title}
Date: ${anonymizedCase.date}
Description: ${anonymizedDescription}
Evidence: ${(anonymizedCase.evidence || []).map((e: any) => e.description || e).join(', ')}

Detected Anomalies: ${anomalies.map(a => a.description).join('; ')}
Pattern Matches: ${patterns.length} similar cases found
Hypotheses: ${hypotheses.length} hypotheses generated

Provide:
1. Key patterns or anomalies detected
2. Potential connections to other cases
3. Critical evidence that needs further investigation
4. Recommended next steps
5. Any red flags or inconsistencies

Format your response as a list of specific, actionable insights (one per line, maximum 8 insights).`

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert cold case detective with decades of experience. Provide concise, actionable insights. Always emphasize that findings are suggestions requiring human verification.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        })

        const response = completion.choices[0]?.message?.content || ''
        insights = response
          .split('\n')
          .filter((line) => line.trim() && (line.match(/^\d+\./) || line.startsWith('-')))
          .map((line) => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
          .filter((line) => line.length > 0)
          .slice(0, 8)

        // Generate recommendations
        recommendations = [
          'Review all anomalies flagged by the system',
          'Investigate pattern matches with similar cases',
          'Prioritize high-confidence hypotheses for follow-up',
          'Verify all AI-generated insights with original evidence',
          'Consider human-in-the-loop verification for critical findings',
        ]
      } catch (aiError) {
        console.error('OpenAI API error:', aiError)
        // Fallback insights
        insights = [
          'Pattern analysis completed - review pattern matches',
          'Anomalies detected - investigate flagged inconsistencies',
          'Multiple hypotheses generated - prioritize by confidence score',
          'Cross-reference findings with original case files',
        ]
      }
    } else {
      // Fallback insights without API
      insights = [
        `Found ${patterns.length} potential pattern matches with other cases`,
        `Detected ${anomalies.length} anomalies requiring investigation`,
        `Generated ${hypotheses.length} hypotheses for follow-up`,
        'Review pattern matches for potential serial offender connections',
        'Investigate high-severity anomalies first',
      ]
      recommendations = [
        'Review pattern matches with similar cases',
        'Investigate detected anomalies',
        'Prioritize high-confidence hypotheses',
        'Verify all findings with original evidence',
      ]
    }

    // Calculate confidence scores
    const evidenceQuality = Math.min(100, Math.max(0, 
      (anonymizedCase.evidence?.length || 0) * 15 + 
      (anonymizedCase.description?.length || 0) / 10
    ))
    const overallConfidence = Math.min(100, 
      (evidenceQuality * 0.4) + 
      (patterns.length > 0 ? 30 : 10) + 
      (anomalies.filter(a => a.severity === 'low').length * 5)
    )

    // Create comprehensive analysis
    const analysis: CaseAnalysis = {
      caseId: anonymizedCase.id,
      timestamp: new Date().toISOString(),
      insights,
      hypotheses,
      patterns,
      intelligentPatterns: intelligentAnalysis.patterns.map(p => ({
        ...p,
        cases: p.cases.map(c => c.id), // Store only IDs
      })),
      anomalies,
      timeline: [], // Can be enhanced with timeline extraction
      locations: [], // Can be enhanced with location extraction
      confidenceScores: {
        overall: reasoningChain 
          ? Math.round(reasoningChain.overallConfidence) 
          : Math.round(overallConfidence),
        evidenceQuality: Math.round(evidenceQuality),
        witnessReliability: 50, // Placeholder
        forensicStrength: anonymizedCase.evidence?.some((e: any) => e.type === 'forensic') ? 70 : 30,
        serialOffenderProbability: intelligentAnalysis.serialOffenderProbability,
      },
      recommendations: [
        ...recommendations,
        ...intelligentAnalysis.recommendations,
      ],
      sources: [
        'AI Pattern Analysis',
        'Anomaly Detection System',
        'Hypothesis Generation Engine',
        ...(reasoningChain ? ['Advanced Reasoning Engine'] : []),
        ...(process.env.OPENAI_API_KEY ? ['OpenAI GPT-4'] : []),
        ...(llama ? ['Llama Local LLM'] : []),
      ],
      auditTrail: [
        createAuditEntry('analysis_completed', {
          caseId: anonymizedCase.id,
          patternsFound: patterns.length,
          anomaliesFound: anomalies.length,
          hypothesesGenerated: hypotheses.length,
          reasoningQuality: reasoningChain?.reasoningQuality || 0,
          reasoningSteps: reasoningChain?.steps.length || 0,
        }),
      ],
    }

    return NextResponse.json({ 
      analysis,
      reasoningChain: reasoningChain || undefined,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
