import { Link } from 'react-router-dom'
import type { Player } from '@/domain/types'
import { Stars } from '@/components/ui/Stars/Stars'
import { MagicCard } from '@/components/magicui/magic-card'
import { BlurFade } from '@/components/magicui/blur-fade'
import { PlayerAvatar } from '@/features/players/PlayerAvatar'

export type PlayerListViewMode = 'cards' | 'list'

interface PlayerListProps {
  players: Player[]
  viewMode?: PlayerListViewMode
}

const ATTR_KEYS = [
  { label: 'PAS', key: 'pass' as const },
  { label: 'CHU', key: 'shot' as const },
  { label: 'DEF', key: 'defense' as const },
  { label: 'ENE', key: 'energy' as const },
  { label: 'VEL', key: 'speed' as const },
]

export function PlayerList({ players, viewMode = 'cards' }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-secondary)] bg-[var(--surface-tertiary)] px-6 py-16 text-center">
        <span className="mb-3 text-4xl">👥</span>
        <p className="font-medium text-[var(--text-secondary)]">Nenhum jogador cadastrado.</p>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Clique em "Novo jogador" para começar.
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--border-primary)]">
        {/* Header da tabela — oculto em mobile */}
        <div className="hidden border-b border-[var(--border-primary)] bg-[var(--surface-secondary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] sm:grid sm:grid-cols-[1fr_auto_repeat(5,3rem)]  sm:items-center sm:gap-3">
          <span>Jogador</span>
          <span className="w-20 text-center">Estrelas</span>
          {ATTR_KEYS.map((a) => (
            <span key={a.key} className="text-center">{a.label}</span>
          ))}
        </div>

        <ul className="divide-y divide-[var(--border-primary)]">
          {players.map((player, i) => (
            <BlurFade key={player.id} delay={0.03 * i} inView>
              <li>
                <Link
                  to={`/players/${player.id}`}
                  className="group flex flex-col gap-2 px-3 py-3 transition-colors hover:bg-[var(--surface-tertiary)] sm:grid sm:grid-cols-[1fr_auto_repeat(5,3rem)] sm:items-center sm:gap-3 sm:px-4"
                >
                  {/* Jogador + avatar */}
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      player={player}
                      size="sm"
                      hoverZoom
                      className="ring-1 ring-[var(--color-brand-200)] ring-offset-1 ring-offset-[var(--surface-primary)]"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-brand-600)]">
                      {player.name}
                    </span>
                  </div>

                  {/* Estrelas */}
                  <div className="flex items-center sm:w-20 sm:justify-center">
                    <Stars value={player.stars} size="sm" />
                  </div>

                  {/* Atributos — inline em mobile */}
                  <div className="flex items-center gap-2 sm:contents">
                    {ATTR_KEYS.map((attr) => (
                      <div key={attr.key} className="flex items-center gap-1 sm:justify-center">
                        <span className="text-[10px] font-medium uppercase text-[var(--text-tertiary)] sm:hidden">
                          {attr.label}
                        </span>
                        <span className="text-xs font-bold text-[var(--text-primary)] sm:text-sm">
                          {player[attr.key]}
                        </span>
                      </div>
                    ))}
                  </div>
                </Link>
              </li>
            </BlurFade>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <ul className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player, i) => (
        <BlurFade key={player.id} delay={0.05 * i} inView>
          <li>
            <Link to={`/players/${player.id}`} className="block">
              <MagicCard
                className="group p-0 transition-shadow hover:shadow-lg"
                gradientColor="var(--color-brand-50)"
              >
                {/* Header with avatar and name */}
                <div className="flex items-center gap-3 border-b border-[var(--border-primary)] p-3 sm:p-4">
                  <PlayerAvatar
                    player={player}
                    size="md"
                    hoverZoom
                    className="ring-2 ring-[var(--color-brand-200)] ring-offset-2 ring-offset-[var(--surface-primary)]"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-brand-600)] sm:text-base">
                      {player.name}
                    </h3>
                    <Stars value={player.stars} size="sm" />
                  </div>
                </div>

                {/* Attributes */}
                <div className="grid grid-cols-5 gap-px bg-[var(--border-primary)] text-center text-xs">
                  {ATTR_KEYS.map((attr) => (
                    <div key={attr.key} className="bg-[var(--surface-primary)] py-2.5 sm:py-3">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                        {attr.label}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold text-[var(--text-primary)]">
                        {player[attr.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </MagicCard>
            </Link>
          </li>
        </BlurFade>
      ))}
    </ul>
  )
}
