'use client'

import { useState, useEffect } from 'react'
import { Search, Bookmark, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SavedSearch {
  id: string
  name: string
  query?: string
  filters?: any
}

interface SavedSearchesProps {
  onLoadSearch: (search: SavedSearch) => void
}

export default function SavedSearches({ onLoadSearch }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [searchName, setSearchName] = useState('')

  useEffect(() => {
    loadSearches()
  }, [])

  const loadSearches = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/searches')
      if (response.ok) {
        const data = await response.json()
        setSearches(data.searches || [])
      }
    } catch (error) {
      console.error('Failed to load searches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!searchName.trim()) {
      toast.error('Please enter a name for this search')
      return
    }

    try {
      const response = await fetch('/api/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: searchName,
          query: '', // Will be populated from current search
          filters: {},
        }),
      })

      if (response.ok) {
        toast.success('Search saved')
        setSearchName('')
        setShowSave(false)
        loadSearches()
      } else {
        throw new Error('Failed to save search')
      }
    } catch (error) {
      toast.error('Failed to save search')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/searches/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Search deleted')
        loadSearches()
      } else {
        throw new Error('Failed to delete search')
      }
    } catch (error) {
      toast.error('Failed to delete search')
    }
  }

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-4 border border-detective-secondary">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-detective-accent" />
          <h3 className="font-semibold text-white">Saved Searches</h3>
        </div>
        <button
          onClick={() => setShowSave(!showSave)}
          className="px-3 py-1 text-sm bg-detective-accent hover:bg-detective-accent/90 text-white rounded transition-colors"
        >
          Save Current
        </button>
      </div>

      {showSave && (
        <div className="mb-4 p-3 bg-detective-darker/50 rounded-lg border border-detective-light">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search name..."
            className="w-full px-3 py-2 bg-detective-secondary border border-detective-light rounded text-white text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-1 bg-detective-accent hover:bg-detective-accent/90 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSave(false)
                setSearchName('')
              }}
              className="px-3 py-1 bg-detective-secondary hover:bg-detective-light/20 text-gray-400 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : searches.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No saved searches</p>
      ) : (
        <div className="space-y-2">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-2 bg-detective-darker/50 rounded hover:bg-detective-darker transition-colors"
            >
              <button
                onClick={() => onLoadSearch(search)}
                className="flex-1 text-left text-sm text-gray-300 hover:text-white"
              >
                <Search className="w-4 h-4 inline mr-2" />
                {search.name}
              </button>
              <button
                onClick={() => handleDelete(search.id)}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
