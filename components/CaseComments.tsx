'use client'

import { useState } from 'react'
import { MessageSquare, Send, User, Clock } from 'lucide-react'

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
}

interface CaseCommentsProps {
  caseId: string
  comments: Comment[]
  currentUser: { id: string; name: string }
  onAddComment: (content: string) => void
}

export default function CaseComments({ caseId, comments, currentUser, onAddComment }: CaseCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-6 h-6 text-detective-accent" />
        <h3 className="text-lg font-semibold text-white">Comments</h3>
        <span className="text-sm text-gray-400">({comments.length})</span>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-detective-darker/50 rounded-lg border border-detective-light"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-detective-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-detective-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-detective-light pt-4">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent resize-none"
            rows={2}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
