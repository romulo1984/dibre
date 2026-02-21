import { Link } from 'react-router-dom'
import type { PlayerTeammate } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'
import { PlayerRow } from '@/features/players/PlayerRow'
import { cn } from '@/lib/utils'

interface PlayerTopTeammatesProps {
  teammates: PlayerTeammate[]
  className?: string
}

export function PlayerTopTeammates({
  teammates,
  className = '',
}: PlayerTopTeammatesProps) {
  if (teammates.length === 0) {
    return (
      <BlurFade delay={0.25}>
        <section className={className}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Top 5 parceria
          </h3>
          <p className="rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 py-8 text-center text-sm text-[var(--text-tertiary)]">
            Após participar de peladas com sorteio, aqui aparecem quem mais jogou no mesmo time.
          </p>
        </section>
      </BlurFade>
    )
  }

  return (
    <BlurFade delay={0.25}>
      <section className={className}>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Top 5 parceria
        </h3>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          Quem mais jogou no mesmo time no sorteio
        </p>
        <ul className="space-y-2">
          {teammates.map(({ player, timesTogether }, index) => {
            const isDeleted = !!player.deletedAt

            const content = (
              <div className={cn('group relative', isDeleted && 'opacity-50')}>
                <div
                  className={cn(
                    'block overflow-hidden rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-2 sm:p-3',
                    !isDeleted &&
                      'transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--surface-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2',
                    isDeleted && 'cursor-default',
                  )}
                >
                  <PlayerRow
                    player={player}
                    showAttributesOnHover={!isDeleted}
                    playerWithAttrs={player}
                    prefix={
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-tertiary)] text-[10px] font-bold text-[var(--text-tertiary)] sm:size-8 sm:rounded-lg sm:text-xs"
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                    }
                    avatarSize="sm"
                  >
                    <span className="shrink-0 rounded-full bg-[var(--color-brand-100)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-brand-700)] sm:px-2.5 sm:text-xs">
                      {timesTogether}x
                    </span>
                  </PlayerRow>
                </div>
                {isDeleted && (
                  <span className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Jogador excluído
                  </span>
                )}
              </div>
            )

            return (
              <li key={player.id}>
                {isDeleted ? (
                  content
                ) : (
                  <Link to={`/players/${player.id}`}>
                    {content}
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
