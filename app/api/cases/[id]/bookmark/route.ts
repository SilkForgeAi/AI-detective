import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/db'
import { caseBookmarks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ bookmarked: false })
    }

    const bookmark = await db.select()
      .from(caseBookmarks)
      .where(
        and(
          eq(caseBookmarks.caseId, params.id),
          eq(caseBookmarks.userId, session.userId)
        )
      )
      .limit(1)

    return NextResponse.json({ bookmarked: bookmark.length > 0 })
  } catch (error) {
    console.error('Get bookmark error:', error)
    return NextResponse.json({ bookmarked: false })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already bookmarked
    const existing = await db.select()
      .from(caseBookmarks)
      .where(
        and(
          eq(caseBookmarks.caseId, params.id),
          eq(caseBookmarks.userId, session.userId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ success: true, bookmarked: true })
    }

    // Create bookmark
    await db.insert(caseBookmarks).values({
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      caseId: params.id,
      userId: session.userId,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, bookmarked: true })
  } catch (error) {
    console.error('Bookmark error:', error)
    return NextResponse.json(
      { error: 'Failed to bookmark case' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.delete(caseBookmarks)
      .where(
        and(
          eq(caseBookmarks.caseId, params.id),
          eq(caseBookmarks.userId, session.userId)
        )
      )

    return NextResponse.json({ success: true, bookmarked: false })
  } catch (error) {
    console.error('Unbookmark error:', error)
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    )
  }
}
