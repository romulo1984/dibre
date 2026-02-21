import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/Button/Button'
import { PlayerList } from '@/features/players/PlayerList'
import { GameList } from '@/features/games/GameList'
import { useAuthToken } from '@/hooks/useAuthToken'
import {
  getGroup,
  getGroupPlayers,
  getGroupGames,
  getMyInvitations,
  requestToJoin,
  cancelJoinRequest,
  respondToInvitation,
} from '@/services/groups.service'
import type { Group, GroupMembership, Player, Game } from '@/domain/types'
import { cn } from '@/lib/utils'

type Tab = 'players' | 'games'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const getToken = useAuthToken()

  const [group, setGroup] = useState<Group | null>(null)
  const [membership, setMembership] = useState<GroupMembership | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [tab, setTab] = useState<Tab>('players')
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const fetchGroup = useCallback(async () => {
    if (!id) return
    const token = await getToken()
    if (!token) return
    const data = await getGroup(id, token)
    setGroup(data.group)
    setMembership(data.membership)
  }, [id, getToken])

  const fetchContent = useCallback(async () => {
    if (!id || !membership) return
    if (!membership.isOwner && !membership.isMember) return
    const token = await getToken()
    if (!token) return
    setContentLoading(true)
    try {
      const [ps, gs] = await Promise.all([getGroupPlayers(id, token), getGroupGames(id, token)])
      setPlayers(ps)
      setGames(gs)
    } catch {
      // silent — user may not have access
    } finally {
      setContentLoading(false)
    }
  }, [id, getToken, membership])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchGroup()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar grupo'))
      .finally(() => setLoading(false))
  }, [id, fetchGroup])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  async function handleRequestJoin() {
    if (!id) return
    setActionLoading(true)
    setActionMsg(null)
    try {
      const token = await getToken()
      if (!token) return
      await requestToJoin(id, token)
      setActionMsg('Solicitação enviada! Aguarde a aprovação do dono do grupo.')
      setMembership((m) => m ? { ...m, pendingRequest: true } : m)
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Erro ao solicitar participação')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancelRequest() {
    if (!id) return
    setActionLoading(true)
    setActionMsg(null)
    try {
      const token = await getToken()
      if (!token) return
      await cancelJoinRequest(id, token)
      setActionMsg('Solicitação cancelada.')
      setMembership((m) => m ? { ...m, pendingRequest: false } : m)
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Erro ao cancelar solicitação')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAcceptInvitation() {
    if (!id || !group) return
    const groupId = group.id
    setActionLoading(true)
    setActionMsg(null)
    try {
      const token = await getToken()
      if (!token) return
      const invitations = await getMyInvitations(token)
      const inv = invitations.find((i) => i.groupId === groupId)
      if (!inv) {
        setActionMsg('Convite não encontrado.')
        return
      }
      await respondToInvitation(inv.id, 'accept', token)
      setActionMsg('Você entrou no grupo!')
      setMembership((m) => m ? { ...m, isMember: true, pendingInvitation: false } : m)
      await fetchContent()
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Erro ao aceitar convite')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeclineInvitation() {
    if (!id || !group) return
    const groupId = group.id
    setActionLoading(true)
    setActionMsg(null)
    try {
      const token = await getToken()
      if (!token) return
      const invitations = await getMyInvitations(token)
      const inv = invitations.find((i) => i.groupId === groupId)
      if (!inv) {
        setActionMsg('Convite não encontrado.')
        return
      }
      await respondToInvitation(inv.id, 'decline', token)
      setActionMsg('Convite recusado.')
      setMembership((m) => m ? { ...m, pendingInvitation: false } : m)
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Erro ao recusar convite')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="mb-3 text-4xl">😕</span>
        <p className="font-medium text-[var(--text-secondary)]">{error ?? 'Grupo não encontrado.'}</p>
        <Link to="/groups" className="mt-4">
          <Button variant="outline" size="sm">Voltar para grupos</Button>
        </Link>
      </div>
    )
  }

  const canSeeContent = membership?.isOwner || membership?.isMember

  return (
    <div className="space-y-6">
      <BlurFade delay={0.05}>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{group.name}</h1>
              {membership?.isOwner && (
                <span className="rounded-full bg-[var(--color-brand-100)] px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-700)]">
                  Dono
                </span>
              )}
              {membership?.isMember && !membership.isOwner && (
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Membro
                </span>
              )}
            </div>
            {group.description && (
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{group.description}</p>
            )}
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">/{group.slug}</p>
          </div>

          {/* Actions for owner */}
          {membership?.isOwner && (
            <div className="flex shrink-0 gap-2">
              <Link to={`/groups/${id}/manage`}>
                <Button variant="outline" size="sm">Gerenciar grupo</Button>
              </Link>
            </div>
          )}
        </div>
      </BlurFade>

      {/* Invitation banner */}
      {membership?.pendingInvitation && (
        <BlurFade delay={0.1}>
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-[var(--color-brand-700)]">
                Você foi convidado para este grupo!
              </p>
              <p className="mt-0.5 text-sm text-[var(--color-brand-600)]">
                Aceite para visualizar jogadores e peladas.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="primary"
                size="sm"
                loading={actionLoading}
                onClick={handleAcceptInvitation}
              >
                Aceitar
              </Button>
              <Button
                variant="outline"
                size="sm"
                loading={actionLoading}
                onClick={handleDeclineInvitation}
              >
                Recusar
              </Button>
            </div>
          </div>
        </BlurFade>
      )}

      {/* Join request actions (for non-members who are not invited) */}
      {!membership?.isOwner && !membership?.isMember && !membership?.pendingInvitation && (
        <BlurFade delay={0.1}>
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                Você não é membro deste grupo.
              </p>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                Solicite participação para visualizar o conteúdo.
              </p>
            </div>
            {membership?.pendingRequest ? (
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Solicitação pendente
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={actionLoading}
                  onClick={handleCancelRequest}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                loading={actionLoading}
                onClick={handleRequestJoin}
              >
                Solicitar participação
              </Button>
            )}
          </div>
        </BlurFade>
      )}

      {/* Feedback message */}
      {actionMsg && (
        <div className="rounded-xl border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-3 text-sm text-[var(--color-brand-700)]">
          {actionMsg}
        </div>
      )}

      {/* Content (only for members and owner) */}
      {canSeeContent && (
        <BlurFade delay={0.15}>
          {/* Tabs */}
          <div className="border-b border-[var(--border-primary)]">
            <div className="flex gap-1">
              {(['players', 'games'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    'relative px-4 py-2.5 text-sm font-medium transition-colors',
                    tab === t
                      ? 'text-[var(--color-brand-600)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {t === 'players' ? 'Jogadores' : 'Peladas'}
                  {tab === t && (
                    <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-[var(--color-brand-500)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {contentLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="size-7 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
            </div>
          ) : (
            <div className="mt-6">
              {tab === 'players' && <PlayerList players={players} />}
              {tab === 'games' && <GameList games={games} />}
            </div>
          )}
        </BlurFade>
      )}
    </div>
  )
}
