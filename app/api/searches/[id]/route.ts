import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/db'
import { savedSearches } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.delete(savedSearches)
      .where(
        and(
          eq(savedSearches.id, params.id),
          eq(savedSearches.userId, session.userId)
        )
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete search error:', error)
    return NextResponse.json(
      { error: 'Failed to delete search' },
      { status: 500 }
    )
  }
}
