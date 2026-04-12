'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, Save, Pencil, Copy } from 'lucide-react'
import { Game } from '@/types'

interface GameRowProps {
  game: Game
  onEdit: (game: Game) => void
}

export default function GameRow({ game, onEdit }: GameRowProps) {
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
      className="flex flex-col gap-4 p-4 transition-all duration-200 group w-full"
      style={{
        background: 'var(--canvas)',
        border: '1px solid var(--border-default)',
        borderRadius: '20px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Section: Thumbnail + Info */}
      <div className="flex items-start gap-4 w-full min-w-0">
        {/* Thumbnail */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{
            width: '60px',
            height: '80px',
            borderRadius: '4px',
          }}
        >
          {game.cover_url && !imgError ? (
            <Image
              src={game.cover_url}
              alt={game.title}
              fill
              sizes="60px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--surface)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                {game.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="transition-colors duration-150 truncate"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '18px',
              color: isHovered ? 'var(--link-hover)' : 'var(--text-primary)',
            }}
          >
            {game.title}
          </h3>
          <p
            className="mt-0.5"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            {metaParts.join(' · ')}
          </p>
          {game.platforms && game.platforms.length > 0 && (
            <p
              className="mt-0.5 truncate"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                opacity: 0.7,
              }}
            >
              {game.platforms.slice(0, 4).join(', ')}
              {game.platforms.length > 4 && ` +${game.platforms.length - 4}`}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section: Actions */}
      <div className="flex flex-wrap items-center gap-2 w-full mt-1">
        <button
          onClick={() => handleLinkAction(game.download_link, 'download')}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 transition-all duration-180"
          style={{
            background: copiedType === 'download' ? 'var(--mint-dark)' : 'var(--mint)',
            color: 'var(--text-absolute-black)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            borderRadius: '24px',
            padding: '8px 16px',
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
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 transition-all duration-180"
            style={{
              background: 'transparent',
              color: copiedType === 'save' ? 'var(--mint)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              borderRadius: '24px',
              padding: '8px 16px',
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

        <button
          onClick={() => onEdit(game)}
          className="p-2 rounded-full transition-all duration-200"
          style={{
            opacity: isHovered ? 1 : 0.4,
          }}
          aria-label={`Edit ${game.title}`}
        >
          <Pencil size={14} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </div>
  )
}
