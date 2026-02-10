import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '@/hooks/useAuthToken'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Card } from '@/components/ui/Card/Card'
import { Button } from '@/components/ui/Button/Button'
import { PlayerForm } from '@/features/players/PlayerForm'
import { getPlayer, updatePlayer } from '@/services/players.service'
import { BlurFade } from '@/components/magicui/blur-fade'

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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-900/20">
        <span className="mb-2 text-3xl">🔒</span>
        <p className="font-medium text-amber-800 dark:text-amber-200">
          Faça login como admin para editar jogadores.
        </p>
      </div>
    )
  }

  if (!id) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
          <p className="text-sm text-[var(--text-tertiary)]">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!initial) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <span className="mb-2 text-3xl">😕</span>
        <p className="font-medium text-red-700 dark:text-red-400">Jogador não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
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
      </BlurFade>
      <BlurFade delay={0.2}>
        <Card.Root>
          <Card.Content className="p-6 sm:p-8">
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
      </BlurFade>
    </div>
  )
}
