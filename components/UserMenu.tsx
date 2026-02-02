'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  user: { id: string; email: string; name: string; role: string }
  onLogout: () => void
  onSettings?: () => void
}

export default function UserMenu({ user, onLogout, onSettings }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      onLogout()
    } catch (error) {
      console.error('Logout error:', error)
      // Still logout locally
      onLogout()
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-detective-secondary hover:bg-detective-secondary/80 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-detective-accent/20 flex items-center justify-center">
          <User className="w-4 h-4 text-detective-accent" />
        </div>
        <span className="text-sm text-white font-medium">{user.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-detective-secondary rounded-lg border border-detective-light shadow-xl z-50">
          <div className="p-3 border-b border-detective-light">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-detective-accent/20 text-detective-accent rounded">
              {user.role}
            </span>
          </div>
          
          <div className="p-1">
            {onSettings && (
              <button
                onClick={() => {
                  onSettings()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-detective-darker rounded transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
