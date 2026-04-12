'use client'

import { Game } from '@/types'
import GameCard from '@/components/GameCard'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from '@/components/SortableItem'

interface GameGridProps {
  games: Game[]
  onEdit: (game: Game) => void
}

export default function GameGrid({ games, onEdit }: GameGridProps) {
  return (
    <SortableContext items={games.map(g => g.id)} strategy={rectSortingStrategy}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-5">
        {games.map((game) => (
          <SortableItem key={game.id} id={game.id}>
            <GameCard game={game} onEdit={onEdit} />
          </SortableItem>
        ))}
      </div>
    </SortableContext>
  )
}

export function GameGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-5">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden"
          style={{
            borderRadius: '20px',
            border: '1px solid var(--border-surface)',
          }}
        >
          <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: '20px 20px 0 0' }} />
          <div className="p-4 flex flex-col gap-2">
            <div className="skeleton" style={{ height: 10, width: '50%', borderRadius: 2 }} />
            <div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 2 }} />
            <div className="skeleton" style={{ height: 10, width: '60%', borderRadius: 2 }} />
            <div className="skeleton mt-2" style={{ height: 32, borderRadius: 24 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
