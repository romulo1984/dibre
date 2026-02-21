import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { PlayerList } from '@/features/players/PlayerList'
import type { PlayerListViewMode } from '@/features/players/PlayerList'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle/ViewModeToggle'
import { listPlayers } from '@/services/players.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import type { Player } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'

function starsString(count: number): string {
  return '⭐'.repeat(count)
}

function formatPlayersForShare(players: Player[]): string {
  const lines: string[] = []
  lines.push('⚽ Lista de Jogadores — dib.re')
  lines.push(`📋 ${players.length} jogador(es)`)
  lines.push('')

  players.forEach((p) => {
    const stars = starsString(p.stars)
    const attrs = `PAS ${p.pass} | CHU ${p.shot} | DEF ${p.defense} | ENG ${p.energy} | VEL ${p.speed}`
    lines.push(`*${p.name}* ${stars}`)
    lines.push(`${attrs}`)
  })

  lines.push('')
  lines.push('Gerado por dib.re — Sorteio equilibrado de times')
  return lines.join('\n')
}

export function PlayersPage() {
  const getToken = useAuthToken()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<PlayerListViewMode>('list')
  const [copied, setCopied] = useState(false)

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

  const activePlayers = players.filter((p) => !p.deletedAt)

  const handleCopyList = useCallback(() => {
    const text = formatPlayersForShare(activePlayers)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [activePlayers])

  const handleShareList = useCallback(() => {
    const text = formatPlayersForShare(activePlayers)
    navigator.share({ text }).catch(() => {})
  }, [activePlayers])

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>Jogadores</PageHeader.Title>
            <PageHeader.Description>
              {activePlayers.length > 0
                ? `${activePlayers.length} jogador(es) cadastrado(s). Clique para ver o perfil.`
                : 'Lista de jogadores com estrelas e atributos. Clique para ver o perfil.'}
            </PageHeader.Description>
          </div>
          <PageHeader.Actions>
            {activePlayers.length > 0 && (
              <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
            )}
            <Link to="/players/import-export">
              <Button variant="outline" size="sm">📦 Importar / Exportar</Button>
            </Link>
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
        <>
          <PlayerList players={activePlayers} viewMode={viewMode} />

          {/* Compartilhar lista */}
          {activePlayers.length > 0 && (
            <BlurFade delay={0.2}>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-3">
                <span className="mr-1 text-sm font-medium text-[var(--text-secondary)]">
                  📋 Compartilhar lista
                </span>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyList}
                  >
                    {copied ? '✅ Copiado!' : '📋 Copiar'}
                  </Button>
                  {copied && (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--surface-inverse)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)] shadow-lg">
                      Lista copiada!
                    </span>
                  )}
                </div>
                {typeof navigator.share === 'function' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareList}
                  >
                    📤 Compartilhar
                  </Button>
                )}
              </div>
            </BlurFade>
          )}
        </>
      )}
    </div>
  )
}
