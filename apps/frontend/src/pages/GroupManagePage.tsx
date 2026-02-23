import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { BlurFade } from '@/components/magicui/blur-fade'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { useAuthToken } from '@/hooks/useAuthToken'
import {
  getGroup,
  getJoinRequests,
  respondToJoinRequest,
  removeGroupMember,
  deleteGroup,
  inviteByEmail,
  getGroupMembersWithPending,
  getGroupOwnerGames,
  assignGameToGroup,
  removeGameFromGroup,
  getAvailablePlayers,
  syncGroupPlayers,
} from '@/services/groups.service'
import type {
  Group,
  GroupMembership,
  GroupMember,
  GroupJoinRequest,
  GroupInvitation,
  GroupAvailablePlayer,
  Game,
} from '@/domain/types'
import { PlayerSelectList } from '@/features/players/PlayerSelectList'

export function GroupManagePage() {
  const { id } = useParams<{ id: string }>()
  const getToken = useAuthToken()
  const navigate = useNavigate()

  const [group, setGroup] = useState<Group | null>(null)
  const [membership, setMembership] = useState<GroupMembership | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<GroupInvitation[]>([])
  const [requests, setRequests] = useState<GroupJoinRequest[]>([])
  const [ownerGames, setOwnerGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState<{
    type: 'success' | 'notFound' | 'error'
    msg: string
  } | null>(null)

  const [requestLoading, setRequestLoading] = useState<string | null>(null)
  const [removingMember, setRemovingMember] = useState<GroupMember | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [gameToggleLoading, setGameToggleLoading] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [availablePlayers, setAvailablePlayers] = useState<GroupAvailablePlayer[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set())
  const [initialPlayerIds, setInitialPlayerIds] = useState<Set<string>>(new Set())
  const [playerSaving, setPlayerSaving] = useState(false)
  const [playerSaveResult, setPlayerSaveResult] = useState<{
    type: 'success' | 'error'
    msg: string
  } | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    const token = await getToken()
    if (!token) return
    const [groupData, requestsData, membersData, gamesData, playersData] = await Promise.all([
      getGroup(id, token),
      getJoinRequests(id, token).catch(() => [] as GroupJoinRequest[]),
      getGroupMembersWithPending(id, token).catch(() => ({ members: [], pendingInvitations: [] })),
      getGroupOwnerGames(id, token).catch(() => [] as Game[]),
      getAvailablePlayers(id, token).catch(() => [] as GroupAvailablePlayer[]),
    ])
    setGroup(groupData.group)
    setMembership(groupData.membership)
    setRequests(requestsData)
    setMembers(membersData.members)
    setPendingInvitations(membersData.pendingInvitations)
    setOwnerGames(gamesData)
    setAvailablePlayers(playersData)
    const inGroup = new Set(playersData.filter((p) => p.isInGroup).map((p) => p.id))
    setSelectedPlayerIds(inGroup)
    setInitialPlayerIds(inGroup)
  }, [id, getToken])

  useEffect(() => {
    setLoading(true)
    fetchData()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [fetchData])

  useEffect(() => {
    if (!loading && membership && !membership.isOwner) {
      navigate(`/groups/${id}`, { replace: true })
    }
  }, [loading, membership, id, navigate])

  async function handleInviteByEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !inviteEmail.trim()) return
    setInviteLoading(true)
    setInviteResult(null)
    try {
      const token = await getToken()
      if (!token) return
      await inviteByEmail(id, inviteEmail.trim(), token)
      setInviteResult({ type: 'success', msg: `Convite enviado para ${inviteEmail.trim()}!` })
      setInviteEmail('')
      const membersData = await getGroupMembersWithPending(id, token)
      setPendingInvitations(membersData.pendingInvitations)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao convidar'
      if (msg.includes('não encontrado') || msg.includes('not found')) {
        setInviteResult({ type: 'notFound', msg: 'Nenhuma conta encontrada com este e-mail.' })
      } else if (msg.includes('already a member') || msg.includes('já é membro')) {
        setInviteResult({ type: 'error', msg: 'Este usuário já é membro do grupo.' })
      } else if (msg.includes('already pending') || msg.includes('pendente')) {
        setInviteResult({ type: 'error', msg: 'Já existe um convite pendente para este e-mail.' })
      } else {
        setInviteResult({ type: 'error', msg })
      }
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleRespondRequest(requestId: string, action: 'accept' | 'decline') {
    if (!id) return
    setRequestLoading(requestId)
    try {
      const token = await getToken()
      if (!token) return
      await respondToJoinRequest(id, requestId, action, token)
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
      if (action === 'accept') {
        await fetchData()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao responder solicitação')
    } finally {
      setRequestLoading(null)
    }
  }

  async function handleRemoveMember() {
    if (!id || !removingMember) return
    setRemoveLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      await removeGroupMember(id, removingMember.userId, token)
      setMembers((prev) => prev.filter((m) => m.id !== removingMember.id))
      setRemovingMember(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover membro')
    } finally {
      setRemoveLoading(false)
    }
  }

  async function handleToggleGame(game: Game) {
    if (!id) return
    const isAssigned = game.groupId === id
    setGameToggleLoading(game.id)
    try {
      const token = await getToken()
      if (!token) return
      if (isAssigned) {
        await removeGameFromGroup(id, game.id, token)
      } else {
        await assignGameToGroup(id, game.id, token)
      }
      setOwnerGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, groupId: isAssigned ? null : id } : g))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pelada')
    } finally {
      setGameToggleLoading(null)
    }
  }

  function handleTogglePlayer(playerId: string) {
    setPlayerSaveResult(null)
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev)
      if (next.has(playerId)) {
        next.delete(playerId)
      } else {
        next.add(playerId)
      }
      return next
    })
  }

  function handleSelectAllPlayers() {
    setPlayerSaveResult(null)
    setSelectedPlayerIds(new Set(availablePlayers.map((p) => p.id)))
  }

  function handleDeselectAllPlayers() {
    setPlayerSaveResult(null)
    setSelectedPlayerIds(new Set())
  }

  const playersChanged =
    selectedPlayerIds.size !== initialPlayerIds.size ||
    [...selectedPlayerIds].some((id) => !initialPlayerIds.has(id))

  async function handleSavePlayers() {
    if (!id) return
    setPlayerSaving(true)
    setPlayerSaveResult(null)
    try {
      const token = await getToken()
      if (!token) return
      await syncGroupPlayers(id, [...selectedPlayerIds], token)
      setInitialPlayerIds(new Set(selectedPlayerIds))
      setPlayerSaveResult({ type: 'success', msg: 'Jogadores atualizados com sucesso!' })
    } catch (err) {
      setPlayerSaveResult({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Erro ao salvar jogadores',
      })
    } finally {
      setPlayerSaving(false)
    }
  }

  async function handleDeleteGroup() {
    if (!id) return
    setDeleteLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      await deleteGroup(id, token)
      navigate('/groups', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar grupo')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
      </div>
    )
  }

  if (error && !group) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[var(--text-secondary)]">{error ?? 'Grupo nao encontrado.'}</p>
        <Link to="/groups" className="mt-4">
          <Button variant="outline" size="sm">
            Voltar
          </Button>
        </Link>
      </div>
    )
  }

  if (!group) return null

  const assignedCount = ownerGames.filter((g) => g.groupId === id).length
  const totalPeople = members.length + pendingInvitations.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.05}>
        <PageHeader.Root>
          <div>
            <Link
              to={`/groups/${id}`}
              className="mb-1 inline-flex items-center gap-1 text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <span className="text-xs">&larr;</span> {group.name}
            </Link>
            <PageHeader.Title>Gerenciar grupo</PageHeader.Title>
          </div>
        </PageHeader.Root>
      </BlurFade>

      {/* Stats */}
      <BlurFade delay={0.08}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{members.length}</p>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Membros</p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {pendingInvitations.length}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Convites pendentes</p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{requests.length}</p>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Solicitações</p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{assignedCount}</p>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Peladas no grupo</p>
          </div>
        </div>
      </BlurFade>

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Join Requests */}
      {requests.length > 0 && (
        <BlurFade delay={0.1}>
          <Section title="Soliticações pendentes" count={requests.length} accentColor="amber">
            <div className="divide-y divide-[var(--border-primary)]">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {req.user?.name ?? req.user?.email ?? 'Usuário'}
                    </p>
                    {req.user?.email && req.user.name && (
                      <p className="text-xs text-[var(--text-tertiary)]">{req.user.email}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={requestLoading === req.id}
                      onClick={() => handleRespondRequest(req.id, 'accept')}
                    >
                      Aceitar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      loading={requestLoading === req.id}
                      onClick={() => handleRespondRequest(req.id, 'decline')}
                    >
                      Recusar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </BlurFade>
      )}

      {/* Members */}
      <BlurFade delay={0.15}>
        <Section title="Membros" count={totalPeople}>
          {members.length === 0 && pendingInvitations.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
              Nenhum membro ainda.
            </p>
          ) : (
            <div className="divide-y divide-[var(--border-primary)]">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-tertiary)] text-xs font-semibold text-[var(--text-secondary)]">
                      {(member.user?.name ?? member.user?.email ?? 'M')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {member.user?.name ?? member.user?.email ?? 'Membro'}
                      </p>
                      {member.user?.email && member.user.name && (
                        <p className="text-xs text-[var(--text-tertiary)]">{member.user.email}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemovingMember(member)}
                    className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    Remover
                  </Button>
                </div>
              ))}
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 opacity-60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--border-secondary)] text-xs text-[var(--text-tertiary)]">
                      ?
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {inv.invitedUser?.name ?? inv.invitedUser?.email ?? 'Usuario convidado'}
                      </p>
                      {inv.invitedUser?.email && inv.invitedUser.name && (
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {inv.invitedUser.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-[var(--radius-sm)] bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Pendente
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </BlurFade>

      {/* Invite by email */}
      <BlurFade delay={0.2}>
        <Section title="Convidar por e-mail">
          <div className="space-y-3 p-4">
            <form onSubmit={handleInviteByEmail} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value)
                  setInviteResult(null)
                }}
                placeholder="email@exemplo.com"
                required
                className="min-w-0 flex-1 rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={inviteLoading}
                disabled={!inviteEmail.trim()}
                className="shrink-0"
              >
                Convidar
              </Button>
            </form>

            {inviteResult && (
              <p
                className={`text-sm ${
                  inviteResult.type === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : inviteResult.type === 'notFound'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                }`}
              >
                {inviteResult.msg}
              </p>
            )}
          </div>
        </Section>
      </BlurFade>

      {/* Player selection */}
      <BlurFade delay={0.25}>
        <Section
          title="Jogadores do grupo"
          badge={
            availablePlayers.length > 0 ? (
              <span className="text-xs text-[var(--text-tertiary)]">
                {selectedPlayerIds.size} de {availablePlayers.length} selecionados
              </span>
            ) : undefined
          }
        >
          <div className="p-4">
            <PlayerSelectList
              players={availablePlayers}
              selectedIds={[...selectedPlayerIds]}
              onToggle={handleTogglePlayer}
              onSelectAll={handleSelectAllPlayers}
              onDeselectAll={handleDeselectAllPlayers}
              disabled={playerSaving}
              searchable
              emptyMessage={
                <p className="text-sm text-[var(--text-tertiary)]">
                  Você ainda não criou nenhum jogador.{' '}
                  <Link
                    to="/players/new"
                    className="font-medium text-[var(--color-brand-600)] hover:underline"
                  >
                    Criar jogador
                  </Link>
                </p>
              }
            />

            {availablePlayers.length > 0 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {playerSaveResult && (
                    <p
                      className={`text-sm ${
                        playerSaveResult.type === 'success'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {playerSaveResult.msg}
                    </p>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!playersChanged}
                  loading={playerSaving}
                  onClick={handleSavePlayers}
                  className="shrink-0"
                >
                  Salvar alterações
                </Button>
              </div>
            )}
          </div>
        </Section>
      </BlurFade>

      {/* Game assignment */}
      <BlurFade delay={0.3}>
        <Section
          title="Peladas do grupo"
          badge={
            ownerGames.length > 0 ? (
              <span className="text-xs text-[var(--text-tertiary)]">
                {assignedCount} de {ownerGames.length} atribuídas
              </span>
            ) : undefined
          }
        >
          {ownerGames.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
              Você ainda não criou nenhuma pelada.{' '}
              <Link
                to="/games/new"
                className="font-medium text-[var(--color-brand-600)] hover:underline"
              >
                Criar pelada
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-[var(--border-primary)]">
              {ownerGames.map((game) => {
                const isAssigned = game.groupId === id
                return (
                  <div key={game.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {game.name}
                        </p>
                        {isAssigned && (
                          <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-brand-50)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-brand-700)]">
                            No grupo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {new Date(game.createdAt).toLocaleDateString('pt-BR')}
                        {game.numberOfTeams > 0 && ` · ${game.numberOfTeams} times`}
                      </p>
                    </div>
                    <Button
                      variant={isAssigned ? 'outline' : 'ghost'}
                      size="sm"
                      loading={gameToggleLoading === game.id}
                      onClick={() => handleToggleGame(game)}
                      className="shrink-0"
                    >
                      {isAssigned ? 'Remover' : 'Adicionar'}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      </BlurFade>

      {/* Danger zone */}
      <BlurFade delay={0.35}>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-red-500">
            Zona perigosa
          </h2>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-red-200 bg-[var(--surface-primary)] dark:border-red-900">
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Deletar grupo</p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  Remove o grupo permanentemente. Membros perderão o acesso.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0"
              >
                Deletar
              </Button>
            </div>
          </div>
        </div>
      </BlurFade>

      <ConfirmDialog
        open={!!removingMember}
        title="Remover membro"
        description={`Tem certeza que deseja remover "${removingMember?.user?.name ?? removingMember?.user?.email ?? 'este membro'}" do grupo?`}
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleRemoveMember}
        onCancel={() => setRemovingMember(null)}
        loading={removeLoading}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Deletar grupo"
        description={`Tem certeza que deseja deletar o grupo "${group.name}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Deletar grupo"
        variant="danger"
        onConfirm={handleDeleteGroup}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleteLoading}
      />
    </div>
  )
}

function Section({
  title,
  count,
  badge,
  accentColor,
  children,
}: {
  title: string
  count?: number
  badge?: React.ReactNode
  accentColor?: 'amber' | 'brand'
  children: React.ReactNode
}) {
  const dotColor = accentColor === 'amber' ? 'bg-amber-400' : 'bg-[var(--color-brand-500)]'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block size-1.5 rounded-full ${dotColor}`} />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
            {count !== undefined && (
              <span className="ml-1.5 text-[var(--text-tertiary)]">({count})</span>
            )}
          </h2>
        </div>
        {badge}
      </div>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)]">
        {children}
      </div>
    </div>
  )
}
