import { cn } from '@/lib/utils'

export interface DateTimeFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  id?: string
  className?: string
}

const baseInputClasses =
  'w-full rounded-xl border bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] transition-all focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:outline-none placeholder:text-[var(--text-tertiary)]'

export function DateTimeField({
  value,
  onChange,
  label = 'Data e hora',
  placeholder = 'Selecione data e hora',
  error,
  disabled,
  id: idProp,
  className,
}: DateTimeFieldProps) {
  const id = idProp ?? `datetime-${Math.random().toString(36).slice(2)}`

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            baseInputClasses,
            'border-[var(--border-primary)] focus:border-[var(--color-brand-500)] pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            'min-h-[44px] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60',
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          aria-hidden
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2v2M14 2v2M3 8h14M5 4h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
