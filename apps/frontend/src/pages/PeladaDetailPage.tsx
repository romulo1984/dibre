import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '@/hooks/useAuthToken'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { TeamStatsCard } from '@/features/games/TeamStatsCard'
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

export function PeladaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const getToken = useAuthToken()
  const [game, setGame] = useState<Game | null>(null)
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [teams, setTeams] = useState<TeamAssignment[]>([])
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [drawLoading, setDrawLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    Promise.all([getGame(id), getGamePlayers(id), getGameTeams(id), listPlayers()])
      .then(([g, playersRes, teamsRes, players]) => {
        if (!cancelled) {
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
  }, [id])

  const playerNames = new Map(allPlayers.map((p) => [p.id, p.name]))

  const handleSetPlayers = async (selectedIds: string[]) => {
    if (!id || !isSignedIn) return
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
    if (!id || !isSignedIn) return
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
          {isSignedIn && (
            <PageHeader.Actions>
              <ShimmerButton
                className="h-10 px-5 text-sm font-semibold shadow-lg disabled:opacity-50"
                disabled={playerIds.length < game.numberOfTeams || drawLoading}
                onClick={handleRunDraw}
              >
                {drawLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sorteando...
                  </span>
                ) : (
                  '🎲 Executar sorteio'
                )}
              </ShimmerButton>
            </PageHeader.Actions>
          )}
        </PageHeader.Root>
      </BlurFade>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Player Selection (Admin) */}
      {isSignedIn && (
        <BlurFade delay={0.2}>
          <Card.Root>
            <Card.Header>
              <Card.Title>Selecionar jogadores</Card.Title>
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
      )}

      {/* Player List (Viewer) */}
      {!isSignedIn && playerIds.length > 0 && (
        <BlurFade delay={0.2}>
          <Card.Root>
            <Card.Header>
              <Card.Title>Jogadores nesta pelada</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap gap-2">
                {playerIds.map((pid) => (
                  <span
                    key={pid}
                    className="inline-flex rounded-full bg-[var(--surface-tertiary)] px-3 py-1 text-sm font-medium text-[var(--text-secondary)]"
                  >
                    {playerNames.get(pid) ?? pid}
                  </span>
                ))}
              </div>
            </Card.Content>
          </Card.Root>
        </BlurFade>
      )}

      {/* Teams & Stats */}
      {teams.length > 0 && (
        <section>
          <BlurFade delay={0.3}>
            <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
              Times e estatísticas
            </h2>
          </BlurFade>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, i) => (
              <BlurFade key={team.teamName} delay={0.35 + i * 0.08}>
                <TeamStatsCard team={team} playerNames={playerNames} />
              </BlurFade>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ── Internal: Player checkbox selector ── */

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
  const toggle = (playerId: string) => {
    const next = selectedIds.includes(playerId)
      ? selectedIds.filter((pid) => pid !== playerId)
      : [...selectedIds, playerId]
    setSaving(true)
    onChange(next).finally(() => setSaving(false))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allPlayers.map((p) => {
        const isSelected = selectedIds.includes(p.id)
        return (
          <button
            key={p.id}
            type="button"
            disabled={saving}
            onClick={() => toggle(p.id)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all',
              isSelected
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] shadow-sm'
                : 'border-[var(--border-primary)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)] hover:bg-[var(--surface-tertiary)]',
              saving && 'opacity-60',
            )}
          >
            {isSelected && <span className="text-[var(--color-brand-500)]">✓</span>}
            {p.name}
          </button>
        )
      })}
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
