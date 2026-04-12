'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Game } from '@/types'

interface EditGameModalProps {
  isOpen: boolean
  game: Game | null
  onClose: () => void
  onSave: (id: string, downloadLink: string, saveLink: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function EditGameModal({ isOpen, game, onClose, onSave, onDelete }: EditGameModalProps) {
  const [downloadLink, setDownloadLink] = useState('')
  const [saveLink, setSaveLink] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (game) {
      setDownloadLink(game.download_link || '')
      setSaveLink(game.save_link || '')
      setShowDeleteConfirm(false)
      setLinkError('')
      setImgError(false)
    }
  }, [game])

  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  const handleSave = async () => {
    if (!game) return

    if (!downloadLink.trim()) {
      setLinkError('Download link is required')
      return
    }

    if (!isValidUrl(downloadLink.trim())) {
      setLinkError('Please enter a valid URL')
      return
    }

    if (saveLink.trim() && !isValidUrl(saveLink.trim())) {
      setLinkError('Save link must be a valid URL')
      return
    }

    setLinkError('')
    setIsSaving(true)
    try {
      await onSave(game.id, downloadLink.trim(), saveLink.trim())
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!game) return
    setIsDeleting(true)
    try {
      await onDelete(game.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen || !game) return null

  const genreDisplay = game.genres?.slice(0, 3).join(', ') || ''
  const ratingDisplay = game.rating ? (game.rating > 10 ? (game.rating / 10).toFixed(1) : game.rating.toFixed(1)) : ''
  const metaParts = [game.release_year?.toString(), genreDisplay, ratingDisplay ? `${ratingDisplay} ★` : ''].filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-enter"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full sm:max-w-[560px] max-h-[90vh] overflow-y-auto modal-enter"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'clamp(0px, 5vw, 24px) clamp(0px, 5vw, 24px) 0 0',
        }}
        id="edit-game-modal"
      >
        <style>{`
          @media (min-width: 640px) {
            #edit-game-modal {
              border-radius: 24px !important;
            }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'var(--text-primary)',
            }}
          >
            EDIT GAME
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Close modal"
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Game preview */}
        <div className="px-5 pb-4">
          <div className="flex gap-4 mb-5">
            <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 80, height: 107, borderRadius: 4 }}>
              {game.cover_url && !imgError ? (
                <Image
                  src={game.cover_url}
                  alt={game.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'var(--canvas)' }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--text-secondary)' }}>
                    {game.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                }}
              >
                {game.title}
              </h3>
              <p className="mt-1" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {metaParts.join(' · ')}
              </p>
            </div>
          </div>

          {/* Link inputs */}
          <div className="flex flex-col gap-3">
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                DOWNLOAD LINK *
              </label>
              <input
                type="url"
                value={downloadLink}
                onChange={(e) => { setDownloadLink(e.target.value); setLinkError('') }}
                placeholder="https://..."
                className="w-full transition-colors duration-150"
                style={{
                  background: 'var(--canvas)',
                  border: `1px solid ${linkError ? 'var(--ultraviolet)' : 'var(--text-secondary)'}`,
                  borderRadius: '2px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  padding: '10px 16px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--mint)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = linkError ? 'var(--ultraviolet)' : 'var(--text-secondary)' }}
              />
            </div>
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                SAVE LINK (OPTIONAL)
              </label>
              <input
                type="url"
                value={saveLink}
                onChange={(e) => setSaveLink(e.target.value)}
                placeholder="https://..."
                className="w-full transition-colors duration-150"
                style={{
                  background: 'var(--canvas)',
                  border: '1px solid var(--text-secondary)',
                  borderRadius: '2px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  padding: '10px 16px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--mint)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--text-secondary)' }}
              />
            </div>
            {linkError && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ff4444', letterSpacing: '1px' }}>
                {linkError}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full transition-all duration-180"
              style={{
                background: isSaving ? 'var(--mint-dark)' : 'var(--mint)',
                color: 'var(--text-absolute-black)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                borderRadius: '24px',
                padding: '12px 24px',
                border: 'none',
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full transition-all duration-180"
                style={{
                  background: 'transparent',
                  color: '#ff4444',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  borderRadius: '24px',
                  padding: '12px 24px',
                  border: '1px solid #ff4444',
                }}
              >
                REMOVE FROM VAULT
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p
                  className="text-center"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#ff4444',
                  }}
                >
                  ARE YOU SURE?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 transition-all duration-180"
                    style={{
                      background: '#ff4444',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      borderRadius: '24px',
                      padding: '10px 24px',
                      border: 'none',
                      opacity: isDeleting ? 0.6 : 1,
                    }}
                  >
                    {isDeleting ? 'REMOVING...' : 'YES, REMOVE'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 transition-all duration-180"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      borderRadius: '24px',
                      padding: '10px 24px',
                      border: '1px solid var(--text-secondary)',
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom padding for mobile */}
        <div className="pb-5" />
      </div>
    </div>
  )
}
