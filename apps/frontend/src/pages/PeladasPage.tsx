import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { PageHeader } from '../components/ui/PageHeader/PageHeader.js'
import { Button } from '../components/ui/Button/Button.js'
import { GameList } from '../features/games/GameList.js'
import { listGames } from '../services/games.service.js'
import type { Game } from '../domain/types.js'

export function PeladasPage() {
  const { isSignedIn } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listGames()
      .then((data) => {
        if (!cancelled) setGames(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader.Root>
        <div>
          <PageHeader.Title>Peladas</PageHeader.Title>
          <PageHeader.Description>
            Crie peladas, selecione jogadores e execute o sorteio equilibrado.
          </PageHeader.Description>
        </div>
        {isSignedIn && (
          <PageHeader.Actions>
            <Link to="/peladas/new">
              <Button variant="primary">Nova pelada</Button>
            </Link>
          </PageHeader.Actions>
        )}
      </PageHeader.Root>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
      ) : (
        <GameList games={games} />
      )}
    </div>
  )
}
