import { type ReactNode } from 'react'

export interface PageHeaderComposition {
  Root: typeof Root
  Title: typeof Title
  Description: typeof Description
  Actions: typeof Actions
}

function Root({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <header
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {children}
    </header>
  )
}

function Title({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={`text-2xl font-bold text-neutral-900 dark:text-white ${className}`}>
      {children}
    </h1>
  )
}

function Description({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-neutral-600 dark:text-neutral-400 ${className}`}>{children}</p>
}

function Actions({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex shrink-0 items-center gap-2 ${className}`}>{children}</div>
}

export const PageHeader: PageHeaderComposition = {
  Root,
  Title,
  Description,
  Actions,
}
