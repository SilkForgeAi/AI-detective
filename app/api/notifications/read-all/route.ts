import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/db'
import { userNotifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.update(userNotifications)
      .set({ read: true })
      .where(eq(userNotifications.userId, session.userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}
