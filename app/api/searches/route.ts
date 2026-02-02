import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/db'
import { savedSearches } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searches = await db.select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, session.userId))
      .orderBy(desc(savedSearches.createdAt))

    return NextResponse.json({ searches })
  } catch (error) {
    console.error('Get searches error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch searches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, query, filters } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Search name is required' },
        { status: 400 }
      )
    }

    const searchId = `search-${Date.now()}-${Math.random().toString(36).substring(7)}`

    await db.insert(savedSearches).values({
      id: searchId,
      userId: session.userId,
      name: name.trim(),
      query: query || null,
      filters: filters ? JSON.stringify(filters) : null,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      search: {
        id: searchId,
        name: name.trim(),
        query,
        filters,
      },
    })
  } catch (error) {
    console.error('Save search error:', error)
    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    )
  }
}
