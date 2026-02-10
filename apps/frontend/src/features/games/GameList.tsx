import { Link } from 'react-router-dom'
import type { Game } from '@/domain/types'
import { MagicCard } from '@/components/magicui/magic-card'
import { BlurFade } from '@/components/magicui/blur-fade'

interface GameListProps {
  games: Game[]
}

export function GameList({ games }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-secondary)] bg-[var(--surface-tertiary)] px-6 py-16 text-center">
        <span className="mb-3 text-4xl">⚽</span>
        <p className="font-medium text-[var(--text-secondary)]">Nenhuma pelada criada.</p>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Clique em "Nova pelada" para começar.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game, i) => (
        <BlurFade key={game.id} delay={0.05 * i} inView>
          <li>
            <Link to={`/peladas/${game.id}`} className="block">
              <MagicCard
                className="group p-6 transition-shadow hover:shadow-lg"
                gradientColor="var(--color-brand-50)"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-brand-600)]">
                      {game.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                      {game.numberOfTeams} time(s)
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-brand-50)] text-lg">
                    🏆
                  </div>
                </div>
              </MagicCard>
            </Link>
          </li>
        </BlurFade>
      ))}
    </ul>
  )
}
