import { STAR_MAX } from '../../../domain/types.js'

interface StarsProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
}

export function Stars({ value, max = STAR_MAX, size = 'md', className = '' }: StarsProps) {
  const rounded = Math.round(Math.max(0, Math.min(max, value)))
  return (
    <span
      className={`inline-flex gap-0.5 text-amber-500 ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={`${rounded} estrelas`}
    >
      {'★'.repeat(rounded)}
      {'☆'.repeat(max - rounded)}
    </span>
  )
}
