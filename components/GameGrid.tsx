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
        {games.map((game, index) => (
          <SortableItem key={game.id} id={game.id}>
            <GameCard game={game} onEdit={onEdit} index={index + 1} />
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
          className="relative overflow-hidden w-full skeleton"
          style={{
            borderRadius: '16px',
            border: '1px solid var(--border-surface)',
            aspectRatio: '3/4',
          }}
        />
      ))}
    </div>
  )
}
