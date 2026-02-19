import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { PlayerProfileStats } from '@/features/players/PlayerProfileStats'
import { PlayerParticipatedGames } from '@/features/players/PlayerParticipatedGames'
import { PlayerTopTeammates } from '@/features/players/PlayerTopTeammates'
import { PlayerExportCard } from '@/features/players/PlayerExportCard'
import { getPlayer, deletePlayer } from '@/services/players.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import type { PlayerProfileResponse } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getToken = useAuthToken()
  const [data, setData] = useState<PlayerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showExportCard, setShowExportCard] = useState(false)

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

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      const token = await getToken()
      if (!token) return
      await deletePlayer(id, token)
      navigate('/players')
    } catch {
      setError('Erro ao excluir jogador')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (!id) return null

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="size-10 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
          <p className="text-sm text-[var(--text-tertiary)]">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-800 dark:bg-red-900/20">
        <span className="mb-3 text-4xl">😕</span>
        <p className="font-medium text-red-700 dark:text-red-400">
          {error ?? 'Jogador não encontrado'}
        </p>
        <Button variant="outline" className="mt-5" onClick={() => navigate('/players')}>
          Voltar aos jogadores
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <BlurFade delay={0.05}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>{data.player.name}</PageHeader.Title>
            <PageHeader.Description>
              Perfil, estatísticas e histórico de peladas
            </PageHeader.Description>
          </div>
          <PageHeader.Actions>
            <Link to={`/players/${id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => setShowDeleteDialog(true)}
            >
              Excluir
            </Button>
          </PageHeader.Actions>
        </PageHeader.Root>
      </BlurFade>

      {/* Hero: perfil + radar */}
      <BlurFade delay={0.1}>
        <Card.Root className="overflow-hidden">
          <Card.Content className="p-6 sm:p-8">
            <PlayerProfileStats
              player={data.player}
              participationCount={data.participationCount}
              onExportCard={() => setShowExportCard(true)}
            />
          </Card.Content>
        </Card.Root>
      </BlurFade>

      {/* Grid: Peladas + Top 5 parceiros */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card.Root>
          <Card.Content className="p-6">
            <PlayerParticipatedGames games={data.games} />
          </Card.Content>
        </Card.Root>
        <Card.Root>
          <Card.Content className="p-6">
            <PlayerTopTeammates teammates={data.teammates} />
          </Card.Content>
        </Card.Root>
      </div>

      {/* Modal do Card de Exportação */}
      <PlayerExportCard
        player={data.player}
        participationCount={data.participationCount}
        open={showExportCard}
        onClose={() => setShowExportCard(false)}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir jogador"
        description={`Tem certeza que deseja excluir "${data.player.name}"? O jogador será removido das listagens, mas continuará aparecendo nas estatísticas históricas.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}
