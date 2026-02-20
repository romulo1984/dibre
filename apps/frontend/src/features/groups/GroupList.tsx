import type { Group } from '@/domain/types'
import { GroupCard } from './GroupCard'

interface GroupListProps {
  groups: Group[]
  userId: string
}

export function GroupList({ groups, userId }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-secondary)] bg-[var(--surface-tertiary)] px-6 py-16 text-center">
        <span className="mb-3 text-4xl">👥</span>
        <p className="font-medium text-[var(--text-secondary)]">Nenhum grupo encontrado.</p>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Crie um grupo ou aguarde um convite.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, i) => (
        <li key={group.id}>
          <GroupCard group={group} isOwner={group.ownerId === userId} index={i} />
        </li>
      ))}
    </ul>
  )
}
