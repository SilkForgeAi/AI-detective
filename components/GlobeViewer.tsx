'use client'

import { useEffect, useState } from 'react'
import { Location } from '@/types/case'
import { MapPin, Globe, Loader2, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Configure Cesium base URL
if (typeof window !== 'undefined') {
  const cesiumBaseUrl = process.env.NEXT_PUBLIC_CESIUM_BASE_URL || '/cesium'
  // @ts-ignore - Cesium global
  window.CESIUM_BASE_URL = cesiumBaseUrl
}

// Dynamically import Cesium to avoid SSR issues
// Note: Cesium requires proper setup - see next.config.js
const Viewer = dynamic(
  () => import('resium').then((mod) => mod.Viewer).catch((err) => {
    console.error('Failed to load Cesium Viewer:', err)
    return null
  }),
  { ssr: false, loading: () => <GlobeLoader /> }
)

const Entity = dynamic(
  () => import('resium').then((mod) => mod.Entity),
  { ssr: false }
)

const PointGraphics = dynamic(
  () => import('resium').then((mod) => mod.PointGraphics),
  { ssr: false }
)

const LabelGraphics = dynamic(
  () => import('resium').then((mod) => mod.LabelGraphics),
  { ssr: false }
)

const CameraFlyTo = dynamic(
  () => import('resium').then((mod) => mod.CameraFlyTo),
  { ssr: false }
)

interface GlobeViewerProps {
  locations: Location[]
  caseTitle?: string
  height?: string
}

function GlobeLoader() {
  return (
    <div className="w-full h-full bg-detective-darker rounded-lg border border-detective-light flex items-center justify-center">
      <div className="text-center text-gray-400">
        <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin text-detective-accent" />
        <p className="text-sm">Loading 3D Globe...</p>
      </div>
    </div>
  )
}

export default function GlobeViewer({ locations, caseTitle, height = '600px' }: GlobeViewerProps) {
  const [isClient, setIsClient] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    // Configure Cesium if available
    if (typeof window !== 'undefined') {
      try {
        // @ts-ignore
        if (window.Cesium) {
          // @ts-ignore
          window.Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || ''
        }
      } catch (err) {
        console.warn('Cesium configuration warning:', err)
      }
    }
  }, [])

  if (!isClient) {
    return <GlobeLoader />
  }

  if (error) {
    return (
      <div className="bg-detective-secondary/50 rounded-xl p-8 border border-detective-secondary text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-2">Failed to load 3D globe</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <p className="text-gray-500 text-xs mt-2">Falling back to list view</p>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="bg-detective-secondary/50 rounded-xl p-8 border border-detective-secondary text-center">
        <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No location data available</p>
      </div>
    )
  }

  // Calculate center point from locations
  const locationsWithCoords = locations.filter(l => l.coordinates)
  const avgLat = locationsWithCoords.reduce((sum, l) => sum + (l.coordinates?.lat || 0), 0) / locationsWithCoords.length
  const avgLng = locationsWithCoords.reduce((sum, l) => sum + (l.coordinates?.lng || 0), 0) / locationsWithCoords.length

  // Color mapping for location types
  const getLocationColor = (type: string) => {
    switch (type) {
      case 'crime_scene':
        return '#ef4444' // red
      case 'witness_location':
        return '#eab308' // yellow
      case 'suspect_location':
        return '#f97316' // orange
      case 'evidence_location':
        return '#3b82f6' // blue
      default:
        return '#8b5cf6' // purple
    }
  }

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-6 border border-detective-secondary">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-6 h-6 text-detective-accent" />
        <h2 className="text-xl font-bold text-white">3D Globe View</h2>
        <span className="text-sm text-gray-400">({locations.length} locations)</span>
      </div>

      {/* 3D Globe Container */}
      <div 
        className="w-full rounded-lg border border-detective-light overflow-hidden mb-4"
        style={{ height }}
      >
        {Viewer ? (
          <Viewer
            full
            timeline={false}
            animation={false}
            baseLayerPicker={false}
            geocoder={false}
            homeButton={false}
            infoBox={true}
            navigationHelpButton={false}
            sceneModePicker={false}
            selectionIndicator={true}
            vrButton={false}
            style={{ width: '100%', height: '100%' }}
          >
          {/* Fly to center of locations */}
          {avgLat && avgLng && (
            <CameraFlyTo
              destination={{
                longitude: avgLng * (Math.PI / 180),
                latitude: avgLat * (Math.PI / 180),
                height: 100000, // 100km altitude
              }}
              orientation={{
                heading: 0,
                pitch: -Math.PI / 2,
                roll: 0,
              }}
              duration={2}
            />
          )}

          {/* Render location markers */}
          {locations.map((location) => {
            if (!location.coordinates) return null

            const color = getLocationColor(location.type)
            const description = `
              <div style="color: white; font-family: sans-serif; padding: 10px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${location.name}</h3>
                ${location.type ? `<p style="margin: 4px 0; font-size: 12px; color: #${color.substring(1)};">Type: ${location.type.replace('_', ' ')}</p>` : ''}
                ${location.address ? `<p style="margin: 4px 0; font-size: 12px;">${location.address}</p>` : ''}
                ${location.date ? `<p style="margin: 4px 0; font-size: 12px; color: #888;">Date: ${location.date}</p>` : ''}
                ${location.description ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #aaa;">${location.description}</p>` : ''}
              </div>
            `

            return (
              <Entity
                key={location.id}
                name={location.name}
                position={{
                  longitude: location.coordinates.lng * (Math.PI / 180),
                  latitude: location.coordinates.lat * (Math.PI / 180),
                  height: 0,
                }}
                description={description}
                onClick={() => setSelectedLocation(location)}
              >
                <PointGraphics
                  pixelSize={12}
                  color={color}
                  outlineColor="#ffffff"
                  outlineWidth={2}
                  heightReference={1} // Clamp to ground
                />
                <LabelGraphics
                  text={location.name}
                  font="14px sans-serif"
                  fillColor={color}
                  outlineColor="#000000"
                  outlineWidth={2}
                  style={1} // FILL_AND_OUTLINE
                  verticalOrigin={2} // Bottom
                  pixelOffset={{ x: 0, y: -30 }}
                  show={true}
                />
              </Entity>
            )
          })}
          </Viewer>
        ) : (
          <div className="w-full h-full bg-detective-darker rounded-lg border border-detective-light flex items-center justify-center">
            <div className="text-center text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm">Cesium not available</p>
              <p className="text-xs mt-1">Please ensure Cesium assets are configured</p>
            </div>
          </div>
        )}
      </div>

      {/* Location list */}
      <div className="space-y-3">
        {locations.map((location) => (
          <div
            key={location.id}
            className={`bg-detective-darker/50 rounded-lg p-4 border border-detective-light cursor-pointer transition-colors ${
              selectedLocation?.id === location.id ? 'border-detective-accent bg-detective-accent/10' : ''
            }`}
            onClick={() => setSelectedLocation(location)}
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
    </div>
  )
}
