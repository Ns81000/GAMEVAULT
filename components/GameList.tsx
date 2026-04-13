'use client'

import { Game } from '@/types'
import GameRow from '@/components/GameRow'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from '@/components/SortableItem'

interface GameListProps {
  games: Game[]
  onEdit: (game: Game) => void
  onView: (game: Game) => void
  isReorderMode?: boolean
}

export default function GameList({ games, onEdit, onView, isReorderMode = false }: GameListProps) {
  return (
    <SortableContext items={games.map(g => g.id)} strategy={verticalListSortingStrategy}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
        {games.map((game, index) => (
          <SortableItem key={game.id} id={game.id} disabled={!isReorderMode}>
            <GameRow game={game} onEdit={onEdit} index={index + 1} onView={onView} allowView={!isReorderMode} />
          </SortableItem>
        ))}
      </div>
    </SortableContext>
  )
}

export function GameListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4"
          style={{
            borderRadius: '20px',
            border: '1px solid var(--border-surface)',
          }}
        >
          <div className="skeleton flex-shrink-0" style={{ width: 60, height: 80, borderRadius: 4 }} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 2 }} />
            <div className="skeleton" style={{ height: 10, width: '60%', borderRadius: 2 }} />
            <div className="skeleton" style={{ height: 10, width: '30%', borderRadius: 2 }} />
          </div>
          <div className="flex gap-2">
            <div className="skeleton" style={{ height: 32, width: 100, borderRadius: 24 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
