import { cn } from '@/lib/utils'

const MIN = 2
const MAX = 20

export interface TeamsNumberInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function TeamsNumberInput({
  value,
  onChange,
  label = 'Número de times',
  error,
  disabled,
  className,
}: TeamsNumberInputProps) {
  const canDecrease = value > MIN && !disabled
  const canIncrease = value < MAX && !disabled

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <div className="flex items-center gap-0 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-1 overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(MIN, value - 1))}
          disabled={!canDecrease}
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors',
            canDecrease && 'hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] active:scale-95',
            !canDecrease && 'cursor-not-allowed opacity-40',
          )}
          aria-label="Diminuir número de times"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex min-w-[4rem] flex-1 items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {value}
          </span>
          <span className="ml-1 text-sm text-[var(--text-tertiary)]">times</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(MAX, value + 1))}
          disabled={!canIncrease}
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors',
            canIncrease && 'hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] active:scale-95',
            !canIncrease && 'cursor-not-allowed opacity-40',
          )}
          aria-label="Aumentar número de times"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
