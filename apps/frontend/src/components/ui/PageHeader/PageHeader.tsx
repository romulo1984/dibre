import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderComposition {
  Root: typeof Root
  Title: typeof Title
  Description: typeof Description
  Actions: typeof Actions
}

function Root({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
    >
      {children}
    </header>
  )
}

function Title({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn('text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl', className)}>
      {children}
    </h1>
  )
}

function Description({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-[var(--text-tertiary)]', className)}>{children}</p>
}

function Actions({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex shrink-0 items-center gap-2', className)}>{children}</div>
}

export const PageHeader: PageHeaderComposition = {
  Root,
  Title,
  Description,
  Actions,
}
