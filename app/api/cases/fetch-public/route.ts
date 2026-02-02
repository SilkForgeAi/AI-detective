import { NextRequest, NextResponse } from 'next/server'
import { publicCaseFetcher } from '@/lib/data/fetchPublicCases'

export async function POST(request: NextRequest) {
  try {
    const { query, caseName } = await request.json()

    if (query) {
      // Search public databases
      const cases = await publicCaseFetcher.searchPublicDatabases(query)
      return NextResponse.json({ cases, count: cases.length })
    }

    if (caseName) {
      // Fetch specific case
      let caseData
      const lowerName = caseName.toLowerCase()
      
      if (lowerName.includes('zodiac')) {
        caseData = await publicCaseFetcher.fetchZodiacKillerCase()
      } else if (lowerName.includes('db cooper') || lowerName.includes('dan cooper') || lowerName.includes('db-cooper')) {
        caseData = await publicCaseFetcher.fetchDBCooperCase()
      } else if (lowerName.includes('amelia') || lowerName.includes('earhart') || lowerName.includes('amelia-earhart')) {
        caseData = await publicCaseFetcher.fetchAmeliaEarhartCase()
      } else if (lowerName.includes('somerton') || lowerName.includes('tamam') || lowerName.includes('somerton-man')) {
        caseData = await publicCaseFetcher.fetchSomertonManCase()
      } else {
        return NextResponse.json(
          { error: 'Case not found in public databases. Available: zodiac, db-cooper, amelia-earhart, somerton-man' },
          { status: 404 }
        )
      }

      return NextResponse.json({ case: caseData })
    }

    return NextResponse.json(
      { error: 'Provide either query or caseName' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Fetch public case error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch public case' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || searchParams.get('query')
    const caseName = searchParams.get('case') || searchParams.get('name')

    if (query) {
      const cases = await publicCaseFetcher.searchPublicDatabases(query)
      return NextResponse.json({ cases, count: cases.length })
    }

    if (caseName) {
      let caseData
      const lowerName = caseName.toLowerCase()
      
      if (lowerName.includes('zodiac')) {
        caseData = await publicCaseFetcher.fetchZodiacKillerCase()
      } else if (lowerName.includes('db cooper') || lowerName.includes('dan cooper') || lowerName.includes('db-cooper')) {
        caseData = await publicCaseFetcher.fetchDBCooperCase()
      } else if (lowerName.includes('amelia') || lowerName.includes('earhart') || lowerName.includes('amelia-earhart')) {
        caseData = await publicCaseFetcher.fetchAmeliaEarhartCase()
      } else if (lowerName.includes('somerton') || lowerName.includes('tamam') || lowerName.includes('somerton-man')) {
        caseData = await publicCaseFetcher.fetchSomertonManCase()
      } else {
        return NextResponse.json(
          { error: 'Case not found. Available cases: zodiac, db-cooper, amelia-earhart, somerton-man' },
          { status: 404 }
        )
      }

      return NextResponse.json({ case: caseData })
    }

    // Default: return Zodiac Killer case
    const zodiacCase = await publicCaseFetcher.fetchZodiacKillerCase()
    return NextResponse.json({ case: zodiacCase })
  } catch (error) {
    console.error('Fetch public case error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch public case' },
      { status: 500 }
    )
  }
}
