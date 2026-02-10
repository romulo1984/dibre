import { Link } from 'react-router-dom'
import type { Player } from '@/domain/types'
import { Stars } from '@/components/ui/Stars/Stars'
import { MagicCard } from '@/components/magicui/magic-card'
import { BlurFade } from '@/components/magicui/blur-fade'

interface PlayerListProps {
  players: Player[]
}

export function PlayerList({ players }: PlayerListProps) {
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

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player, i) => (
        <BlurFade key={player.id} delay={0.05 * i} inView>
          <li>
            <Link to={`/players/${player.id}`} className="block">
              <MagicCard
                className="group p-0 transition-shadow hover:shadow-lg"
                gradientColor="var(--color-brand-50)"
              >
                {/* Header with avatar and name */}
                <div className="flex items-center gap-3 border-b border-[var(--border-primary)] p-4">
                  {player.avatarUrl ? (
                    <img
                      src={player.avatarUrl}
                      alt=""
                      className="size-11 shrink-0 rounded-full object-cover ring-2 ring-[var(--color-brand-200)] ring-offset-2 ring-offset-[var(--surface-primary)]"
                    />
                  ) : (
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-200)] text-lg font-bold text-[var(--color-brand-700)]">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-brand-600)]">
                      {player.name}
                    </h3>
                    <Stars value={player.stars} size="sm" />
                  </div>
                </div>

                {/* Attributes */}
                <div className="grid grid-cols-5 gap-px bg-[var(--border-primary)] text-center text-xs">
                  {[
                    { label: 'PAS', value: player.pass },
                    { label: 'CHU', value: player.shot },
                    { label: 'DEF', value: player.defense },
                    { label: 'ENE', value: player.energy },
                    { label: 'VEL', value: player.speed },
                  ].map((attr) => (
                    <div key={attr.label} className="bg-[var(--surface-primary)] py-3">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                        {attr.label}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold text-[var(--text-primary)]">
                        {attr.value}
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
