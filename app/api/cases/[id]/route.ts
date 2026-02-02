import { NextRequest, NextResponse } from 'next/server'
import { caseRepository } from '@/lib/db/caseRepository'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseData = await caseRepository.getById(params.id)
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ case: caseData })
  } catch (error) {
    console.error('Get case error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case' },
      { status: 500 }
    )
  }
}
