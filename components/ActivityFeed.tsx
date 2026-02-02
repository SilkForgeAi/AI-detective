'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock, User, FileText } from 'lucide-react'

interface ActivityItem {
  id: string
  userId?: string
  caseId?: string
  action: string
  description: string
  createdAt: string
}

interface ActivityFeedProps {
  caseId?: string
  limit?: number
}

export default function ActivityFeed({ caseId, limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [caseId])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const url = caseId
        ? `/api/activity?caseId=${caseId}&limit=${limit}`
        : `/api/activity?limit=${limit}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('case')) return <FileText className="w-4 h-4" />
    if (action.includes('user')) return <User className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'text-green-400'
    if (action.includes('updated')) return 'text-blue-400'
    if (action.includes('deleted')) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-detective-accent" />
        <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">No activity yet</div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-detective-darker/50 rounded-lg border border-detective-light"
            >
              <div className={`mt-0.5 ${getActionColor(activity.action)}`}>
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
