import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { PlayerProfileStats } from '@/features/players/PlayerProfileStats'
import { getPlayer } from '@/services/players.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import type { PlayerWithParticipation } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getToken = useAuthToken()
  const [data, setData] = useState<PlayerWithParticipation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getToken()
      .then((token) => {
        if (cancelled || !token) return
        return getPlayer(id, token)
      })
      .then((d) => {
        if (!cancelled && d) setData(d)
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
  }, [id, getToken])

  if (!id) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
          <p className="text-sm text-[var(--text-tertiary)]">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <span className="mb-2 text-3xl">😕</span>
        <p className="font-medium text-red-700 dark:text-red-400">
          {error ?? 'Jogador não encontrado'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/players')}>
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>{data.player.name}</PageHeader.Title>
            <PageHeader.Description>Perfil e estatísticas do jogador</PageHeader.Description>
          </div>
        <PageHeader.Actions>
          <Link to={`/players/${id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>
        </PageHeader.Actions>
        </PageHeader.Root>
      </BlurFade>
      <Card.Root>
        <Card.Content className="p-6 sm:p-8">
          <PlayerProfileStats player={data.player} participationCount={data.participationCount} />
        </Card.Content>
      </Card.Root>
    </div>
  )
}
