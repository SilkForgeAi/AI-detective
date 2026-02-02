'use client'

import { useState, useEffect } from 'react'
import { X, Share2, User, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface CaseShareModalProps {
  caseId: string
  caseTitle: string
  onClose: () => void
}

export default function CaseShareModal({ caseId, caseTitle, onClose }: CaseShareModalProps) {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view')
  const [loading, setLoading] = useState(false)
  const [shareLink, setShareLink] = useState('')

  useEffect(() => {
    loadUsers()
    generateShareLink()
  }, [caseId])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const generateShareLink = () => {
    const baseUrl = window.location.origin
    setShareLink(`${baseUrl}/cases/${caseId}`)
  }

  const handleShare = async () => {
    if (!selectedUser) {
      toast.error('Please select a user')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedWith: selectedUser,
          permission,
        }),
      })

      if (response.ok) {
        toast.success('Case shared successfully')
        onClose()
      } else {
        throw new Error('Failed to share case')
      }
    } catch (error) {
      toast.error('Failed to share case')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Link copied to clipboard')
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-md w-full">
        <div className="sticky top-0 bg-detective-secondary border-b border-detective-light p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-detective-accent" />
            <h2 className="text-2xl font-bold text-white">Share Case</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-detective-light/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share with User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white focus:outline-none focus:border-detective-accent"
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Permission
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as any)}
              className="w-full px-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white focus:outline-none focus:border-detective-accent"
            >
              <option value="view">View Only</option>
              <option value="comment">View & Comment</option>
              <option value="edit">Full Access</option>
            </select>
          </div>

          <div className="pt-4 border-t border-detective-light">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-detective-accent hover:bg-detective-accent/90 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleShare}
            disabled={loading || !selectedUser}
            className="w-full px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Sharing...' : 'Share Case'}
          </button>
        </div>
      </div>
    </div>
  )
}
