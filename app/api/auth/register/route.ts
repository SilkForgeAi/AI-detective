import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const userId = `user-${Date.now()}`
    await db.insert(users).values({
      id: userId,
      email,
      name: name || null,
      passwordHash,
      role: 'user',
    })

    // Create session
    const sessionId = createSession({
      id: userId,
      email,
      name: name || '',
      role: 'user',
    })

    const response = NextResponse.json({ 
      success: true,
      user: { id: userId, email, name: name || '', role: 'user' },
      sessionId,
    })

    // Set session cookie
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
