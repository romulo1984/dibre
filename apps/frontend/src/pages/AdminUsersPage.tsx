import { useEffect, useState, useCallback } from 'react'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Card } from '@/components/ui/Card/Card'
import { Button } from '@/components/ui/Button/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog'
import { BlurFade } from '@/components/magicui/blur-fade'
import { useAuthToken } from '@/hooks/useAuthToken'
import { listUsers, deleteUser } from '@/services/admin.service'
import type { AdminUser } from '@/services/admin.service'
import { cn } from '@/lib/utils'

const PER_PAGE = 20

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] bg-[var(--surface-secondary)] px-2.5 py-1.5 sm:px-3 sm:py-2">
      <span className="text-base font-bold text-[var(--text-primary)] sm:text-lg">{value}</span>
      <span className="text-[10px] text-[var(--text-tertiary)] sm:text-xs">{label}</span>
    </div>
  )
}

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className:
      'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800',
  },
  member: {
    label: 'Membro',
    className:
      'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] ring-1 ring-[var(--color-brand-200)]',
  },
  viewer: {
    label: 'Viewer',
    className:
      'bg-gray-50 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
  },
}

export function AdminUsersPage() {
  const getToken = useAuthToken()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      if (!token) return
      const data = await listUsers(token, { page, perPage: PER_PAGE, search: search || undefined })
      setUsers(data.users)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }, [getToken, page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const token = await getToken()
      if (!token) return
      await deleteUser(deleteTarget.id, token)
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <BlurFade delay={0.05}>
      <div className="space-y-6">
        <PageHeader.Root>
          <div>
            <PageHeader.Title>Administração de Usuários</PageHeader.Title>
            <PageHeader.Description>
              Gerencie todos os usuários da plataforma ({total} no total)
            </PageHeader.Description>
          </div>
        </PageHeader.Root>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <SummaryCard label="Total de usuários" value={total} icon="👥" />
          <SummaryCard
            label="Admins"
            value={users.length > 0 ? users.filter((u) => u.role === 'admin').length : 0}
            icon="🛡️"
            note="desta página"
          />
          <SummaryCard
            label="Membros"
            value={users.length > 0 ? users.filter((u) => u.role === 'member').length : 0}
            icon="⚽"
            note="desta página"
          />
          <SummaryCard
            label="Viewers"
            value={users.length > 0 ? users.filter((u) => u.role === 'viewer').length : 0}
            icon="👁️"
            note="desta página"
          />
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="h-9 flex-1 rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--color-brand-400)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
          />
          <Button type="submit" size="sm">
            Buscar
          </Button>
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput('')
                setSearch('')
                setPage(1)
              }}
            >
              Limpar
            </Button>
          )}
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <span className="size-6 animate-spin rounded-full border-2 border-[var(--color-brand-500)] border-t-transparent" />
          </div>
        )}

        {/* Users list */}
        {!loading && users.length === 0 && (
          <Card.Root>
            <Card.Content className="py-12 text-center">
              <p className="text-sm text-[var(--text-tertiary)]">
                {search ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum usuário cadastrado.'}
              </p>
            </Card.Content>
          </Card.Root>
        )}

        {!loading && users.length > 0 && (
          <div className="space-y-3">
            {users.map((user, i) => {
              const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.viewer
              return (
                <BlurFade key={user.id} delay={0.03 * i}>
                  <Card.Root className="overflow-hidden transition-all hover:shadow-[var(--shadow-md)]">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                      {/* Avatar + info */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] text-sm font-bold text-white sm:size-11">
                          {user.name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                              {user.name || 'Sem nome'}
                            </span>
                            <span
                              className={cn(
                                'shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                roleInfo.className,
                              )}
                            >
                              {roleInfo.label}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
                            {user.email ?? 'Sem e-mail'}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">
                            Cadastrado em{' '}
                            {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <StatBadge label="Jogadores" value={user._count.players} />
                        <StatBadge label="Peladas" value={user._count.games} />
                        <StatBadge label="Grupos" value={user._count.ownedGroups} />
                        <StatBadge label="Participa" value={user._count.groupMemberships} />
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center sm:ml-2">
                        {user.role !== 'admin' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(user)}
                          >
                            Excluir
                          </Button>
                        ) : (
                          <span className="rounded-[var(--radius-md)] bg-[var(--surface-secondary)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-tertiary)]">
                            Protegido
                          </span>
                        )}
                      </div>
                    </div>
                  </Card.Root>
                </BlurFade>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-[var(--text-secondary)]">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Delete confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Excluir usuário"
          description={`Tem certeza que deseja excluir o usuário "${deleteTarget?.name || deleteTarget?.email || 'Sem nome'}"? Esta ação não pode ser desfeita. Todos os dados associados (grupos criados, referências em jogadores e peladas) serão removidos ou desvinculados.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </BlurFade>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  note,
}: {
  label: string
  value: number
  icon: string
  note?: string
}) {
  return (
    <Card.Root>
      <Card.Content className="flex items-center gap-3 p-4">
        <span className="text-2xl">{icon}</span>
        <div className="min-w-0">
          <p className="text-lg font-bold text-[var(--text-primary)] sm:text-xl">{value}</p>
          <p className="truncate text-xs text-[var(--text-tertiary)]">{label}</p>
          {note && (
            <p className="text-[10px] text-[var(--text-tertiary)] opacity-60">{note}</p>
          )}
        </div>
      </Card.Content>
    </Card.Root>
  )
}
