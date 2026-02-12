import type { Player } from '@/domain/types'
import { Stars } from '@/components/ui/Stars/Stars'
import { BlurFade } from '@/components/magicui/blur-fade'
import { ShineBorder } from '@/components/magicui/shine-border'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { AttributeRadarChart } from '@/features/players/AttributeRadarChart'
import { PlayerAvatar } from '@/features/players/PlayerAvatar'
import { cn } from '@/lib/utils'

interface PlayerProfileStatsProps {
  player: Player
  participationCount: number
  onExportCard?: () => void
}

const ATTR_BARS = [
  { key: 'pass' as const, label: 'Passe', abbr: 'PAS' },
  { key: 'shot' as const, label: 'Chute', abbr: 'CHU' },
  { key: 'defense' as const, label: 'Defesa', abbr: 'DEF' },
  { key: 'energy' as const, label: 'Energia', abbr: 'ENG' },
  { key: 'speed' as const, label: 'Velocidade', abbr: 'VEL' },
]

function attrBarColor(value: number): string {
  if (value >= 4) return 'bg-emerald-500'
  if (value >= 3) return 'bg-amber-400'
  return 'bg-red-400'
}

export function PlayerProfileStats({ player, participationCount, onExportCard }: PlayerProfileStatsProps) {
  const avg = (player.pass + player.shot + player.defense + player.energy + player.speed) / 5

  return (
    <BlurFade delay={0.1}>
      <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-0">
        {/* ── Lado esquerdo: avatar + info + barras ── */}
        <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:gap-6 md:pr-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div className="relative shrink-0 ring-4 ring-[var(--surface-secondary)] rounded-lg shadow-lg">
              <PlayerAvatar player={player} variant="rect" size="lg" className="rounded-lg" />
              <ShineBorder
                className="rounded-lg"
                shineColor={['#10b981', '#34d399', '#6ee7b7']}
                borderWidth={3}
                duration={8}
              />
            </div>
            {/* Overall badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] px-3 py-1 shadow-sm">
              <span className="text-xs font-medium text-white/80">Overall</span>
              <strong className="text-sm font-black text-white">{avg.toFixed(1)}</strong>
            </div>
          </div>

          {/* Info + Barras de atributos */}
          <div className="flex flex-1 flex-col justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {player.name}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Stars value={player.stars} size="lg" />
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-secondary)] px-3 py-1">
                  <span className="text-xs text-[var(--text-tertiary)]">Peladas</span>
                  <strong className="text-sm font-bold text-[var(--color-brand-600)]">
                    <NumberTicker value={participationCount} />
                  </strong>
                </div>
              </div>
            </div>

            {/* Barras de atributos */}
            <div className="mt-4 space-y-2">
              {ATTR_BARS.map(({ key, abbr }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-8 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    {abbr}
                  </span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-tertiary)]">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
                        attrBarColor(player[key]),
                      )}
                      style={{ width: `${((player[key] - 1) / 4) * 100}%` }}
                    />
                  </div>
                  <span className="w-5 text-right text-xs font-bold text-[var(--text-primary)]">
                    {player[key]}
                  </span>
                </div>
              ))}
            </div>

            {/* Botão exportar card — abaixo das barras */}
            {onExportCard && (
              <button
                type="button"
                onClick={onExportCard}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-all hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-600)] sm:w-auto sm:self-start dark:hover:bg-[var(--color-brand-900)]/20"
              >
                🎴 Exportar Card do Jogador
              </button>
            )}
          </div>
        </div>

        {/* ── Separador vertical ── */}
        <div className="hidden w-px bg-[var(--border-primary)] md:block" />
        <div className="h-px bg-[var(--border-primary)] md:hidden" />

        {/* ── Lado direito: Radar ── */}
        <div className="flex items-center justify-center md:pl-6" style={{ minWidth: 240 }}>
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
  )
}
