import type { Player } from '../../domain/types.js'
import { ATTRIBUTE_LABELS } from '../../domain/types.js'
import { Stars } from '../../components/ui/Stars/Stars.js'

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
    <div className="space-y-6">
      {player.avatarUrl && (
        <section>
          <img
            src={player.avatarUrl}
            alt=""
            className="h-24 w-24 rounded-full object-cover"
          />
        </section>
      )}
      <section>
        <h3 className="mb-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Nível geral
        </h3>
        <Stars value={player.stars} size="md" />
      </section>
      <section>
        <h3 className="mb-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Atributos técnicos
        </h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          {attrs.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <dt className="text-sm text-neutral-600 dark:text-neutral-400">
                {ATTRIBUTE_LABELS[key]}
              </dt>
              <dd>
                <Stars value={player[key]} size="sm" />
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Participou de{' '}
          <strong className="text-neutral-900 dark:text-white">{participationCount}</strong>{' '}
          pelada(s) / sorteio(s).
        </p>
      </section>
    </div>
  )
}
