import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '../hooks/useAuthToken.js'
import { PageHeader } from '../components/ui/PageHeader/PageHeader.js'
import { Card } from '../components/ui/Card/Card.js'
import { Button } from '../components/ui/Button/Button.js'
import { PlayerForm } from '../features/players/PlayerForm.js'
import { getPlayer, updatePlayer } from '../services/players.service.js'

export function PlayerEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const getToken = useAuthToken()
  const [initial, setInitial] = useState<{
    id: string
    name: string
    avatarUrl?: string | null
    stars: number
    pass: number
    shot: number
    defense: number
    energy: number
    speed: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getPlayer(id)
      .then((d) => {
        if (!cancelled) setInitial(d.player)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!isSignedIn) {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        Faça login como admin para editar jogadores.
      </div>
    )
  }

  if (!id) return null
  if (loading) return <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
  if (!initial) return <p className="text-red-600">Jogador não encontrado</p>

  return (
    <div className="space-y-6">
      <PageHeader.Root>
        <div>
          <PageHeader.Title>Editar jogador</PageHeader.Title>
          <PageHeader.Description>Atualize estrelas e atributos.</PageHeader.Description>
        </div>
        <PageHeader.Actions>
          <Link to={`/players/${id}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
        </PageHeader.Actions>
      </PageHeader.Root>
      <Card.Root>
        <Card.Content>
          <PlayerForm
            initial={initial}
            onSubmit={async (formData) => {
              const token = await getToken()
              if (!token) throw new Error('Não autenticado')
              await updatePlayer(id, formData, token)
              navigate(`/players/${id}`)
            }}
            onCancel={() => navigate(`/players/${id}`)}
          />
        </Card.Content>
      </Card.Root>
    </div>
  )
}
