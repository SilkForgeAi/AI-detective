'use client'

import { useState } from 'react'
import { X, Mail, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PasswordResetModalProps {
  onClose: () => void
}

export default function PasswordResetModal({ onClose }: PasswordResetModalProps) {
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        // In dev mode, show token
        if (data.token) {
          setToken(data.token)
          setStep('reset')
        } else {
          toast.success('Check your email for reset instructions')
        }
      } else {
        throw new Error(data.error || 'Failed to request reset')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to request reset')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password reset successfully!')
        onClose()
      } else {
        throw new Error(data.error || 'Failed to reset password')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-md w-full">
        <div className="sticky top-0 bg-detective-secondary border-b border-detective-light p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-detective-accent" />
            <h2 className="text-2xl font-bold text-white">
              {step === 'request' ? 'Reset Password' : 'Enter New Password'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-detective-light/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white focus:outline-none focus:border-detective-accent"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reset Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white focus:outline-none focus:border-detective-accent font-mono text-sm"
                  placeholder="Enter token from email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white focus:outline-none focus:border-detective-accent"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white focus:outline-none focus:border-detective-accent"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
