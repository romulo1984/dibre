import type { PlayerListViewMode } from '@/features/players/PlayerList'
import { cn } from '@/lib/utils'

interface ViewModeToggleProps {
  viewMode: PlayerListViewMode
  onChange: (mode: PlayerListViewMode) => void
}

export function ViewModeToggle({ viewMode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-[var(--border-primary)] p-0.5">
      <button
        type="button"
        onClick={() => onChange('cards')}
        className={cn(
          'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm',
          viewMode === 'cards'
            ? 'bg-[var(--color-brand-500)] text-white shadow-sm'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
        )}
        aria-label="Visualizar como cards"
        title="Cards"
      >
        &#x25A6;
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm',
          viewMode === 'list'
            ? 'bg-[var(--color-brand-500)] text-white shadow-sm'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
        )}
        aria-label="Visualizar como lista"
        title="Lista"
      >
        &#x2630;
      </button>
    </div>
  )
}
