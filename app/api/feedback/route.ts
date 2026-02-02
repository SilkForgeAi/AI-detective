import { NextRequest, NextResponse } from 'next/server'
import { feedbackSystem, CaseOutcome } from '@/lib/learning/feedbackSystem'
import { accuracyTracker } from '@/lib/learning/accuracyTracker'
import { selfImprovementSystem } from '@/lib/learning/selfImprovement'

export async function POST(request: NextRequest) {
  try {
    const outcome: CaseOutcome = await request.json()

    // Validate outcome data
    if (!outcome.caseId || !outcome.verifiedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: caseId, verifiedAt' },
        { status: 400 }
      )
    }

    // Record the outcome
    feedbackSystem.recordOutcome(outcome)

    // Calculate accuracy metrics if analysis exists
    // (This would require fetching the case analysis)
    // For now, we'll just record the outcome

    // Create training example if we have the case data
    // (This would be done in a separate endpoint or with full case data)

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      metrics: feedbackSystem.calculateMetrics(),
      progressToTarget: selfImprovementSystem.getProgressToTarget(),
    })
  } catch (error) {
    console.error('Feedback recording error:', error)
    return NextResponse.json(
      { error: 'Failed to record feedback', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const metrics = feedbackSystem.calculateMetrics()
    const progress = selfImprovementSystem.getProgressToTarget()
    const strategy = selfImprovementSystem.getCurrentStrategy()

    return NextResponse.json({
      metrics,
      progressToTarget: progress,
      targetAccuracy: selfImprovementSystem.getTargetAccuracy(),
      currentStrategy: strategy,
    })
  } catch (error) {
    console.error('Metrics retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    )
  }
}
