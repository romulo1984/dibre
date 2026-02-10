import { Link } from 'react-router-dom'
import type { Player } from '../../domain/types.js'
import { Card } from '../../components/ui/Card/Card.js'
import { Stars } from '../../components/ui/Stars/Stars.js'

interface PlayerListProps {
  players: Player[]
}

export function PlayerList({ players }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        Nenhum jogador cadastrado.
      </p>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <li key={player.id}>
          <Link to={`/players/${player.id}`} className="block transition-opacity hover:opacity-90">
            <Card.Root>
              <Card.Header>
                <Card.Title className="flex items-center gap-3">
                  {player.avatarUrl ? (
                    <img
                      src={player.avatarUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : null}
                  <span className="flex-1 truncate">{player.name}</span>
                  <Stars value={player.stars} size="sm" />
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <dl className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>Passe</span>
                  <span className="text-right">{player.pass}</span>
                  <span>Chute</span>
                  <span className="text-right">{player.shot}</span>
                  <span>Defesa</span>
                  <span className="text-right">{player.defense}</span>
                  <span>Energia</span>
                  <span className="text-right">{player.energy}</span>
                  <span>Velocidade</span>
                  <span className="text-right">{player.speed}</span>
                </dl>
              </Card.Content>
            </Card.Root>
          </Link>
        </li>
      ))}
    </ul>
  )
}
