'use client'

import { useState } from 'react'
import { Location } from '@/types/case'
import { MapPin, Globe, Map } from 'lucide-react'
import GlobeViewer from './GlobeViewer'

interface MapViewerProps {
  locations: Location[]
  caseTitle?: string
}

export default function MapViewer({ locations, caseTitle }: MapViewerProps) {
  const [viewMode, setViewMode] = useState<'globe' | 'list'>('globe')

  if (locations.length === 0) {
    return (
      <div className="bg-detective-secondary/50 rounded-xl p-8 border border-detective-secondary text-center">
        <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No location data available</p>
      </div>
    )
  }

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-detective-accent" />
          <h2 className="text-xl font-bold text-white">Locations</h2>
          <span className="text-sm text-gray-400">({locations.length} locations)</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('globe')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              viewMode === 'globe'
                ? 'bg-detective-accent text-white'
                : 'bg-detective-darker text-gray-400 hover:bg-detective-light'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            3D Globe
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              viewMode === 'list'
                ? 'bg-detective-accent text-white'
                : 'bg-detective-darker text-gray-400 hover:bg-detective-light'
            }`}
          >
            <Map className="w-4 h-4 inline mr-2" />
            List View
          </button>
        </div>
      </div>

      {viewMode === 'globe' ? (
        <GlobeViewer locations={locations} caseTitle={caseTitle} />
      ) : (
        <div className="space-y-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-detective-darker/50 rounded-lg p-4 border border-detective-light"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{location.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded border mt-1 inline-block ${
                    location.type === 'crime_scene' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    location.type === 'witness_location' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    location.type === 'suspect_location' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    location.type === 'evidence_location' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {location.type?.replace('_', ' ') || 'location'}
                  </span>
                </div>
                {location.date && (
                  <span className="text-xs text-gray-500">{location.date}</span>
                )}
              </div>
              {location.address && (
                <p className="text-sm text-gray-300 mb-2">{location.address}</p>
              )}
              {location.coordinates && (
                <div className="text-xs text-gray-500">
                  Coordinates: {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                </div>
              )}
              {location.description && (
                <p className="text-sm text-gray-400 mt-2">{location.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
