'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'

interface SearchResult {
  id: number
  name: string
  cover_url: string | null
  release_year: number | null
  genres: string[]
  rating: number | null
  platforms: string[]
  summary: string | null
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  query: string
  onSelect: (result: SearchResult) => void
}

export default function SearchResults({
  results,
  isLoading,
  error,
  query,
  onSelect,
}: SearchResultsProps) {
  if (!query) return null

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 py-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2">
            <div className="skeleton" style={{ width: 40, height: 53, borderRadius: 4 }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 2 }} />
              <div className="skeleton" style={{ height: 10, width: '40%', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#ff4444',
          }}
        >
          {error}
        </p>
      </div>
    )
  }

  if (results.length === 0 && query.length >= 2) {
    return (
      <div className="py-6 text-center">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--text-secondary)',
          }}
        >
          NO GAMES FOUND — TRY A DIFFERENT SEARCH
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col overflow-y-auto"
      style={{ maxHeight: '320px' }}
    >
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => onSelect(result)}
          className="flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface"
          style={{ borderBottom: '1px solid var(--border-surface)' }}
        >
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{ width: 40, height: 53, borderRadius: 4 }}
          >
            {result.cover_url ? (
              <Image
                src={result.cover_url}
                alt={result.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'var(--surface)' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {result.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="truncate"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--text-primary)',
              }}
            >
              {result.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {result.release_year && (
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {result.release_year}
                </span>
              )}
              {result.rating && (
                <span className="flex items-center gap-0.5" style={{ color: 'var(--mint)', fontSize: '11px' }}>
                  <Star size={10} fill="currentColor" />
                  {(result.rating > 10 ? result.rating / 10 : result.rating).toFixed(1)}
                </span>
              )}
              {result.genres.length > 0 && (
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {result.genres.slice(0, 2).join(', ')}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
