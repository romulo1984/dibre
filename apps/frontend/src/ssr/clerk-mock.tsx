/**
 * Mock do @clerk/clerk-react para SSR / pre-rendering.
 *
 * Durante o build SSR, o Vite substitui as importações de @clerk/clerk-react
 * por este módulo (via alias em vite.config.ts).
 *
 * O comportamento simula o estado "deslogado", que é o que um visitante
 * novo (ou crawler de SEO) veria ao acessar o site.
 */

import type { PropsWithChildren, ReactNode } from 'react'

/* ── Providers ── */

export function ClerkProvider({ children }: PropsWithChildren) {
  return <>{children}</>
}

/* ── Componentes de visibilidade ── */

export function SignedIn(_props: { children?: ReactNode }) {
  return null // ninguém está logado durante SSR
}

export function SignedOut({ children }: { children?: ReactNode }) {
  return <>{children}</> // mostra conteúdo de "deslogado"
}

/* ── Botões / UI ── */

export function SignInButton({
  children,
}: PropsWithChildren<{ mode?: string; forceRedirectUrl?: string }>) {
  return <>{children}</>
}

export function UserButton(_props: Record<string, unknown>) {
  return null
}

/* ── Hooks (caso sejam usados em componentes renderizados no SSR) ── */

export function useAuth() {
  return {
    isSignedIn: false,
    isLoaded: false,
    userId: null,
    sessionId: null,
    orgId: null,
    getToken: () => Promise.resolve(null),
  }
}

export function useUser() {
  return { user: null, isSignedIn: false, isLoaded: false }
}

export function useClerk() {
  return {}
}

export function useSession() {
  return { session: null, isSignedIn: false, isLoaded: false }
}
