import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthToken } from '@/hooks/useAuthToken'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { TeamStatsCard } from '@/features/games/TeamStatsCard'
import { PlayerRow } from '@/features/players/PlayerRow'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BlurFade } from '@/components/magicui/blur-fade'
import { cn } from '@/lib/utils'
import {
  getGame,
  getGamePlayers,
  getGameTeams,
  setGamePlayers,
  runDraw,
} from '@/services/games.service'
import { listPlayers } from '@/services/players.service'
import type { Game, TeamAssignment, Player } from '@/domain/types'

function formatTeamsForShare(teams: TeamAssignment[], playersMap: Map<string, Player>): string {
  const starsEmoji = (n: number) => '⭐'.repeat(n)
  const lines: string[] = ['⚽ *Sorteio de Times* ⚽', '']
  teams.forEach((team) => {
    lines.push(`🏆 *${team.teamName}* (${team.playerIds.length} jogadores)`)
    lines.push('―'.repeat(20))
    team.playerIds.forEach((id) => {
      const p = playersMap.get(id)
      if (p) {
        lines.push(`  ${p.name} ${starsEmoji(p.stars)}`)
      }
    })
    lines.push(
      `  📊 Médias: PAS ${team.avgPass.toFixed(1)} | CHU ${team.avgShot.toFixed(1)} | DEF ${team.avgDefense.toFixed(1)} | ENE ${team.avgEnergy.toFixed(1)} | VEL ${team.avgSpeed.toFixed(1)}`,
    )
    lines.push('')
  })
  return lines.join('\n')
}

export function PeladaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getToken = useAuthToken()
  const [game, setGame] = useState<Game | null>(null)
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [teams, setTeams] = useState<TeamAssignment[]>([])
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [drawLoading, setDrawLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getToken()
      .then((token) => {
        if (cancelled || !token) return
        return Promise.all([
          getGame(id, token),
          getGamePlayers(id, token),
          getGameTeams(id, token),
          listPlayers(token),
        ])
      })
      .then((result) => {
        if (!cancelled && result) {
          const [g, playersRes, teamsRes, players] = result
          setGame(g)
          setPlayerIds(playersRes.playerIds)
          setTeams(teamsRes.teams)
          setAllPlayers(players)
        }
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

  const playersMap = new Map(allPlayers.map((p) => [p.id, p]))

  const handleSetPlayers = async (selectedIds: string[]) => {
    if (!id) return
    const token = await getToken()
    if (!token) return
    try {
      await setGamePlayers(id, selectedIds, token)
      setPlayerIds(selectedIds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  const handleRunDraw = async () => {
    if (!id) return
    const token = await getToken()
    if (!token) return
    setDrawLoading(true)
    try {
      const res = await runDraw(id, token)
      setTeams(res.teams)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no sorteio')
    } finally {
      setDrawLoading(false)
    }
  }

  if (!id) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <span className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
          <p className="text-sm text-[var(--text-tertiary)]">Carregando pelada...</p>
        </div>
      </div>
    )
  }

  if (error && !game) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <span className="mb-2 text-3xl">😕</span>
        <p className="font-medium text-red-700 dark:text-red-400">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/peladas')}>
          Voltar
        </Button>
      </div>
    )
  }

  if (!game) return null

  return (
    <div className="space-y-8">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>{game.name}</PageHeader.Title>
            <PageHeader.Description>
              {game.numberOfTeams} time(s) · {playerIds.length} jogador(es) selecionado(s)
            </PageHeader.Description>
          </div>
          <PageHeader.Actions>
              <ShimmerButton
                className="h-9 px-3 text-xs font-semibold shadow-lg disabled:opacity-50 sm:h-10 sm:px-5 sm:text-sm"
                disabled={playerIds.length < game.numberOfTeams || drawLoading}
                onClick={handleRunDraw}
              >
                {drawLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sorteando...
                  </span>
                ) : (
                  '🎲 Sortear'
                )}
              </ShimmerButton>
          </PageHeader.Actions>
        </PageHeader.Root>
      </BlurFade>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Seleção de jogadores */}
      <BlurFade delay={0.2}>
        <Card.Root>
          <Card.Header>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <Card.Title>Selecionar jogadores</Card.Title>
              <span className="text-xs font-medium text-[var(--text-tertiary)] sm:text-sm">
                {playerIds.length} de {allPlayers.length} selecionado(s)
              </span>
            </div>
          </Card.Header>
          <Card.Content>
            <PeladaPlayerSelect
              allPlayers={allPlayers}
              selectedIds={playerIds}
              onChange={handleSetPlayers}
            />
          </Card.Content>
        </Card.Root>
      </BlurFade>

      {/* Teams & Stats */}
      {teams.length > 0 && (
        <section>
          <BlurFade delay={0.3}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Times e estatísticas
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = formatTeamsForShare(teams, playersMap)
                      navigator.clipboard.writeText(text).then(() => {
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      })
                    }}
                  >
                    {copied ? '✅ Copiado!' : '📋 Copiar'}
                  </Button>
                  {copied && (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--surface-inverse)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)] shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-200">
                      Times copiados!
                    </span>
                  )}
                </div>
                {typeof navigator.share === 'function' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = formatTeamsForShare(teams, playersMap)
                      navigator.share({ text }).catch(() => {})
                    }}
                  >
                    📤 Compartilhar
                  </Button>
                )}
              </div>
            </div>
          </BlurFade>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, i) => (
              <BlurFade key={team.teamName} delay={0.35 + i * 0.08}>
                <TeamStatsCard team={team} playersMap={playersMap} />
              </BlurFade>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ── Internal: Player checkbox selector (lista vertical, avatar, selecionar todos) ── */

function PeladaPlayerSelect({
  allPlayers,
  selectedIds,
  onChange,
}: {
  allPlayers: Player[]
  selectedIds: string[]
  onChange: (ids: string[]) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const allSelected = allPlayers.length > 0 && selectedIds.length === allPlayers.length

  const toggle = (playerId: string) => {
    const next = selectedIds.includes(playerId)
      ? selectedIds.filter((pid) => pid !== playerId)
      : [...selectedIds, playerId]
    setSaving(true)
    onChange(next).finally(() => setSaving(false))
  }

  const selectAll = () => {
    const next = allPlayers.map((p) => p.id)
    setSaving(true)
    onChange(next).finally(() => setSaving(false))
  }

  const deselectAll = () => {
    setSaving(true)
    onChange([]).finally(() => setSaving(false))
  }

  return (
    <div className="space-y-3">
      {allPlayers.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={allSelected ? deselectAll : selectAll}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              allSelected
                ? 'border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]'
                : 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)]',
              saving && 'opacity-60',
            )}
          >
            {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
        </div>
      )}
      <ul className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto rounded-lg border border-[var(--border-primary)] p-1 sm:max-h-[320px] sm:p-1.5">
        {allPlayers.map((p) => {
          const isSelected = selectedIds.includes(p.id)
          return (
            <li key={p.id}>
              <button
                type="button"
                disabled={saving}
                onClick={() => toggle(p.id)}
                className={cn(
                  'w-full cursor-pointer rounded-lg text-left transition-colors',
                  isSelected
                    ? 'bg-[var(--color-brand-50)] hover:bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)]'
                    : 'hover:bg-[var(--surface-tertiary)]',
                  saving && 'opacity-60',
                )}
              >
                <PlayerRow player={p}>
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded border text-xs font-medium',
                      isSelected
                        ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white'
                        : 'border-[var(--border-primary)] bg-[var(--surface-primary)]',
                    )}
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                </PlayerRow>
              </button>
            </li>
          )
        })}
      </ul>
      {allPlayers.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)]">
          Nenhum jogador cadastrado.{' '}
          <Link to="/players/new" className="text-[var(--color-brand-600)] underline">
            Cadastre jogadores
          </Link>{' '}
          primeiro.
        </p>
      )}
    </div>
  )
}
