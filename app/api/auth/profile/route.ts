import { NextRequest, NextResponse } from 'next/server'
import { requireAuthMiddleware } from '@/lib/auth/middleware'
import { db } from '@/lib/db/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(request: NextRequest) {
  try {
    const session = requireAuthMiddleware(request)
    if (session instanceof NextResponse) return session

    const { name, email } = await request.json()

    // Validate
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get current user to check email
    const currentUser = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
    if (currentUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is already taken
    if (email && email !== currentUser[0].email) {
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updates: any = {}
    if (name) updates.name = name
    if (email) updates.email = email

    await db.update(users)
      .set(updates)
      .where(eq(users.id, session.userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
