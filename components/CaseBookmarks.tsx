'use client'

import { useState, useEffect } from 'react'
import { Star, StarOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface CaseBookmarksProps {
  caseId: string
  userId: string
  isBookmarked?: boolean
  onToggle?: (bookmarked: boolean) => void
}

export default function CaseBookmarks({ caseId, userId, isBookmarked: initialBookmarked, onToggle }: CaseBookmarksProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked || false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const response = await fetch(`/api/cases/${caseId}/bookmark`)
        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(data.bookmarked)
        }
      } catch (error) {
        console.error('Failed to check bookmark:', error)
      }
    }
    if (userId) checkBookmark()
  }, [caseId, userId])

  const handleToggle = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
      })

      if (response.ok) {
        const newState = !isBookmarked
        setIsBookmarked(newState)
        onToggle?.(newState)
        toast.success(newState ? 'Case bookmarked' : 'Bookmark removed')
      } else {
        throw new Error('Failed to toggle bookmark')
      }
    } catch (error) {
      toast.error('Failed to update bookmark')
      console.error('Bookmark error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !userId}
      className={`p-2 rounded-lg transition-colors ${
        isBookmarked
          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
          : 'bg-detective-secondary text-gray-400 hover:bg-detective-light/20 hover:text-yellow-400'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark case'}
    >
      {isBookmarked ? (
        <Star className="w-5 h-5 fill-current" />
      ) : (
        <StarOff className="w-5 h-5" />
      )}
    </button>
  )
}
