'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { isAuthenticated, setAuthenticated } from '@/lib/auth'
import Toast, { useToast } from '@/components/Toast'

export default function PasswordGate() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/library')
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      addToast('error', 'Password required')
      return
    }

    setIsLoading(true)
    setHasError(false)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setAuthenticated()
        addToast('success', 'Access granted')
        setTimeout(() => router.push('/library'), 600)
      } else {
        setHasError(true)
        setIsShaking(true)
        addToast('error', 'Invalid password')
        setTimeout(() => setIsShaking(false), 500)
        setTimeout(() => setHasError(false), 2000)
      }
    } catch {
      addToast('error', 'Connection failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--canvas)' }}>
        <div className="skeleton" style={{ width: 200, height: 60 }} />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: 'var(--canvas)' }}
    >
      <div className="flex flex-col items-center w-full max-w-sm fade-in-up">
        <div className="mb-2">
          <Lock size={32} style={{ color: 'var(--mint)', opacity: 0.6 }} />
        </div>

        <h1
          className="mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 10vw, 72px)',
            color: 'var(--mint)',
            textTransform: 'uppercase',
            lineHeight: 1,
            letterSpacing: '-1px',
          }}
        >
          GAMEVAULT
        </h1>

        <p
          className="mt-4 mb-10"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1.8px',
          }}
        >
          PRIVATE LIBRARY
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className={`relative ${isShaking ? 'shake' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full pr-12 transition-colors duration-150"
              style={{
                background: 'var(--canvas)',
                border: `1px solid ${hasError ? 'var(--ultraviolet)' : 'var(--text-secondary)'}`,
                borderRadius: '2px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                padding: '12px 16px',
              }}
              onFocus={(e) => {
                if (!hasError) e.currentTarget.style.borderColor = 'var(--mint)'
              }}
              onBlur={(e) => {
                if (!hasError) e.currentTarget.style.borderColor = 'var(--text-secondary)'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={18} style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Eye size={18} style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full transition-all duration-180"
            style={{
              background: isLoading ? 'var(--mint-dark)' : 'var(--mint)',
              color: 'var(--text-absolute-black)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              borderRadius: '24px',
              padding: '12px 24px',
              border: 'none',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'VERIFYING...' : 'ENTER'}
          </button>
        </form>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
