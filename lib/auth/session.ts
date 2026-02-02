// Simple session management
// In production, use NextAuth or similar

export interface Session {
  userId: string
  email: string
  name: string
  role: 'user' | 'admin'
  expiresAt: number
}

const sessions = new Map<string, Session>()

export function createSession(user: { id: string; email: string; name: string; role: string }): string {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'user' | 'admin',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  sessions.set(sessionId, session)
  return sessionId
}

export function getSession(sessionId: string | null | undefined): Session | null {
  if (!sessionId) return null
  
  const session = sessions.get(sessionId)
  if (!session) return null
  
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId)
    return null
  }
  
  return session
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

export function requireAuth(sessionId: string | null | undefined): Session {
  const session = getSession(sessionId)
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

export function requireRole(sessionId: string | null | undefined, role: 'user' | 'admin'): Session {
  const session = requireAuth(sessionId)
  if (session.role !== role && session.role !== 'admin') {
    throw new Error(`Role '${role}' required`)
  }
  return session
}
