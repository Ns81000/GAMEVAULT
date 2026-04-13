'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function SortableItem({ id, children, disabled = false }: { id: string, children: React.ReactNode, disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...(!disabled ? attributes : {})} 
      {...(!disabled ? listeners : {})} 
      className={`${disabled ? 'touch-auto cursor-default' : isDragging ? 'touch-none cursor-grabbing' : 'touch-none cursor-grab'} h-full`}
    >
      {children}
    </div>
  )
}
