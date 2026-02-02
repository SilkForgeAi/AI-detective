import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { users, passwordResetTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const userList = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (userList.length === 0) {
      // Don't reveal if user exists
      return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' })
    }

    const user = userList[0]

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.insert(passwordResetTokens).values({
      id: `reset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    })

    // In production, send email here
    // For now, return token in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${email}: ${token}`)
      return NextResponse.json({
        success: true,
        message: 'Reset link sent (check console in dev mode)',
        token: token, // Only in dev
      })
    }

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    )
  }
}

// Verify and reset password
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Find token
    const tokenList = await db.select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1)

    if (tokenList.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const resetToken = tokenList[0]

    // Check if expired
    if (new Date(resetToken.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Check if already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, resetToken.userId))

    // Mark token as used
    await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id))

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
