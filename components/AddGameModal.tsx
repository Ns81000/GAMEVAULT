'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { X, Search } from 'lucide-react'
import SearchResults from '@/components/SearchResults'

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

interface AddGameModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (gameData: {
    igdb_id: number
    title: string
    cover_url: string
    release_year: number
    genres: string[]
    rating: number
    platforms: string[]
    summary: string
    download_link: string
    save_link?: string
  }) => Promise<void>
}

export default function AddGameModal({ isOpen, onClose, onAdd }: AddGameModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<SearchResult | null>(null)
  const [downloadLink, setDownloadLink] = useState('')
  const [saveLink, setSaveLink] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [linkError, setLinkError] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setResults([])
      setSelectedGame(null)
      setDownloadLink('')
      setSaveLink('')
      setSearchError(null)
      setLinkError('')
    }
  }, [isOpen])

  const searchIGDB = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const isNumeric = /^\d+$/.test(query)
      const param = isNumeric ? `id=${query}` : `q=${encodeURIComponent(query)}`
      const res = await fetch(`/api/igdb/search?${param}`)

      if (!res.ok) {
        throw new Error('Search failed')
      }

      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setSearchError('SEARCH UNAVAILABLE')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (searchQuery.length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchIGDB(searchQuery)
      }, 400)
    } else {
      setResults([])
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, searchIGDB])

  const handleSelectGame = (result: SearchResult) => {
    setSelectedGame(result)
    setResults([])
    setSearchQuery('')
  }

  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async () => {
    if (!selectedGame) return

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
    setIsAdding(true)

    try {
      await onAdd({
        igdb_id: selectedGame.id,
        title: selectedGame.name,
        cover_url: selectedGame.cover_url || '',
        release_year: selectedGame.release_year || 0,
        genres: selectedGame.genres || [],
        rating: selectedGame.rating || 0,
        platforms: selectedGame.platforms || [],
        summary: selectedGame.summary || '',
        download_link: downloadLink.trim(),
        save_link: saveLink.trim() || undefined,
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen) return null

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
        className="w-full sm:max-w-[560px] max-h-[90vh] overflow-y-auto modal-enter flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'clamp(0px, 5vw, 24px) clamp(0px, 5vw, 24px) 0 0',
        }}
        // Desktop gets full rounded corners
        id="add-game-modal"
      >
        <style>{`
          @media (min-width: 640px) {
            #add-game-modal {
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
            ADD TO VAULT
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Close modal"
          >
            <X size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Search input */}
        {!selectedGame && (
          <div className="px-5 pb-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-secondary)' }}
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games by name or IGDB ID..."
                className="w-full transition-colors duration-150"
                style={{
                  background: 'var(--canvas)',
                  border: '1px solid var(--text-secondary)',
                  borderRadius: '2px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  padding: '10px 16px 10px 36px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--mint)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--text-secondary)' }}
              />
            </div>
          </div>
        )}

        {/* Search results */}
        {!selectedGame && (
          <div className="px-5">
            <SearchResults
              results={results}
              isLoading={isSearching}
              error={searchError}
              query={searchQuery}
              onSelect={handleSelectGame}
            />
          </div>
        )}

        {/* Selected game preview */}
        {selectedGame && (
          <div className="px-5 pb-4">
            <div className="flex gap-4 mb-5">
              <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 100, height: 133, borderRadius: 4 }}>
                {selectedGame.cover_url ? (
                  <Image
                    src={selectedGame.cover_url}
                    alt={selectedGame.name}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'var(--canvas)' }}
                  >
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--text-secondary)' }}>
                      {selectedGame.name.charAt(0).toUpperCase()}
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
                  {selectedGame.name}
                </h3>
                <p className="mt-1" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {[
                    selectedGame.release_year?.toString(),
                    selectedGame.genres.slice(0, 3).join(', '),
                    selectedGame.rating ? `${(selectedGame.rating > 10 ? selectedGame.rating / 10 : selectedGame.rating).toFixed(1)} ★` : '',
                  ].filter(Boolean).join(' · ')}
                </p>
                {selectedGame.platforms.length > 0 && (
                  <p className="mt-1" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.7 }}>
                    {selectedGame.platforms.slice(0, 4).join(', ')}
                  </p>
                )}
                <button
                  onClick={() => setSelectedGame(null)}
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  ← CHANGE GAME
                </button>
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

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isAdding || !downloadLink.trim()}
              className="w-full mt-5 transition-all duration-180"
              style={{
                background: isAdding ? 'var(--mint-dark)' : 'var(--mint)',
                color: 'var(--text-absolute-black)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                borderRadius: '24px',
                padding: '12px 24px',
                border: 'none',
                opacity: isAdding || !downloadLink.trim() ? 0.6 : 1,
              }}
            >
              {isAdding ? 'ADDING...' : 'ADD TO VAULT'}
            </button>
          </div>
        )}

        {/* Bottom padding for mobile */}
        <div className="pb-5" />
      </div>
    </div>
  )
}
