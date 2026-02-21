import type { TeamAssignment, Player } from '@/domain/types'
import { Card } from '@/components/ui/Card/Card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { AttributeRadarChart } from '@/features/players/AttributeRadarChart'
import { PlayerRow } from '@/features/players/PlayerRow'
import { getVestColor } from '@/domain/vestColors'
import { cn } from '@/lib/utils'

interface TeamStatsCardProps {
  team: TeamAssignment
  playersMap: Map<string, Player>
  vestColorKey?: string
}

export function TeamStatsCard({ team, playersMap, vestColorKey }: TeamStatsCardProps) {
  const vestColor = vestColorKey ? getVestColor(vestColorKey) : null

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)]">
      <Card.Root className="relative overflow-hidden">
        <BorderBeam size={200} duration={8} delay={0} />
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-lg text-xs font-bold',
                !vestColor &&
                  'bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white'
              )}
              style={
                vestColor ? { backgroundColor: vestColor.hex, color: vestColor.textHex } : undefined
              }
            >
              {team.order}
            </span>
            <span className="flex-1">{team.teamName}</span>
            {vestColor && (
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: vestColor.hex, color: vestColor.textHex }}
              >
                {vestColor.label}
              </span>
            )}
          </Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
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
                const isDeleted = !!player.deletedAt
                return (
                  <li key={id}>
                    <div className={cn('group relative', isDeleted && 'opacity-50')}>
                      <PlayerRow
                        player={player}
                        showAttributesOnHover={!isDeleted}
                        playerWithAttrs={player}
                      >
                        <>
                          {(is5 || is1) && (
                            <span
                              className={cn(
                                'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                                is5 &&
                                  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
                                is1 &&
                                  'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                              )}
                            >
                              {is5 ? '5\u2605' : '1\u2605'}
                            </span>
                          )}
                        </>
                      </PlayerRow>
                      {isDeleted && (
                        <span className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          Jogador excluído
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
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
