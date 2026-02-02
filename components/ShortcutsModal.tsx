'use client'

import { X, Keyboard } from 'lucide-react'

interface ShortcutsModalProps {
  onClose: () => void
}

export default function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open search' },
    { keys: ['⌘', 'N'], description: 'New case' },
    { keys: ['⌘', 'D'], description: 'Dashboard' },
    { keys: ['⌘', '/'], description: 'Open chat' },
    { keys: ['⌘', ','], description: 'Settings' },
    { keys: ['Esc'], description: 'Close modals' },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-2xl w-full">
        <div className="sticky top-0 bg-detective-secondary border-b border-detective-light p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-detective-accent" />
            <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-detective-light/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {shortcuts.map((shortcut, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-detective-darker/50 rounded-lg border border-detective-light"
              >
                <span className="text-gray-300">{shortcut.description}</span>
                <div className="flex items-center gap-2">
                  {shortcut.keys.map((key, keyIdx) => (
                    <span
                      key={keyIdx}
                      className="px-3 py-1 bg-detective-light text-white rounded text-sm font-mono"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-detective-light">
            <p className="text-sm text-gray-400 text-center">
              Press <kbd className="px-2 py-1 bg-detective-light rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
