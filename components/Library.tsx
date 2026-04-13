'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, RefreshCw, WifiOff, ArrowUpDown, Lock } from 'lucide-react'
import { isAuthenticated, clearAuth } from '@/lib/auth'
import { Game, ViewMode } from '@/types'
import SearchBar from '@/components/SearchBar'
import ViewToggle from '@/components/ViewToggle'
import GameGrid, { GameGridSkeleton } from '@/components/GameGrid'
import GameList, { GameListSkeleton } from '@/components/GameList'
import AddGameModal from '@/components/AddGameModal'
import EditGameModal from '@/components/EditGameModal'
import GameDetailsModal from '@/components/GameDetailsModal'
import Toast, { useToast } from '@/components/Toast'

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'

export default function Library() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [viewingGame, setViewingGame] = useState<Game | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isReorderMode, setIsReorderMode] = useState(false)
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(20)

  const { toasts, addToast, removeToast } = useToast()

  // Reset pagination on search change
  useEffect(() => {
    setVisibleCount(20)
  }, [searchQuery])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/')
      return
    }

    const savedView = localStorage.getItem('gamevault_view')
    if (savedView === 'list' || savedView === 'grid') {
      setViewMode(savedView)
    }

    fetchGames()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchGames = async () => {
    setIsLoading(true)
    setHasError(false)

    try {
      const res = await fetch('/api/games')
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      setGames(data.games || [])
    } catch {
      setHasError(true)
      addToast('error', 'Failed to load library')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    
    // Don't reorder if searching
    if (searchQuery.trim().length > 0) return

    setGames((items) => {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      
      const reordered = arrayMove(items, oldIndex, newIndex)
      
      // Update sort order sequentially
      const updated = reordered.map((g, index) => ({ ...g, sort_order: index }))
      
      // Async save to db
      const changes = updated.map(g => ({ id: g.id, sort_order: g.sort_order || 0 }))
      fetch('/api/games/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: changes })
      }).catch(err => {
        addToast('error', 'Failed to save reorder')
        console.error(err)
      })

      return updated
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before dragging starts (allows clicking buttons inside)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold to drag on mobile
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleViewToggle = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('gamevault_view', mode)
  }, [])

  const handleAddGame = useCallback(async (gameData: {
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
  }) => {
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      })

      if (res.status === 409) {
        addToast('error', 'Already in your vault')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to add')
      }

      addToast('success', `${gameData.title} added to vault`)
      setShowAddModal(false)
      await fetchGames()
    } catch {
      addToast('error', 'Failed to add game — try again')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEditSave = useCallback(async (id: string, downloadLink: string, saveLink: string) => {
    try {
      const res = await fetch('/api/games', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, download_link: downloadLink, save_link: saveLink }),
      })

      if (!res.ok) throw new Error('Failed to update')

      addToast('success', 'Game updated')
      setEditingGame(null)
      await fetchGames()
    } catch {
      addToast('error', 'Failed to update game')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/games?id=${id}`, { method: 'DELETE' })

      if (!res.ok) throw new Error('Failed to delete')

      addToast('success', 'Game removed from vault')
      setEditingGame(null)
      await fetchGames()
    } catch {
      addToast('error', 'Failed to remove game')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.replace('/')
  }

  const toggleReorderMode = () => {
    setIsReorderMode((current) => !current)
  }

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games
    const q = searchQuery.toLowerCase()
    return games.filter((game) =>
      game.title.toLowerCase().includes(q) ||
      game.genres?.some((g) => g.toLowerCase().includes(q)) ||
      game.platforms?.some((p) => p.toLowerCase().includes(q)) ||
      game.release_year?.toString().includes(q)
    )
  }, [games, searchQuery])

  const displayedGames = filteredGames.slice(0, visibleCount)
  const hasMore = displayedGames.length < filteredGames.length

  return (
    <div className="min-h-screen" style={{ background: 'var(--canvas)' }}>
      {!isOnline && (
        <div
          className="flex items-center justify-center gap-2 py-2"
          style={{
            background: '#ff4444',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#ffffff',
          }}
        >
          <WifiOff size={14} />
          YOU ARE OFFLINE
        </div>
      )}

      <header
        className="sticky top-0 z-40"
        style={{
          background: 'var(--canvas)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <h1
              className="flex-shrink-0 cursor-pointer"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 4vw, 36px)',
                color: 'var(--mint)',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              GAMEVAULT
            </h1>

            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <div className="flex items-center gap-3">
              <ViewToggle viewMode={viewMode} onToggle={handleViewToggle} />

              <button
                onClick={toggleReorderMode}
                className="flex items-center gap-1.5 transition-all duration-180"
                style={{
                  background: isReorderMode ? 'var(--text-absolute-black)' : 'transparent',
                  color: isReorderMode ? 'var(--mint)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  borderRadius: '24px',
                  padding: '8px 14px',
                  border: `1px solid ${isReorderMode ? 'var(--mint)' : 'var(--border-default)'}`,
                }}
                aria-pressed={isReorderMode}
                title={isReorderMode ? 'Lock card positions' : 'Enable drag mode'}
              >
                {isReorderMode ? <Lock size={14} /> : <ArrowUpDown size={14} />}
                <span className="hidden sm:inline">{isReorderMode ? 'LOCK POSITIONS' : 'DRAG MODE'}</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 transition-all duration-180"
                style={{
                  background: 'var(--mint)',
                  color: 'var(--text-absolute-black)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  borderRadius: '24px',
                  padding: '8px 16px',
                  border: 'none',
                }}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">ADD GAME</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 transition-opacity hover:opacity-70"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>

          <div className="lg:hidden pb-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {!isLoading && !hasError && (
          <p
            className="mb-5"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'var(--text-secondary)',
            }}
          >
            {filteredGames.length} {filteredGames.length === 1 ? 'GAME' : 'GAMES'} IN YOUR VAULT
            {searchQuery && ` (FILTERED)`}
          </p>
        )}

        {isLoading && (
          viewMode === 'grid' ? <GameGridSkeleton /> : <GameListSkeleton />
        )}

        {hasError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#ff4444',
              }}
            >
              FAILED TO LOAD LIBRARY
            </p>
            <button
              onClick={fetchGames}
              className="flex items-center gap-2 transition-all duration-180"
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
                border: 'none',
              }}
            >
              <RefreshCw size={14} />
              RETRY
            </button>
          </div>
        )}

        {!isLoading && !hasError && games.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 5vw, 42px)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              YOUR VAULT IS EMPTY
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 transition-all duration-180"
              style={{
                background: 'var(--mint)',
                color: 'var(--text-absolute-black)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                borderRadius: '24px',
                padding: '12px 28px',
                border: 'none',
              }}
            >
              <Plus size={16} />
              ADD YOUR FIRST GAME
            </button>
          </div>
        )}

        {!isLoading && !hasError && games.length > 0 && filteredGames.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-20">
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: 'var(--text-secondary)',
              }}
            >
              NO GAMES MATCH &ldquo;{searchQuery.toUpperCase()}&rdquo;
            </p>
          </div>
        )}

        {!isLoading && !hasError && filteredGames.length > 0 && (
          <DndContext
            sensors={isReorderMode ? sensors : []}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            {viewMode === 'grid' ? (
              <GameGrid games={displayedGames} onEdit={setEditingGame} onView={setViewingGame} isReorderMode={isReorderMode} />
            ) : (
              <GameList games={displayedGames} onEdit={setEditingGame} onView={setViewingGame} isReorderMode={isReorderMode} />
            )}
          </DndContext>
        )}

        {!isLoading && !hasError && hasMore && (
          <div className="flex justify-center mt-8 pb-8">
            <button
              onClick={() => setVisibleCount(v => v + 20)}
              className="transition-all duration-180 hover:bg-surface"
              style={{
                background: 'transparent',
                color: 'var(--mint)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                borderRadius: '24px',
                padding: '12px 32px',
                border: '1px solid var(--mint)',
              }}
            >
              LOAD MORE
            </button>
          </div>
        )}
      </main>

      <AddGameModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddGame}
      />

      <EditGameModal
        isOpen={!!editingGame}
        game={editingGame}
        onClose={() => setEditingGame(null)}
        onSave={handleEditSave}
        onDelete={handleDelete}
      />

      <GameDetailsModal
        isOpen={!!viewingGame}
        game={viewingGame}
        onClose={() => setViewingGame(null)}
        onEdit={setEditingGame}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
