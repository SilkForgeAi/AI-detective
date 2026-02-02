import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/db'
import { activityLog } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const caseId = searchParams.get('caseId')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = db.select()
      .from(activityLog)
      .where(eq(activityLog.userId, session.userId))

    if (caseId) {
      query = query.where(eq(activityLog.caseId, caseId)) as any
    }

    const activities = await query
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Get activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
