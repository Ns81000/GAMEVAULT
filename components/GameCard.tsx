'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, Save, Pencil, Copy } from 'lucide-react'
import { Game } from '@/types'

interface GameCardProps {
  game: Game
  onEdit: (game: Game) => void
}

export default function GameCard({ game, onEdit }: GameCardProps) {
  const [copiedType, setCopiedType] = useState<'download' | 'save' | null>(null)
  const [imgError, setImgError] = useState(false)

  const handleLinkAction = async (url: string, type: 'download' | 'save') => {
    window.open(url, '_blank', 'noopener,noreferrer')
    try {
      await navigator.clipboard.writeText(url)
      setCopiedType(type)
      setTimeout(() => setCopiedType(null), 1500)
    } catch {
      // clipboard not available
    }
  }

  const genreDisplay = game.genres?.slice(0, 2).join(', ') || ''
  const ratingDisplay = game.rating ? (game.rating > 10 ? (game.rating / 10).toFixed(1) : game.rating.toFixed(1)) : ''
  const metaParts = [
    game.release_year?.toString(),
    genreDisplay,
    ratingDisplay ? `${ratingDisplay} ★` : '',
  ].filter(Boolean)

  return (
    <div
      className="relative flex flex-col overflow-hidden transition-all duration-300 group cursor-pointer"
      style={{
        background: 'var(--canvas)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        aspectRatio: '3/4', 
      }}
    >
      {/* Cover Image */}
      {game.cover_url && !imgError ? (
        <Image
          src={game.cover_url}
          alt={game.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center p-4 text-center absolute inset-0"
          style={{ background: 'var(--surface)' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '48px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            {game.title.charAt(0)}
          </span>
          <span 
            className="mt-2 opacity-50 line-clamp-2"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              fontWeight: 700,
            }}
          >
            {game.title}
          </span>
        </div>
      )}

      {/* Hover Overlay */}
      <div 
        className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none lg:group-hover:pointer-events-auto"
        style={{
          background: 'linear-gradient(to top, rgba(14, 14, 14, 0.98) 0%, rgba(14, 14, 14, 0.8) 45%, rgba(14, 14, 14, 0.2) 100%)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {/* Edit button */}
        <button
          onClick={() => onEdit(game)}
          className="absolute top-3 right-3 p-2 rounded-full transition-all duration-200 hover:bg-white/20"
          style={{ background: 'rgba(19, 19, 19, 0.8)' }}
          aria-label={`Edit ${game.title}`}
        >
          <Pencil size={14} style={{ color: 'var(--mint)' }} />
        </button>

        {/* Content (slides up slightly on hover) */}
        <div className="translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col gap-2">
          {/* Title */}
          <h3
            className="line-clamp-2 leading-tight"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '16px',
              color: '#ffffff',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {game.title}
          </h3>

          {/* Metadata */}
          <p
            className="line-clamp-1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {metaParts.join(' · ')}
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-2 mt-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleLinkAction(game.download_link, 'download')
              }}
              className="w-full flex items-center justify-center gap-1.5 transition-all duration-180 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: copiedType === 'download' ? 'var(--mint-dark)' : 'var(--mint)',
                color: 'var(--text-absolute-black)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                borderRadius: '16px',
                padding: '8px',
                border: 'none',
              }}
            >
              {copiedType === 'download' ? (
                <>
                  <Copy size={11} />
                  COPIED!
                </>
              ) : (
                <>
                  <Download size={11} />
                  DOWNLOAD
                </>
              )}
            </button>

            {game.save_link && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleLinkAction(game.save_link!, 'save')
                }}
                className="w-full flex items-center justify-center gap-1.5 transition-all duration-180 hover:bg-white/10 active:scale-[0.98]"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: copiedType === 'save' ? 'var(--mint)' : '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  borderRadius: '16px',
                  padding: '8px',
                  border: `1px solid ${copiedType === 'save' ? 'var(--mint)' : 'rgba(255, 255, 255, 0.2)'}`,
                }}
              >
                {copiedType === 'save' ? (
                  <>
                    <Copy size={11} />
                    COPIED!
                  </>
                ) : (
                  <>
                    <Save size={11} />
                    SAVE
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Action Fallback: Always visible on mobile to prevent double-tap issues */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2 lg:hidden bg-gradient-to-t from-black/90 to-transparent"
      >
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleLinkAction(game.download_link, 'download')
              }}
              className="flex-1 flex items-center justify-center transition-all duration-180 active:scale-[0.98]"
              style={{
                background: copiedType === 'download' ? 'var(--mint-dark)' : 'var(--mint)',
                color: 'var(--text-absolute-black)',
                borderRadius: '8px',
                padding: '10px',
                border: 'none',
              }}
            >
              {copiedType === 'download' ? <Copy size={16} /> : <Download size={16} />}
            </button>

            {game.save_link && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleLinkAction(game.save_link!, 'save')
                }}
                className="flex-1 flex items-center justify-center transition-all duration-180 active:scale-[0.98]"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: copiedType === 'save' ? 'var(--mint)' : '#ffffff',
                  borderRadius: '8px',
                  padding: '10px',
                  border: `1px solid ${copiedType === 'save' ? 'var(--mint)' : 'rgba(255, 255, 255, 0.3)'}`,
                }}
              >
                {copiedType === 'save' ? <Copy size={16} /> : <Save size={16} />}
              </button>
            )}

            {/* Edit Button for Mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(game)
              }}
              className="flex-shrink-0 flex items-center justify-center transition-all duration-180 active:scale-[0.98]"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'var(--mint)',
                borderRadius: '8px',
                padding: '10px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                aspectRatio: '1',
              }}
              aria-label="Edit Game"
            >
              <Pencil size={16} />
            </button>
          </div>
      </div>
    </div>
  )
}
