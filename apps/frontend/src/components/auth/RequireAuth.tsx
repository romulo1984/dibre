import { Outlet, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { BlurFade } from '@/components/magicui/blur-fade'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { SignInButton } from '@clerk/clerk-react'

/**
 * Protege rotas que exigem usuário logado (jogadores, games, sorteios).
 * Se não estiver logado, mostra mensagem e botão de entrar.
 */
export function RequireAuth() {
  const location = useLocation()

  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <BlurFade delay={0.1}>
          <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
            <div className="mx-auto max-w-md rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-8 text-center shadow-lg">
              <span className="mb-4 inline-block text-4xl">🔐</span>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Faça login para acessar
              </h1>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Monte suas listas, equilibre os times e deixe o sorteio por nossa conta. Sua pelada
                mais organizada começa aqui.
              </p>
              <div className="mt-6">
                <SignInButton mode="modal" forceRedirectUrl={location.pathname}>
                  <ShimmerButton className="h-11 px-6 font-semibold shadow-lg">
                    Entrar
                  </ShimmerButton>
                </SignInButton>
              </div>
            </div>
          </div>
        </BlurFade>
      </SignedOut>
    </>
  )
}
