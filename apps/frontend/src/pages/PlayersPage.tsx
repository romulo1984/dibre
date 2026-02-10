import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { PageHeader } from '../components/ui/PageHeader/PageHeader.js'
import { Button } from '../components/ui/Button/Button.js'
import { PlayerList } from '../features/players/PlayerList.js'
import { listPlayers } from '../services/players.service.js'
import type { Player } from '../domain/types.js'

export function PlayersPage() {
  const { isSignedIn } = useAuth()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listPlayers()
      .then((data) => {
        if (!cancelled) setPlayers(data)
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
          <PageHeader.Title>Jogadores</PageHeader.Title>
          <PageHeader.Description>
            Lista de jogadores com estrelas e atributos. Clique para ver o perfil.
          </PageHeader.Description>
        </div>
        {isSignedIn && (
          <PageHeader.Actions>
            <Link to="/players/new">
              <Button variant="primary">Novo jogador</Button>
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
        <PlayerList players={players} />
      )}
    </div>
  )
}
