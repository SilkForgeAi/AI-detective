// Authentication middleware for API routes

import { NextRequest, NextResponse } from 'next/server'
import { getSession, requireAuth } from './session'

export function getAuthSession(request: NextRequest): { userId: string; email: string; name: string; role: string } | null {
  // Get session from cookie or header
  const sessionId = 
    request.cookies.get('session')?.value ||
    request.headers.get('x-session-id') ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  const session = getSession(sessionId || null)
  if (!session) return null

  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  }
}

export function requireAuthMiddleware(request: NextRequest) {
  const session = getAuthSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  return session
}

export function optionalAuth(request: NextRequest) {
  return getAuthSession(request)
}
