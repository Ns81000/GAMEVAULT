'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search your vault...' }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--text-secondary)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 transition-colors duration-150"
        style={{
          background: 'var(--canvas)',
          border: '1px solid var(--text-secondary)',
          borderRadius: '2px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          padding: '10px 16px',
          paddingLeft: '44px',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--mint)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-secondary)'
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          aria-label="Clear search"
        >
          <X size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
      )}
    </div>
  )
}
