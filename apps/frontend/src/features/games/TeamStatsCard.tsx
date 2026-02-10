import type { TeamAssignment } from '@/domain/types'
import { Card } from '@/components/ui/Card/Card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { cn } from '@/lib/utils'

interface TeamStatsCardProps {
  team: TeamAssignment
  playerNames: Map<string, string>
}

const attrs = [
  { key: 'avgStars' as const, label: 'Estrelas' },
  { key: 'avgPass' as const, label: 'Passe' },
  { key: 'avgShot' as const, label: 'Chute' },
  { key: 'avgDefense' as const, label: 'Defesa' },
  { key: 'avgEnergy' as const, label: 'Energia' },
  { key: 'avgSpeed' as const, label: 'Velocidade' },
] as const

export function TeamStatsCard({ team, playerNames }: TeamStatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)]">
      <Card.Root className="relative overflow-hidden">
        <BorderBeam size={200} duration={8} delay={0} />
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-xs font-bold text-white">
              {team.order}
            </span>
            {team.teamName}
          </Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          {/* Players */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Jogadores ({team.playerIds.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {team.playerIds.map((id) => {
                const name = playerNames.get(id) ?? id
                const is5 = (team.playerIdsWith5Stars ?? []).includes(id)
                const is1 = (team.playerIdsWith1Star ?? []).includes(id)
                return (
                  <span
                    key={id}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                      is5
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                        : is1
                          ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                          : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]',
                    )}
                  >
                    {name}
                    {is5 && <span>5★</span>}
                    {is1 && <span>1★</span>}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Averages */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Médias
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {attrs.map(({ key, label }) => (
                <div
                  key={key}
                  className="rounded-lg bg-[var(--surface-secondary)] p-2 text-center"
                >
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-sm font-bold text-[var(--color-brand-600)]">
                    {team[key].toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  )
}
