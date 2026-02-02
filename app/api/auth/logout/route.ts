import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/db'
import { sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { parse } from 'cookie'

const SESSION_NAME = 'ai_detective_session'

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const cookies = parse(cookieHeader || '')
    const sessionId = cookies[SESSION_NAME]

    if (sessionId) {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.id, sessionId))
    }

    const response = NextResponse.json({ success: true })
    // Clear cookie
    response.headers.set(
      'Set-Cookie',
      `${SESSION_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
    )
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
