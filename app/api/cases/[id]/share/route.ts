import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/db'
import { caseShares } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sharedWith, permission } = await request.json()

    if (!sharedWith) {
      return NextResponse.json(
        { error: 'User to share with is required' },
        { status: 400 }
      )
    }

    // Check if already shared
    const existing = await db.select()
      .from(caseShares)
      .where(
        and(
          eq(caseShares.caseId, params.id),
          eq(caseShares.sharedWith, sharedWith)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Update permission
      await db.update(caseShares)
        .set({ permission: permission || 'view' })
        .where(eq(caseShares.id, existing[0].id))

      return NextResponse.json({ success: true })
    }

    // Create share
    await db.insert(caseShares).values({
      id: `share-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      caseId: params.id,
      sharedBy: session.userId,
      sharedWith,
      permission: permission || 'view',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Share case error:', error)
    return NextResponse.json(
      { error: 'Failed to share case' },
      { status: 500 }
    )
  }
}
