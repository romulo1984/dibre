import { Link } from 'react-router-dom'
import type { Group } from '@/domain/types'
import { BlurFade } from '@/components/magicui/blur-fade'

interface GroupCardProps {
  group: Group
  isOwner: boolean
  index: number
}

export function GroupCard({ group, isOwner, index }: GroupCardProps) {
  const initials = group.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <BlurFade delay={0.05 * index} inView>
      <Link to={`/groups/${group.id}`} className="group block">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] transition-all hover:border-[var(--color-brand-300)] hover:shadow-[var(--shadow-md)]">
          <div className="absolute inset-y-0 left-0 w-1 bg-[var(--color-brand-500)] transition-all group-hover:w-1.5" />

          <div className="flex items-center gap-4 p-4 pl-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-50)] text-sm font-bold text-[var(--color-brand-700)] ring-1 ring-[var(--color-brand-200)] transition-colors group-hover:bg-[var(--color-brand-100)]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-brand-600)]">
                  {group.name}
                </h3>
                {isOwner && (
                  <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-brand-50)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-brand-600)]">
                    Dono
                  </span>
                )}
              </div>
              {group.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-tertiary)]">
                  {group.description}
                </p>
              )}
              <p className="mt-1 font-mono text-[11px] text-[var(--text-tertiary)]">/{group.slug}</p>
            </div>
          </div>
        </div>
      </Link>
    </BlurFade>
  )
}
