import type { TeamAssignment } from '../../domain/types.js'
import { Card } from '../../components/ui/Card/Card.js'

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
    <Card.Root>
      <Card.Header>
        <Card.Title>{team.teamName}</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Jogadores
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {team.playerIds.map((id) => {
              const name = playerNames.get(id) ?? id
              const is5 = (team.playerIdsWith5Stars ?? []).includes(id)
              const is1 = (team.playerIdsWith1Star ?? []).includes(id)
              return (
                <li key={id} className="flex items-center gap-2">
                  <span>{name}</span>
                  {is5 && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      5★
                    </span>
                  )}
                  {is1 && (
                    <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                      1★
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Médias
          </h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {attrs.map(({ key, label }) => (
              <div key={key} className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
                <span className="font-medium">{team[key].toFixed(2)}</span>
              </div>
            ))}
          </dl>
        </div>
      </Card.Content>
    </Card.Root>
  )
}
