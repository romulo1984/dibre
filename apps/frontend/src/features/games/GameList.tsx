import { Link } from 'react-router-dom'
import type { Game } from '../../domain/types.js'
import { Card } from '../../components/ui/Card/Card.js'

interface GameListProps {
  games: Game[]
}

export function GameList({ games }: GameListProps) {
  if (games.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        Nenhuma pelada criada.
      </p>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <li key={game.id}>
          <Link to={`/peladas/${game.id}`} className="block transition-opacity hover:opacity-90">
            <Card.Root>
              <Card.Header>
                <Card.Title>{game.name}</Card.Title>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {game.numberOfTeams} time(s)
                </p>
              </Card.Content>
            </Card.Root>
          </Link>
        </li>
      ))}
    </ul>
  )
}
