import { NextRequest, NextResponse } from 'next/server'
import { caseRepository } from '@/lib/db/caseRepository'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    // Optional: Get user if logged in, but not required
    const session = await getSession(request)
    const userId = session?.userId || null

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const status = searchParams.get('status')?.split(',') || undefined
    const jurisdiction = searchParams.get('jurisdiction') || undefined
    const priority = searchParams.get('priority')?.split(',') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    if (query || status || jurisdiction || priority || dateFrom || dateTo) {
      const cases = await caseRepository.search(query, {
        status,
        jurisdiction,
        priority,
        dateFrom,
        dateTo,
        userId, // Filter by user if authenticated
      })
      return NextResponse.json({ cases })
    }

    const cases = await caseRepository.getAll(userId || undefined)
    return NextResponse.json({ cases })
  } catch (error) {
    console.error('Get cases error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Optional: Get user if logged in, but not required
    const session = await getSession(request)
    const userId = session?.userId || null

    const caseData = await request.json()
    // Add user ID to case data if available
    const caseWithUser = {
      ...caseData,
      userId,
    }
    const created = await caseRepository.create(caseWithUser)
    return NextResponse.json({ case: created })
  } catch (error) {
    console.error('Create case error:', error)
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const caseData = await request.json()
    const updated = await caseRepository.update(caseData)
    return NextResponse.json({ case: updated })
  } catch (error) {
    console.error('Update case error:', error)
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    )
  }
}
