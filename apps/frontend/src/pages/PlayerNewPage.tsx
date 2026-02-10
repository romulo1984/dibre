import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '../hooks/useAuthToken.js'
import { PageHeader } from '../components/ui/PageHeader/PageHeader.js'
import { Card } from '../components/ui/Card/Card.js'
import { PlayerForm } from '../features/players/PlayerForm.js'
import { createPlayer } from '../services/players.service.js'

export function PlayerNewPage() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const getToken = useAuthToken()

  if (!isSignedIn) {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        Faça login como admin para cadastrar jogadores.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader.Root>
        <div>
          <PageHeader.Title>Novo jogador</PageHeader.Title>
          <PageHeader.Description>
            Cadastre um jogador com estrelas e atributos (1 a 5).
          </PageHeader.Description>
        </div>
      </PageHeader.Root>
      <Card.Root>
        <Card.Content>
          <PlayerForm
            onSubmit={async (formData) => {
              const token = await getToken()
              if (!token) throw new Error('Não autenticado')
              const player = await createPlayer(formData, token)
              navigate(`/players/${player.id}`)
            }}
            onCancel={() => navigate('/players')}
          />
        </Card.Content>
      </Card.Root>
    </div>
  )
}
