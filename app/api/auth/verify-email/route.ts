import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { users, emailVerifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// Request email verification
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userList = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
    if (userList.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userList[0]

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.insert(emailVerifications).values({
      id: `verify-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: user.id,
      token,
      email: user.email,
      verified: false,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    })

    // In production, send email here
    if (process.env.NODE_ENV === 'development') {
      console.log(`Email verification token for ${user.email}: ${token}`)
      return NextResponse.json({
        success: true,
        message: 'Verification email sent (check console in dev mode)',
        token: token, // Only in dev
      })
    }

    return NextResponse.json({ success: true, message: 'Verification email sent' })
  } catch (error) {
    console.error('Email verification request error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}

// Verify email
export async function PUT(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find token
    const tokenList = await db.select()
      .from(emailVerifications)
      .where(eq(emailVerifications.token, token))
      .limit(1)

    if (tokenList.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    const verification = tokenList[0]

    // Check if expired
    if (new Date(verification.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (verification.verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Mark as verified
    await db.update(emailVerifications)
      .set({ verified: true })
      .where(eq(emailVerifications.id, verification.id))

    // Update user email if different
    if (verification.email !== verification.userId) {
      await db.update(users)
        .set({ email: verification.email })
        .where(eq(users.id, verification.userId))
    }

    return NextResponse.json({ success: true, message: 'Email verified successfully' })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
