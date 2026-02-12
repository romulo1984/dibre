import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { GameList } from '@/features/games/GameList'
import { listGames } from '@/services/games.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import type { Game } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'

export function PeladasPage() {
  const getToken = useAuthToken()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getToken()
      .then((token) => {
        if (cancelled || !token) return
        return listGames(token)
      })
      .then((data) => {
        if (!cancelled && data) setGames(data)
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
            <PageHeader.Title>Peladas</PageHeader.Title>
            <PageHeader.Description>
              Crie peladas, selecione jogadores e execute o sorteio equilibrado.
            </PageHeader.Description>
          </div>
          <PageHeader.Actions>
            <Link to="/peladas/new">
              <Button variant="primary">Nova pelada</Button>
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
            <p className="text-sm text-[var(--text-tertiary)]">Carregando peladas...</p>
          </div>
        </div>
      ) : (
        <GameList games={games.filter((g) => !g.deletedAt)} />
      )}
    </div>
  )
}
