'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { ToastMessage } from '@/types'

interface ToastProps {
  toasts: ToastMessage[]
  removeToast: (id: string) => void
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3" role="log" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 200)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 200)
  }

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 rounded-card-lg ${
        isExiting ? 'toast-exit' : 'toast-enter'
      }`}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${toast.type === 'success' ? 'var(--mint)' : '#ff4444'}`,
        minWidth: '280px',
        maxWidth: '400px',
      }}
    >
      {toast.type === 'success' ? (
        <CheckCircle size={18} style={{ color: 'var(--mint)', flexShrink: 0 }} />
      ) : (
        <XCircle size={18} style={{ color: '#ff4444', flexShrink: 0 }} />
      )}
      <span
        className="flex-1"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'var(--text-primary)',
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X size={14} style={{ color: 'var(--text-secondary)' }} />
      </button>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
