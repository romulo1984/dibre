import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
      className={cn(
        'rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-b border-[var(--border-primary)] px-6 py-4', className)}>
      {children}
    </div>
  )
}

function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-[var(--text-primary)]', className)}>
      {children}
    </h3>
  )
}

function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-t border-[var(--border-primary)] px-6 py-4', className)}>
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
