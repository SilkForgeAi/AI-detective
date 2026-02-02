'use client'

import { useEffect, useRef } from 'react'
import { TimelineEvent } from '@/types/case'
import { Clock } from 'lucide-react'

interface TimelineViewerProps {
  events: TimelineEvent[]
  caseDate: string
}

export default function TimelineViewer({ events, caseDate }: TimelineViewerProps) {
  const timelineRef = useRef<HTMLDivElement>(null)

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  if (events.length === 0) {
    return (
      <div className="bg-detective-secondary/50 rounded-xl p-8 border border-detective-secondary text-center">
        <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No timeline events available</p>
      </div>
    )
  }

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-detective-accent" />
        <h2 className="text-xl font-bold text-white">Timeline</h2>
        <span className="text-sm text-gray-400">({events.length} events)</span>
      </div>

      <div className="relative" ref={timelineRef}>
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-detective-light"></div>

        <div className="space-y-6">
          {sortedEvents.map((event, index) => {
            const eventDate = new Date(event.date)
            const caseDateObj = new Date(caseDate)
            const daysDiff = Math.round((eventDate.getTime() - caseDateObj.getTime()) / (1000 * 60 * 60 * 24))
            
            return (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    event.category === 'incident' ? 'bg-red-500 border-red-400' :
                    event.category === 'evidence' ? 'bg-blue-500 border-blue-400' :
                    event.category === 'witness' ? 'bg-yellow-500 border-yellow-400' :
                    event.category === 'investigation' ? 'bg-green-500 border-green-400' :
                    'bg-gray-500 border-gray-400'
                  }`}></div>
                </div>

                {/* Event content */}
                <div className="flex-1 bg-detective-darker/50 rounded-lg p-4 border border-detective-light">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded border ${
                          event.category === 'incident' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          event.category === 'evidence' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          event.category === 'witness' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          event.category === 'investigation' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {event.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {daysDiff !== 0 && (
                            <span className={daysDiff > 0 ? 'text-green-400' : 'text-red-400'}>
                              {daysDiff > 0 ? '+' : ''}{daysDiff} days
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white">{event.date}</div>
                      {event.time && (
                        <div className="text-xs text-gray-400">{event.time}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.confidence}% confidence
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                  <div className="text-xs text-gray-500">
                    Source: {event.source}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
