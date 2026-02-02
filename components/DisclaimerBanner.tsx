'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-yellow-500/20 border-b-2 border-yellow-500/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-200 font-semibold mb-1">
              ⚠️ IMPORTANT: This is a research and educational tool only
            </p>
            <p className="text-xs text-yellow-300/90">
              <strong>NOT for vigilante work, harassment, or unauthorized investigations.</strong> If you discover any new information, report it to local authorities immediately. Do NOT take matters into your own hands. You are solely responsible for ensuring your use complies with all applicable laws. 
              <span className="ml-1">
                See DISCLAIMER.md in the repository for complete legal and ethical guidelines.
              </span>
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-400 hover:text-yellow-200 transition-colors flex-shrink-0"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
