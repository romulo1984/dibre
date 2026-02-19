import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] shadow-[var(--shadow-xs)]',
  secondary:
    'bg-[var(--surface-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)] shadow-[var(--shadow-xs)]',
  outline:
    'border border-[var(--border-secondary)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-[var(--shadow-xs)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-md)]',
  md: 'h-9 px-4 text-sm gap-2 rounded-[var(--radius-lg)]',
  lg: 'h-11 px-6 text-sm gap-2 rounded-[var(--radius-lg)]',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-500)]',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Carregando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
