import { Link } from 'react-router-dom'
import type { PlayerParticipationGame } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'
import { cn } from '@/lib/utils'

interface PlayerParticipatedGamesProps {
  games: PlayerParticipationGame[]
  className?: string
}

function formatGameDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function PlayerParticipatedGames({
  games,
  className = '',
}: PlayerParticipatedGamesProps) {
  if (games.length === 0) {
    return (
      <BlurFade delay={0.2}>
        <section className={className}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Peladas que participou
          </h3>
          <p className="rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 py-8 text-center text-sm text-[var(--text-tertiary)]">
            Nenhuma pelada ainda. Participe de uma pelada para aparecer aqui.
          </p>
        </section>
      </BlurFade>
    )
  }

  return (
    <BlurFade delay={0.2}>
      <section className={className}>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Peladas que participou
        </h3>
        <ul className="space-y-1.5">
          {games.map((game) => {
            const isDeleted = !!game.deletedAt

            const row = (
              <div
                className={cn(
                  'group relative flex items-center gap-2 overflow-hidden rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-3 sm:px-4',
                  !isDeleted &&
                    'transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--surface-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2',
                  isDeleted && 'cursor-default opacity-50',
                )}
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
                  {game.name}
                </span>
                <span className="shrink-0 text-[10px] text-[var(--text-tertiary)] sm:text-xs">
                  {formatGameDate(game.createdAt)}
                </span>
                {!isDeleted && (
                  <span className="shrink-0 text-[var(--text-tertiary)]" aria-hidden>
                    →
                  </span>
                )}
                {isDeleted && (
                  <span className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Pelada excluída
                  </span>
                )}
              </div>
            )

            return (
              <li key={game.id}>
                {isDeleted ? (
                  row
                ) : (
                  <Link to={`/games/${game.id}`}>
                    {row}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </BlurFade>
  )
}
