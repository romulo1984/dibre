import { Outlet, Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/players', label: 'Jogadores' },
  { to: '/peladas', label: 'Peladas' },
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)]">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--surface-primary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center transition-opacity hover:opacity-90"
            aria-label="dib.re - Início"
          >
            <Logo
              height={32}
              primaryColor="var(--text-primary)"
              accentColor="var(--color-accent-500)"
              className="transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const active = location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-[var(--color-brand-600)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  {label}
                  {active && (
                    <span className="absolute inset-x-1 -bottom-[calc(0.5rem+1px)] h-0.5 rounded-full bg-[var(--color-brand-500)]" />
                  )}
                </Link>
              )
            })}

            <div className="ml-3 h-6 w-px bg-[var(--border-primary)]" />

            <div className="ml-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
                  >
                    Entrar
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border-primary)] py-6">
        <p className="text-center text-xs text-[var(--text-tertiary)]">
          dib.re — Sorteio equilibrado de times para pelada
        </p>
      </footer>
    </div>
  )
}
