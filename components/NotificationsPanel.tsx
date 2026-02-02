'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  caseId?: string
  read: boolean
  createdAt: string
}

interface NotificationsPanelProps {
  onClose: () => void
  onCaseClick?: (caseId: string) => void
}

export default function NotificationsPanel({ onClose, onCaseClick }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="fixed right-4 top-20 w-96 bg-detective-secondary rounded-xl border border-detective-light shadow-2xl z-50 max-h-[600px] flex flex-col">
      <div className="sticky top-0 bg-detective-secondary border-b border-detective-light p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-detective-accent" />
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-gray-400 hover:text-white"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-detective-light/20 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No notifications
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.read
                    ? 'bg-detective-darker/30 border-detective-light/50'
                    : 'bg-detective-darker/50 border-detective-light'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {notification.caseId && (
                      <button
                        onClick={() => {
                          onCaseClick?.(notification.caseId!)
                          onClose()
                        }}
                        className="mt-2 text-xs text-detective-accent hover:underline"
                      >
                        View case →
                      </button>
                    )}
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="p-1 hover:bg-detective-light/20 rounded"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
