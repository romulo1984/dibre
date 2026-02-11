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
          {teammates.map(({ player, timesTogether }, index) => (
            <li key={player.id}>
              <Link
                to={`/players/${player.id}`}
                className={cn(
                  'block rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-3',
                  'transition-colors hover:border-[var(--color-brand-400)] hover:bg-[var(--surface-secondary)]/50',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2',
                )}
              >
                <PlayerRow
                  player={player}
                  showAttributesOnHover
                  playerWithAttrs={player}
                  prefix={
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-tertiary)] text-xs font-bold text-[var(--text-tertiary)]"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                  }
                  avatarSize="md"
                >
                  <span className="shrink-0 rounded-full bg-[var(--color-brand-100)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-brand-700)]">
                    {timesTogether} {timesTogether === 1 ? 'vez' : 'vezes'}
                  </span>
                </PlayerRow>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </BlurFade>
  )
}
