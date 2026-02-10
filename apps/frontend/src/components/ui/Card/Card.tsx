import { type ReactNode } from 'react'

export interface CardComposition {
  Root: typeof CardRoot
  Header: typeof CardHeader
  Title: typeof CardTitle
  Content: typeof CardContent
  Footer: typeof CardFooter
}

function CardRoot({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-b border-neutral-200 px-6 py-4 dark:border-neutral-800 ${className}`}>
      {children}
    </div>
  )
}

function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-neutral-900 dark:text-white ${className}`}>
      {children}
    </h3>
  )
}

function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-t border-neutral-200 px-6 py-4 dark:border-neutral-800 ${className}`}>
      {children}
    </div>
  )
}

export const Card: CardComposition = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
}
