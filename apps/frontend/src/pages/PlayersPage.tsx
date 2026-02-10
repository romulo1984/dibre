import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { PlayerList } from '@/features/players/PlayerList'
import { listPlayers } from '@/services/players.service'
import type { Player } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'

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
      <BlurFade delay={0.1}>
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
      </BlurFade>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <span className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
            <p className="text-sm text-[var(--text-tertiary)]">Carregando jogadores...</p>
          </div>
        </div>
      ) : (
        <PlayerList players={players} />
      )}
    </div>
  )
}
