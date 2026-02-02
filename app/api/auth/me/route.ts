import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const session = getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}
