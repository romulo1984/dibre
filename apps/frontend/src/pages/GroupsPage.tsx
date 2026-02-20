import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { GroupList } from '@/features/groups/GroupList'
import { listGroups } from '@/services/groups.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import type { Group } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'

export function GroupsPage() {
  const getToken = useAuthToken()
  const [groups, setGroups] = useState<Group[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getToken()
      .then((token) => {
        if (cancelled || !token) return
        return listGroups(token)
      })
      .then((data) => {
        if (!cancelled && data) {
          setGroups(data.groups)
          setCurrentUserId(data.currentUserId)
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
  }, [getToken])

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>Grupos</PageHeader.Title>
            <PageHeader.Description>
              Grupos que você criou ou participa.
            </PageHeader.Description>
          </div>
          <PageHeader.Actions>
            <Link to="/groups/new">
              <Button variant="primary">Novo grupo</Button>
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
            <p className="text-sm text-[var(--text-tertiary)]">Carregando grupos...</p>
          </div>
        </div>
      ) : (
        <GroupList
          groups={groups.filter((g) => !g.deletedAt)}
          userId={currentUserId}
        />
      )}
    </div>
  )
}
