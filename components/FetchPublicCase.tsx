'use client'

import { useState } from 'react'
import { Download, Search, Loader2, FileText } from 'lucide-react'
import { Case } from '@/types/case'

interface FetchPublicCaseProps {
  onCaseFetched: (caseData: Case) => void
  onClose?: () => void
}

export default function FetchPublicCase({ onCaseFetched, onClose }: FetchPublicCaseProps) {
  const [query, setQuery] = useState('zodiac killer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<Case[]>([])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      const response = await fetch(`/api/cases/fetch-public?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cases')
      }

      setResults(data.cases || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchCase = async (caseName: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/cases/fetch-public?case=${encodeURIComponent(caseName)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch ${caseName} case`)
      }

      onCaseFetched(data.case)
      if (onClose) onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchZodiac = () => handleFetchCase('zodiac')

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
      <div className="flex items-center gap-3 mb-4">
        <Download className="w-6 h-6 text-detective-accent" />
        <h2 className="text-xl font-bold text-white">Fetch Public Case Files</h2>
      </div>

      <div className="space-y-4">
        {/* Quick fetch buttons */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Quick Fetch Cases
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleFetchCase('zodiac')}
              disabled={loading}
              className="px-4 py-2 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Zodiac Killer
            </button>
            <button
              onClick={() => handleFetchCase('db-cooper')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              DB Cooper
            </button>
            <button
              onClick={() => handleFetchCase('amelia-earhart')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Amelia Earhart
            </button>
            <button
              onClick={() => handleFetchCase('somerton-man')}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Somerton Man
            </button>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Search Public Databases
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for cases (e.g., 'zodiac killer', 'cold case')"
              className="flex-1 px-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-300">
              Found {results.length} case(s):
            </div>
            {results.map((caseItem) => (
              <div
                key={caseItem.id}
                className="p-4 bg-detective-darker/50 rounded-lg border border-detective-light"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{caseItem.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{caseItem.date}</p>
                  </div>
                  <button
                    onClick={() => {
                      onCaseFetched(caseItem)
                      if (onClose) onClose()
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Import
                  </button>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{caseItem.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {caseItem.evidence.length} evidence items
                  </span>
                  {caseItem.jurisdiction && (
                    <span className="text-xs text-gray-500">• {caseItem.jurisdiction}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-gray-400">
            <strong className="text-blue-400">Note:</strong> This fetches publicly available case 
            information. All data is from open sources and complies with privacy regulations.
          </p>
        </div>
      </div>
    </div>
  )
}
