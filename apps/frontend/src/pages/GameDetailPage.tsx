import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthToken } from '@/hooks/useAuthToken'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { TeamStatsCard } from '@/features/games/TeamStatsCard'
import { TeamColorPicker } from '@/features/games/TeamColorPicker'
import { PlayerSelectList } from '@/features/players/PlayerSelectList'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BlurFade } from '@/components/magicui/blur-fade'
import {
  getGame,
  getGamePlayers,
  getGameTeams,
  getGameTeamPlayers,
  setGamePlayers,
  runDraw,
  deleteGame,
  updateGame,
} from '@/services/games.service'
import { listPlayers } from '@/services/players.service'
import { listGroups, getGroupPlayers } from '@/services/groups.service'
import { getVestColor } from '@/domain/vestColors'
import type { Game, TeamAssignment, Player, Group } from '@/domain/types'

function formatTeamsForShare(
  teams: TeamAssignment[],
  playersMap: Map<string, Player>,
  teamColorsMap?: Record<string, string> | null,
): string {
  const starsEmoji = (n: number) => '⭐'.repeat(n)
  const lines: string[] = ['⚽ *Sorteio de Times* ⚽', '']
  teams.forEach((team) => {
    const colorKey = teamColorsMap?.[String(team.order)]
    const vestColor = colorKey ? getVestColor(colorKey) : null
    const colorLabel = vestColor ? ` 🎽 ${vestColor.label}` : ''
    lines.push(`🏆 *${team.teamName}*${colorLabel} (${team.playerIds.length} jogadores)`)
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

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getToken = useAuthToken()
  const [game, setGame] = useState<Game | null>(null)
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [teams, setTeams] = useState<TeamAssignment[]>([])
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [playersMap, setPlayersMap] = useState<Map<string, Player>>(new Map())
  const [loading, setLoading] = useState(true)
  const [drawLoading, setDrawLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [ownedGroups, setOwnedGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [teamColors, setTeamColors] = useState<Record<string, string>>({})
  const [settingsSaving, setSettingsSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getToken()
      .then(async (token) => {
        if (cancelled || !token) return
        const [g, playersRes, teamsRes, teamPlayers] = await Promise.all([
          getGame(id, token),
          getGamePlayers(id, token),
          getGameTeams(id, token),
          getGameTeamPlayers(id, token),
        ])
        if (cancelled) return
        setGame(g)
        setPlayerIds(playersRes.playerIds)
        setTeams(teamsRes.teams)
        setPlayersMap(new Map(teamPlayers.map((p) => [p.id, p])))
        setSelectedGroupId(g.groupId ?? null)
        setTeamColors(g.teamColors ?? {})

        if (g.isOwner) {
          const [allOwnerPlayers, groupsData] = await Promise.all([
            listPlayers(token),
            listGroups(token),
          ])
          if (cancelled) return

          const owned = groupsData.groups.filter(
            (gr) => gr.ownerId === groupsData.currentUserId && !gr.deletedAt
          )
          setOwnedGroups(owned)

          if (g.groupId) {
            const groupPlayers = await getGroupPlayers(g.groupId, token)
            if (!cancelled) setAllPlayers(groupPlayers)
          } else {
            setAllPlayers(allOwnerPlayers)
          }
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

  const handleSaveSettings = async () => {
    if (!id) return
    setSettingsSaving(true)
    try {
      const token = await getToken()
      if (!token) return
      const colorsToSend = Object.keys(teamColors).length > 0 ? teamColors : null
      const groupChanged = selectedGroupId !== (game?.groupId ?? null)
      const updated = await updateGame(
        id,
        { groupId: selectedGroupId, teamColors: colorsToSend },
        token,
      )
      setGame((prev) => (prev ? { ...prev, ...updated } : updated))

      if (groupChanged) {
        if (selectedGroupId) {
          const groupPlayers = await getGroupPlayers(selectedGroupId, token)
          setAllPlayers(groupPlayers)
          const validIds = new Set(groupPlayers.map((p) => p.id))
          const filtered = playerIds.filter((pid) => validIds.has(pid))
          if (filtered.length !== playerIds.length) {
            await setGamePlayers(id, filtered, token)
            setPlayerIds(filtered)
          }
        } else {
          const players = await listPlayers(token)
          setAllPlayers(players)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSettingsSaving(false)
    }
  }

  const isOwner = game?.isOwner ?? false
  const activePlayers = allPlayers.filter((p) => !p.deletedAt)
  const [playerSaving, setPlayerSaving] = useState(false)

  const handleTogglePlayer = (playerId: string) => {
    const next = playerIds.includes(playerId)
      ? playerIds.filter((pid) => pid !== playerId)
      : [...playerIds, playerId]
    setPlayerSaving(true)
    handleSetPlayers(next).finally(() => setPlayerSaving(false))
  }

  const handleSelectAllPlayers = () => {
    const next = activePlayers.map((p) => p.id)
    setPlayerSaving(true)
    handleSetPlayers(next).finally(() => setPlayerSaving(false))
  }

  const handleDeselectAllPlayers = () => {
    setPlayerSaving(true)
    handleSetPlayers([]).finally(() => setPlayerSaving(false))
  }

  const handleDeleteGame = async () => {
    if (!id) return
    setDeleting(true)
    try {
      const token = await getToken()
      if (!token) return
      await deleteGame(id, token)
      navigate('/games')
    } catch {
      setError('Erro ao excluir pelada')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

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
      // Refresh players map after draw
      const teamPlayers = await getGameTeamPlayers(id, token)
      setPlayersMap(new Map(teamPlayers.map((p) => [p.id, p])))
      setTimeout(() => {
        document.getElementById('teams-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
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
        <Button variant="outline" className="mt-4" onClick={() => navigate('/games')}>
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
            {!isOwner && game.createdByName && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]">
                <span>👤</span>
                <span>
                  Criado por{' '}
                  <span className="font-medium text-[var(--text-secondary)]">
                    {game.createdByName}
                  </span>
                </span>
              </p>
            )}
          </div>
          {isOwner && (
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
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => setShowDeleteDialog(true)}
              >
                Excluir
              </Button>
            </PageHeader.Actions>
          )}
        </PageHeader.Root>
      </BlurFade>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Seleção de jogadores — only for owner */}
      {isOwner && (
        <BlurFade delay={0.2}>
          <Card.Root>
            <Card.Header>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <Card.Title>Selecionar jogadores</Card.Title>
                <span className="text-xs font-medium text-[var(--text-tertiary)] sm:text-sm">
                  {playerIds.length} de {activePlayers.length} selecionado(s)
                </span>
              </div>
            </Card.Header>
            <Card.Content>
              <PlayerSelectList
                players={activePlayers}
                selectedIds={playerIds}
                onToggle={handleTogglePlayer}
                onSelectAll={handleSelectAllPlayers}
                onDeselectAll={handleDeselectAllPlayers}
                disabled={playerSaving}
                emptyMessage={
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Nenhum jogador cadastrado.{' '}
                    <Link to="/players/new" className="text-[var(--color-brand-600)] underline">
                      Cadastre jogadores
                    </Link>{' '}
                    primeiro.
                  </p>
                }
              />
            </Card.Content>
          </Card.Root>
        </BlurFade>
      )}

      {/* Settings — group & colors (owner only) */}
      {isOwner && (
        <BlurFade delay={0.25}>
          <Card.Root>
            <Card.Header>
              <Card.Title>Configurações</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-5">
              {ownedGroups.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Grupo</label>
                  <select
                    value={selectedGroupId ?? ''}
                    onChange={(e) => setSelectedGroupId(e.target.value || null)}
                    className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] transition-all focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:outline-none"
                  >
                    <option value="">Sem grupo (pelada avulsa)</option>
                    {ownedGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <TeamColorPicker
                numberOfTeams={game.numberOfTeams}
                teamColors={teamColors}
                onChange={setTeamColors}
              />

              <div className="flex">
                <Button size="sm" loading={settingsSaving} onClick={handleSaveSettings}>
                  Salvar configurações
                </Button>
              </div>
            </Card.Content>
          </Card.Root>
        </BlurFade>
      )}

      {/* Teams & Stats */}
      {teams.length > 0 && (
        <section id="teams-section" className="scroll-mt-6">
          <BlurFade delay={0.3}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Times e estatísticas</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = formatTeamsForShare(teams, playersMap, game.teamColors)
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
                      const text = formatTeamsForShare(teams, playersMap, game.teamColors)
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
                <TeamStatsCard
                  team={team}
                  playersMap={playersMap}
                  vestColorKey={game.teamColors?.[String(team.order)]}
                />
              </BlurFade>
            ))}
          </div>
        </section>
      )}

      {teams.length === 0 && !isOwner && (
        <BlurFade delay={0.2}>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-secondary)] p-12 text-center">
            <span className="mb-3 text-4xl">🎲</span>
            <p className="text-sm text-[var(--text-tertiary)]">
              O sorteio ainda não foi realizado.
            </p>
          </div>
        </BlurFade>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir pelada"
        description={`Tem certeza que deseja excluir "${game.name}"? A pelada será removida das listagens, mas continuará aparecendo no histórico dos jogadores.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteGame}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}

