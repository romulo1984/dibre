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
                  'group relative grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-3',
                  !isDeleted &&
                    'transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--surface-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2',
                  isDeleted && 'cursor-default opacity-50',
                )}
              >
                <span className="min-w-0 truncate font-medium text-[var(--text-primary)]">
                  {game.name}
                </span>
                <span className="w-24 shrink-0 text-right text-xs text-[var(--text-tertiary)]">
                  {formatGameDate(game.createdAt)}
                </span>
                <span className="shrink-0 text-[var(--text-tertiary)]" aria-hidden>
                  {isDeleted ? '' : '→'}
                </span>
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
                  <Link to={`/peladas/${game.id}`}>
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
