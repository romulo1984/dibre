import type { Player } from '@/domain/types'
import { Stars } from '@/components/ui/Stars/Stars'
import { BlurFade } from '@/components/magicui/blur-fade'
import { ShineBorder } from '@/components/magicui/shine-border'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { AttributeRadarChart } from '@/features/players/AttributeRadarChart'

interface PlayerProfileStatsProps {
  player: Player
  participationCount: number
}

export function PlayerProfileStats({ player, participationCount }: PlayerProfileStatsProps) {
  return (
    <div className="space-y-6">
      {/* Card horizontal: esquerda = avatar + nome + estrelas + participação; direita = radar */}
      <BlurFade delay={0.1}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
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
          <div className="shrink-0">
            <h3 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] lg:text-left">
              Atributos técnicos
            </h3>
            <AttributeRadarChart
              attributes={{
                pass: player.pass,
                shot: player.shot,
                defense: player.defense,
                energy: player.energy,
                speed: player.speed,
              }}
              size={260}
            />
          </div>
        </div>
      </BlurFade>
    </div>
  )
}
