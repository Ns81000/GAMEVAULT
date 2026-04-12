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
  const [isHovered, setIsHovered] = useState(false)

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
    ratingDisplay,
  ].filter(Boolean)

  return (
    <div
      className="relative flex flex-col overflow-hidden transition-all duration-200 group"
      style={{
        background: 'var(--canvas)',
        border: '1px solid var(--border-default)',
        borderRadius: '20px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit button */}
      <button
        onClick={() => onEdit(game)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200"
        style={{
          background: 'rgba(19, 19, 19, 0.85)',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scale(1)' : 'scale(0.8)',
        }}
        aria-label={`Edit ${game.title}`}
      >
        <Pencil size={14} style={{ color: 'var(--text-secondary)' }} />
      </button>

      {/* Cover Image */}
      <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
        {game.cover_url && !imgError ? (
          <Image
            src={game.cover_url}
            alt={game.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
            style={{ borderRadius: '4px 4px 0 0' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'var(--surface)',
              borderRadius: '4px 4px 0 0',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              {game.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Genre tag */}
        {genreDisplay && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              textTransform: 'uppercase',
              color: 'var(--mint)',
              letterSpacing: '1.8px',
            }}
          >
            {genreDisplay}
          </span>
        )}

        {/* Title */}
        <h3
          className="transition-colors duration-150 line-clamp-2"
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '18px',
            color: isHovered ? 'var(--link-hover)' : 'var(--text-primary)',
          }}
        >
          {game.title}
        </h3>

        {/* Metadata */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          {metaParts.join(' · ')}
        </p>

        {/* Platforms */}
        {game.platforms && game.platforms.length > 0 && (
          <p
            className="line-clamp-1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              opacity: 0.7,
            }}
          >
            {game.platforms.slice(0, 3).join(', ')}
            {game.platforms.length > 3 && ` +${game.platforms.length - 3}`}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => handleLinkAction(game.download_link, 'download')}
            className="relative flex-1 flex items-center justify-center gap-1.5 transition-all duration-180"
            style={{
              background: copiedType === 'download' ? 'var(--mint-dark)' : 'var(--mint)',
              color: 'var(--text-absolute-black)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              borderRadius: '24px',
              padding: '8px 12px',
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
              onClick={() => handleLinkAction(game.save_link!, 'save')}
              className="relative flex items-center justify-center gap-1.5 transition-all duration-180"
              style={{
                background: 'transparent',
                color: copiedType === 'save' ? 'var(--mint)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                borderRadius: '24px',
                padding: '8px 12px',
                border: `1px solid ${copiedType === 'save' ? 'var(--mint)' : 'var(--text-secondary)'}`,
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
  )
}
