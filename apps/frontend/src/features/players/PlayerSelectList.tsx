import { useState, type ReactNode } from 'react'
import { PlayerRow } from '@/features/players/PlayerRow'
import { cn } from '@/lib/utils'
import type { Player } from '@/domain/types'

interface PlayerSelectListProps {
  players: Player[]
  selectedIds: string[]
  onToggle: (playerId: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  disabled?: boolean
  searchable?: boolean
  emptyMessage?: ReactNode
  className?: string
}

export function PlayerSelectList({
  players,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  disabled = false,
  searchable = false,
  emptyMessage,
  className,
}: PlayerSelectListProps) {
  const [search, setSearch] = useState('')

  const selectedSet = new Set(selectedIds)
  const allSelected = players.length > 0 && selectedIds.length === players.length

  const filtered = search.trim()
    ? players.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    : players

  return (
    <div className={cn('space-y-3', className)}>
      {players.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jogador..."
              className="min-w-0 flex-1 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
            />
          )}
          <div className="flex gap-2">
            {onSelectAll && onDeselectAll && (
              <button
                type="button"
                disabled={disabled}
                onClick={allSelected ? onDeselectAll : onSelectAll}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                  allSelected
                    ? 'border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]'
                    : 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)]',
                  disabled && 'opacity-60'
                )}
              >
                {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            )}
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <ul className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto rounded-lg border border-[var(--border-primary)] p-1 sm:max-h-[320px] sm:p-1.5">
          {filtered.map((p) => {
            const isSelected = selectedSet.has(p.id)
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggle(p.id)}
                  className={cn(
                    'w-full cursor-pointer rounded-lg text-left transition-colors',
                    isSelected
                      ? 'bg-[var(--color-brand-50)] hover:bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)]'
                      : 'hover:bg-[var(--surface-tertiary)]',
                    disabled && 'opacity-60'
                  )}
                >
                  <PlayerRow player={p}>
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded border text-xs font-medium',
                        isSelected
                          ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white'
                          : 'border-[var(--border-primary)] bg-[var(--surface-primary)]'
                      )}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </PlayerRow>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {filtered.length === 0 && search.trim() && (
        <p className="py-4 text-center text-sm text-[var(--text-tertiary)]">
          Nenhum jogador encontrado.
        </p>
      )}

      {players.length === 0 && emptyMessage}
    </div>
  )
}
