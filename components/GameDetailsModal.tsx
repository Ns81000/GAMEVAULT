'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Download, Save, Pencil, Calendar, Star, LayoutGrid, Gamepad2, AlertCircle } from 'lucide-react'
import { Game } from '@/types'

interface GameDetailsModalProps {
  isOpen: boolean
  game: Game | null
  onClose: () => void
  onEdit?: (game: Game) => void
}

export default function GameDetailsModal({ isOpen, game, onClose, onEdit }: GameDetailsModalProps) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (game) {
      setImgError(false)
    }
  }, [game])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  const handleLinkAction = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!isOpen || !game) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-enter sm:p-6"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="w-full sm:max-w-[800px] h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden modal-enter flex flex-col sm:flex-row relative shadow-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'clamp(0px, 5vw, 24px) clamp(0px, 5vw, 24px) 0 0',
        }}
        id="details-game-modal"
      >
        <style>{`
          @media (min-width: 640px) {
            #details-game-modal {
              border-radius: 24px !important;
            }
          }
        `}</style>
        
        {/* Close Button Top Right - Absolute */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-200 hover:bg-black/80 bg-black/40 backdrop-blur-md border border-white/10"
          aria-label="Close modal"
        >
          <X size={20} style={{ color: '#fff' }} />
        </button>

        {/* Left Side: Cover Image */}
        <div className="w-full sm:w-[320px] sm:flex-shrink-0 relative h-[40vh] sm:h-auto sm:min-h-[500px]">
          {game.cover_url && !imgError ? (
            <>
              <Image
                src={game.cover_url}
                alt={game.title}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent sm:hidden" />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--canvas)' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '64px', color: 'var(--text-secondary)' }}>
                {game.title.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Mobile Overlay Title over image */}
          <div className="absolute bottom-6 left-5 right-5 sm:hidden">
            <h2 className="text-2xl font-bold text-white shadow-sm line-clamp-3" style={{ fontFamily: 'var(--font-body)', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
              {game.title}
            </h2>
          </div>
        </div>

        {/* Right Side: Details & Scrolling Content */}
        <div className="flex-1 flex flex-col overflow-y-auto w-full custom-scroll">
          <style>{`
            .custom-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: var(--border-default);
              border-radius: 10px;
            }
            .custom-scroll::-webkit-scrollbar-thumb:hover {
              background: var(--text-secondary);
            }
          `}</style>
          <div className="p-6 flex flex-col gap-6">
            
            {/* Desktop Title Header */}
            <div className="hidden sm:flex items-start justify-between gap-4 pr-12">
              <h2 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-body)' }}>
                {game.title}
              </h2>
            </div>
            
            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-3 mt-2 sm:mt-0">
              <button
                onClick={() => handleLinkAction(game.download_link)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 transition-all duration-180 active:scale-95 cursor-pointer"
                style={{
                  background: 'var(--mint)',
                  color: 'var(--text-absolute-black)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderRadius: '24px',
                  padding: '12px 24px',
                  border: 'none',
                }}
              >
                <Download size={16} /> DOWNLOAD
              </button>
              
              {game.save_link && (
                <button
                  onClick={() => handleLinkAction(game.save_link!)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 transition-all duration-180 hover:bg-white/5 active:scale-95 cursor-pointer"
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRadius: '24px',
                    padding: '12px 24px',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Save size={16} /> SAVE
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => {
                    onClose()
                    onEdit(game)
                  }}
                  className="w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] flex-shrink-0 flex items-center justify-center transition-all duration-180 hover:bg-white/5 active:scale-95 cursor-pointer"
                  style={{
                    background: 'transparent',
                    color: 'var(--mint)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                  aria-label="Edit Game"
                >
                  <Pencil size={18} />
                </button>
              )}
            </div>

            {/* Meta Tags Row */}
            <div className="flex flex-wrap gap-x-6 gap-y-4 pt-5 border-t" style={{ borderColor: 'var(--border-default)' }}>
              
              {game.release_year ? (
                <div className="flex items-center gap-2">
                  <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>
                    {game.release_year}
                  </span>
                </div>
              ) : null}

              {game.rating ? (
                <div className="flex items-center gap-2">
                  <Star size={16} style={{ color: 'var(--mint)' }} fill="var(--mint)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {game.rating > 10 ? (game.rating / 10).toFixed(1) : game.rating.toFixed(1)} <span style={{color: 'var(--text-secondary)', fontWeight: 'normal'}}>/ 10</span>
                  </span>
                </div>
              ) : null}

              {game.genres && game.genres.length > 0 ? (
                <div className="flex items-start gap-2 max-w-full">
                  <LayoutGrid size={16} style={{ color: 'var(--text-secondary)', marginTop: '2px' }} className="flex-shrink-0" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)' }}>
                    {game.genres.join(', ')}
                  </span>
                </div>
              ) : null}

              {game.platforms && game.platforms.length > 0 ? (
                <div className="flex items-start gap-2 max-w-full w-full">
                  <Gamepad2 size={16} style={{ color: 'var(--text-secondary)', marginTop: '2px' }} className="flex-shrink-0" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {game.platforms.join(', ')}
                  </span>
                </div>
              ) : null}

            </div>

            {/* Summary */}
            <div className="pt-5 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                About this game
              </h4>
              {game.summary ? (
                <p 
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--text-primary)',
                    opacity: 0.9,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {game.summary}
                </p>
              ) : (
                <div className="flex items-center gap-2 italic opacity-50 pt-2" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={16} /> No summary available
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
