import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { PlayerList } from '@/features/players/PlayerList'
import type { PlayerListViewMode } from '@/features/players/PlayerList'
import { listPlayers } from '@/services/players.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import type { Player } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'
import { cn } from '@/lib/utils'

export function PlayersPage() {
  const getToken = useAuthToken()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<PlayerListViewMode>('cards')

  useEffect(() => {
    let cancelled = false
    getToken()
      .then((token) => {
        if (cancelled || !token) return
        return listPlayers(token)
      })
      .then((data) => {
        if (!cancelled && data) setPlayers(data)
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
  }, [getToken])

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>Jogadores</PageHeader.Title>
            <PageHeader.Description>
              {players.length > 0
                ? `${players.length} jogador(es) cadastrado(s). Clique para ver o perfil.`
                : 'Lista de jogadores com estrelas e atributos. Clique para ver o perfil.'}
            </PageHeader.Description>
          </div>
          <PageHeader.Actions>
            {/* View mode toggle */}
            {players.length > 0 && (
              <div className="flex rounded-lg border border-[var(--border-primary)] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm',
                    viewMode === 'cards'
                      ? 'bg-[var(--color-brand-500)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )}
                  aria-label="Visualizar como cards"
                  title="Cards"
                >
                  ▦
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm',
                    viewMode === 'list'
                      ? 'bg-[var(--color-brand-500)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  )}
                  aria-label="Visualizar como lista"
                  title="Lista"
                >
                  ☰
                </button>
              </div>
            )}
            <Link to="/players/new">
              <Button variant="primary">Novo jogador</Button>
            </Link>
          </PageHeader.Actions>
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
        <PlayerList players={players} viewMode={viewMode} />
      )}
    </div>
  )
}
