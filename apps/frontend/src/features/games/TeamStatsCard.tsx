import type { TeamAssignment, Player } from '@/domain/types'
import { Card } from '@/components/ui/Card/Card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { AttributeRadarChart } from '@/features/players/AttributeRadarChart'
import { PlayerRow } from '@/features/players/PlayerRow'
import { cn } from '@/lib/utils'

interface TeamStatsCardProps {
  team: TeamAssignment
  /** Mapa id -> jogador (para avatar e popover de atributos) */
  playersMap: Map<string, Player>
}

export function TeamStatsCard({ team, playersMap }: TeamStatsCardProps) {
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
          {/* Players — lista vertical com avatar e popover ao passar o mouse */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Jogadores ({team.playerIds.length})
            </h4>
            <ul className="flex flex-col gap-0.5">
              {team.playerIds.map((id) => {
                const player = playersMap.get(id)
                const is5 = (team.playerIdsWith5Stars ?? []).includes(id)
                const is1 = (team.playerIdsWith1Star ?? []).includes(id)
                if (!player) {
                  return (
                    <li key={id} className="py-1.5 text-xs text-[var(--text-tertiary)]">
                      {id}
                    </li>
                  )
                }
                return (
                  <li key={id}>
                    <PlayerRow
                      player={player}
                      showAttributesOnHover
                      playerWithAttrs={player}
                      children={
                        (is5 || is1) && (
                          <span
                            className={cn(
                              'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                              is5 && 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
                              is1 && 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
                            )}
                          >
                            {is5 ? '5★' : '1★'}
                          </span>
                        )
                      }
                    />
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Médias dos atributos técnicos — radar (suporta decimais) */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Médias dos atributos
            </h4>
            <AttributeRadarChart
              attributes={{
                pass: team.avgPass,
                shot: team.avgShot,
                defense: team.avgDefense,
                energy: team.avgEnergy,
                speed: team.avgSpeed,
              }}
              size={200}
              min={1}
              max={5}
              ariaLabel={`Médias do time ${team.teamName}`}
              className="mx-auto"
            />
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  )
}
