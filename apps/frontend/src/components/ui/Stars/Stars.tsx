import { STAR_MAX } from '@/domain/types'
import { cn } from '@/lib/utils'

interface StarsProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'text-sm gap-0.5',
  md: 'text-lg gap-0.5',
  lg: 'text-xl gap-1',
}

export function Stars({ value, max = STAR_MAX, size = 'md', className = '' }: StarsProps) {
  const rounded = Math.round(Math.max(0, Math.min(max, value)))
  return (
    <span
      className={cn('inline-flex text-[var(--color-accent-500)]', sizeClasses[size], className)}
      role="img"
      aria-label={`${rounded} estrelas`}
    >
      {'★'.repeat(rounded)}
      {'☆'.repeat(max - rounded)}
    </span>
  )
}
