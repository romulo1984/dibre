import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '@/hooks/useAuthToken'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Card } from '@/components/ui/Card/Card'
import { PlayerForm } from '@/features/players/PlayerForm'
import { createPlayer } from '@/services/players.service'
import { BlurFade } from '@/components/magicui/blur-fade'

export function PlayerNewPage() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const getToken = useAuthToken()

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-900/20">
        <span className="mb-2 text-3xl">🔒</span>
        <p className="font-medium text-amber-800 dark:text-amber-200">
          Faça login como admin para cadastrar jogadores.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>Novo jogador</PageHeader.Title>
            <PageHeader.Description>
              Cadastre um jogador com estrelas e atributos (1 a 5).
            </PageHeader.Description>
          </div>
        </PageHeader.Root>
      </BlurFade>
      <BlurFade delay={0.2}>
        <Card.Root>
          <Card.Content className="p-6 sm:p-8">
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
      </BlurFade>
    </div>
  )
}
