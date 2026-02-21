import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { Logo } from '@/components/ui/Logo'
import { NotificationCenter } from '@/features/notifications/NotificationCenter'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/players', label: 'Jogadores' },
  { to: '/games', label: 'Peladas' },
  { to: '/groups', label: 'Grupos' },
]

export function Layout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useUser()
  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin'
  useScrollToTop()

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)]">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--surface-primary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center transition-opacity hover:opacity-90"
            aria-label="dib.re - Início"
            onClick={closeMenu}
          >
            <Logo
              height={26}
              primaryColor="var(--text-primary)"
              accentColor="var(--color-accent-500)"
              className="transition-transform group-hover:scale-[1.02] sm:hidden"
            />
            <Logo
              height={32}
              primaryColor="var(--text-primary)"
              accentColor="var(--color-accent-500)"
              className="hidden transition-transform group-hover:scale-[1.02] sm:block"
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Desktop nav links */}
            <div className="hidden items-center gap-0.5 sm:flex sm:gap-1">
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
              {isAdmin && (
                <Link
                  to="/admin/users"
                  className={cn(
                    'relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    location.pathname.startsWith('/admin')
                      ? 'text-amber-600'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  Admin
                  {location.pathname.startsWith('/admin') && (
                    <span className="absolute inset-x-1 -bottom-[calc(0.5rem+1px)] h-0.5 rounded-full bg-amber-500" />
                  )}
                </Link>
              )}

              <div className="ml-3 h-6 w-px bg-[var(--border-primary)]" />
            </div>

            {/* Auth / notifications */}
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 sm:px-4 sm:py-2 sm:text-sm"
                  >
                    Entrar
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <NotificationCenter />
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

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex items-center justify-center rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] sm:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="5" x2="17" y2="5" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="15" x2="17" y2="15" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="border-t border-[var(--border-primary)] bg-[var(--surface-primary)] py-2 sm:hidden">
            {navLinks.map(({ to, label }) => {
              const active = location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
                  )}
                >
                  {label}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                to="/admin/users"
                onClick={closeMenu}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
                )}
              >
                Admin
                <span className="rounded-[var(--radius-sm)] bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Master
                </span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Main ── */}
      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8">
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
