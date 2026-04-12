'use client'

import { LayoutGrid, List } from 'lucide-react'
import { ViewMode } from '@/types'

interface ViewToggleProps {
  viewMode: ViewMode
  onToggle: (mode: ViewMode) => void
}

export default function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="View mode">
      <button
        onClick={() => onToggle('grid')}
        className="p-2 rounded-lg transition-all duration-150"
        style={{
          color: viewMode === 'grid' ? 'var(--mint)' : 'var(--text-secondary)',
          borderBottom: viewMode === 'grid' ? '2px solid var(--mint)' : '2px solid transparent',
        }}
        role="radio"
        aria-checked={viewMode === 'grid'}
        aria-label="Grid view"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => onToggle('list')}
        className="p-2 rounded-lg transition-all duration-150"
        style={{
          color: viewMode === 'list' ? 'var(--mint)' : 'var(--text-secondary)',
          borderBottom: viewMode === 'list' ? '2px solid var(--mint)' : '2px solid transparent',
        }}
        role="radio"
        aria-checked={viewMode === 'list'}
        aria-label="List view"
      >
        <List size={18} />
      </button>
    </div>
  )
}
