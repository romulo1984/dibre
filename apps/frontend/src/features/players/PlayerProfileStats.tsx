import type { Player } from '@/domain/types'
import { ATTRIBUTE_LABELS } from '@/domain/types'
import { Stars } from '@/components/ui/Stars/Stars'
import { BlurFade } from '@/components/magicui/blur-fade'
import { ShineBorder } from '@/components/magicui/shine-border'
import { NumberTicker } from '@/components/magicui/number-ticker'

interface PlayerProfileStatsProps {
  player: Player
  participationCount: number
}

const attrs: (keyof Pick<Player, 'stars' | 'pass' | 'shot' | 'defense' | 'energy' | 'speed'>)[] = [
  'stars',
  'pass',
  'shot',
  'defense',
  'energy',
  'speed',
]

export function PlayerProfileStats({ player, participationCount }: PlayerProfileStatsProps) {
  return (
    <div className="space-y-8">
      {/* Avatar & Name */}
      <BlurFade delay={0.1}>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {player.avatarUrl ? (
            <div className="relative size-28 shrink-0 rounded-full">
              <img
                src={player.avatarUrl}
                alt=""
                className="size-full rounded-full object-cover"
              />
              <ShineBorder
                className="rounded-full"
                shineColor={['#10b981', '#34d399', '#6ee7b7']}
                borderWidth={3}
                duration={8}
              />
            </div>
          ) : (
            <div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-200)] to-[var(--color-brand-400)] text-4xl font-bold text-white shadow-lg">
              {player.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{player.name}</h2>
            <div className="mt-1">
              <Stars value={player.stars} size="lg" />
            </div>
            <p className="mt-2 text-sm text-[var(--text-tertiary)]">
              Participou de{' '}
              <strong className="text-[var(--color-brand-600)]">
                <NumberTicker value={participationCount} />
              </strong>{' '}
              pelada(s)
            </p>
          </div>
        </div>
      </BlurFade>

      {/* Technical Attributes */}
      <BlurFade delay={0.25}>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Atributos técnicos
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {attrs.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-4 py-3 transition-colors hover:bg-[var(--surface-tertiary)]"
              >
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {ATTRIBUTE_LABELS[key]}
                </span>
                <div className="flex items-center gap-2">
                  <Stars value={player[key]} size="sm" />
                  <span className="w-4 text-right text-xs font-bold text-[var(--text-primary)]">
                    {player[key]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BlurFade>
    </div>
  )
}
