import { Link } from 'react-router-dom'
import type { Group } from '@/domain/types'
import { MagicCard } from '@/components/magicui/magic-card'
import { BlurFade } from '@/components/magicui/blur-fade'

interface GroupCardProps {
  group: Group
  isOwner: boolean
  index: number
}

export function GroupCard({ group, isOwner, index }: GroupCardProps) {
  return (
    <BlurFade delay={0.05 * index} inView>
      <Link to={`/groups/${group.id}`} className="block">
        <MagicCard
          className="group p-6 transition-shadow hover:shadow-lg"
          gradientColor="var(--color-brand-50)"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-brand-600)]">
                  {group.name}
                </h3>
                {isOwner && (
                  <span className="shrink-0 rounded-full bg-[var(--color-brand-50)] px-2 py-0.5 text-xs font-medium text-[var(--color-brand-600)]">
                    Dono
                  </span>
                )}
              </div>
              {group.description && (
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-tertiary)]">
                  {group.description}
                </p>
              )}
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">/{group.slug}</p>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-50)] text-xl">
              👥
            </div>
          </div>
        </MagicCard>
      </Link>
    </BlurFade>
  )
}
