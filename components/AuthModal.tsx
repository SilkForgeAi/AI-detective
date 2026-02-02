'use client'

import { useState } from 'react'
import { X, LogIn, UserPlus } from 'lucide-react'

interface AuthModalProps {
  onClose: () => void
  onSuccess: (user: any) => void
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin 
        ? { email, password }
        : { email, password, name }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      onSuccess(data.user)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-md w-full">
        <div className="sticky top-0 bg-detective-secondary border-b border-detective-light p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLogin ? (
              <LogIn className="w-6 h-6 text-detective-accent" />
            ) : (
              <UserPlus className="w-6 h-6 text-detective-accent" />
            )}
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Login' : 'Register'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-detective-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="flex-1 px-4 py-3 bg-detective-light hover:bg-detective-light/80 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              {isLogin ? 'Need an account?' : 'Already have an account?'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
