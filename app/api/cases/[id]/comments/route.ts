import { NextRequest, NextResponse } from 'next/server'
import { requireAuthMiddleware } from '@/lib/auth/middleware'
import { db } from '@/lib/db/db'
import { caseComments } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuthMiddleware(request)
    if (session instanceof NextResponse) return session

    const comments = await db.select()
      .from(caseComments)
      .where(eq(caseComments.caseId, params.id))
      .orderBy(desc(caseComments.createdAt))

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
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

    // Get user name
    const userList = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
    const user = userList[0]
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { content } = await request.json()

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(7)}`

    await db.insert(caseComments).values({
      id: commentId,
      caseId: params.id,
      userId: session.userId,
      userName: user.name || user.email,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: commentId,
        userId: session.userId,
        userName: user.name || user.email,
        content: content.trim(),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
