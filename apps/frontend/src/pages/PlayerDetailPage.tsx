import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { PageHeader } from '../components/ui/PageHeader/PageHeader.js'
import { Button } from '../components/ui/Button/Button.js'
import { Card } from '../components/ui/Card/Card.js'
import { PlayerProfileStats } from '../features/players/PlayerProfileStats.js'
import { getPlayer } from '../services/players.service.js'
import type { PlayerWithParticipation } from '../domain/types.js'

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const [data, setData] = useState<PlayerWithParticipation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getPlayer(id)
      .then((d) => {
        if (!cancelled) setData(d)
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
  }, [id])

  if (!id) return null
  if (loading) return <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error ?? 'Jogador não encontrado'}
        <Button variant="outline" className="mt-4" onClick={() => navigate('/players')}>
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader.Root>
        <div>
          <PageHeader.Title>{data.player.name}</PageHeader.Title>
          <PageHeader.Description>Perfil e estatísticas do jogador</PageHeader.Description>
        </div>
        {isSignedIn && (
          <PageHeader.Actions>
            <Link to={`/players/${id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
          </PageHeader.Actions>
        )}
      </PageHeader.Root>
      <Card.Root>
        <Card.Content>
          <PlayerProfileStats player={data.player} participationCount={data.participationCount} />
        </Card.Content>
      </Card.Root>
    </div>
  )
}
