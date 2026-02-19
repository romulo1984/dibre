import { cn } from '@/lib/utils'

/** Dados mínimos para exibir avatar (foto ou inicial) */
export interface PlayerAvatarPlayer {
  name: string
  avatarUrl?: string | null
}

interface PlayerAvatarProps {
  player: PlayerAvatarPlayer
  /** circle = avatar redondo (padrão em rows, lista, etc). rect = retangular 3×4 (só no card do perfil). */
  variant?: 'circle' | 'rect'
  /** circle: sm/md/lg. rect: sm/md/lg (lg no perfil = destaque maior) */
  size?: 'sm' | 'md' | 'lg'
  /** Habilita efeito de zoom no hover (use em rows/cards) */
  hoverZoom?: boolean
  className?: string
}

const circleSizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
}

const rectSizeClasses = {
  sm: 'w-9 aspect-[3/4]',
  md: 'w-12 aspect-[3/4]',
  lg: 'w-40 aspect-[3/4]', // destaque no card do perfil
}

export function PlayerAvatar({
  player,
  variant = 'circle',
  size = 'md',
  hoverZoom = false,
  className,
}: PlayerAvatarProps) {
  const isCircle = variant === 'circle'
  const sizeClass = isCircle ? circleSizeClasses[size] : rectSizeClasses[size]
  const roundClass = isCircle ? 'rounded-full' : 'rounded-lg'

  const base = cn(
    'shrink-0 overflow-hidden bg-[var(--surface-tertiary)] object-cover',
    sizeClass,
    roundClass,
    hoverZoom && 'transition-transform duration-200 group-hover:scale-105',
    className,
  )

  const initialSizes = {
    sm: 'text-xs font-bold',
    md: 'text-sm font-bold',
    lg: isCircle ? 'text-base font-bold' : 'text-3xl font-bold',
  }

  if (player.avatarUrl) {
    return (
      <img
        src={player.avatarUrl}
        alt=""
        className={cn(base, 'object-cover')}
      />
    )
  }

  return (
    <div
      className={cn(
        base,
        'flex items-center justify-center bg-gradient-to-br from-[var(--color-brand-200)] to-[var(--color-brand-400)] text-white',
        initialSizes[size],
      )}
      aria-hidden
    >
      {player.name.charAt(0).toUpperCase()}
    </div>
  )
}
