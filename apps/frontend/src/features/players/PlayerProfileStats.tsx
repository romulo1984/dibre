import type { Player } from '@/domain/types'
import { Stars } from '@/components/ui/Stars/Stars'
import { BlurFade } from '@/components/magicui/blur-fade'
import { ShineBorder } from '@/components/magicui/shine-border'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { AttributeRadarChart } from '@/features/players/AttributeRadarChart'
import { PlayerAvatar } from '@/features/players/PlayerAvatar'

interface PlayerProfileStatsProps {
  player: Player
  participationCount: number
}

export function PlayerProfileStats({ player, participationCount }: PlayerProfileStatsProps) {
  return (
    <div className="relative">
      {/* Card horizontal: esquerda = avatar + nome + estrelas + participação; direita = radar */}
      <BlurFade delay={0.1}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="relative shrink-0 ring-4 ring-[var(--surface-secondary)] rounded-lg shadow-lg">
              <PlayerAvatar player={player} variant="rect" size="lg" className="rounded-lg" />
              <ShineBorder
                className="rounded-lg"
                shineColor={['#10b981', '#34d399', '#6ee7b7']}
                borderWidth={3}
                duration={8}
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {player.name}
              </h2>
              <div className="mt-2">
                <Stars value={player.stars} size="lg" />
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-secondary)] px-3 py-1.5">
                <span className="text-sm text-[var(--text-tertiary)]">Peladas</span>
                <strong className="text-[var(--color-brand-600)]">
                  <NumberTicker value={participationCount} />
                </strong>
              </div>
            </div>
          </div>
          <div className="shrink-0">
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
