import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/db'
import { users } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userList = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    }).from(users)

    return NextResponse.json({ users: userList })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
