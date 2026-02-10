import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { PlayersPage } from '@/pages/PlayersPage'
import { PlayerDetailPage } from '@/pages/PlayerDetailPage'
import { PlayerNewPage } from '@/pages/PlayerNewPage'
import { PlayerEditPage } from '@/pages/PlayerEditPage'
import { PeladasPage } from '@/pages/PeladasPage'
import { PeladaDetailPage } from '@/pages/PeladaDetailPage'
import { PeladaNewPage } from '@/pages/PeladaNewPage'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || ''

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/new" element={<PlayerNewPage />} />
          <Route path="players/:id" element={<PlayerDetailPage />} />
          <Route path="players/:id/edit" element={<PlayerEditPage />} />
          <Route path="peladas" element={<PeladasPage />} />
          <Route path="peladas/new" element={<PeladaNewPage />} />
          <Route path="peladas/:id" element={<PeladaDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function ClerkMissingMessage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--surface-secondary)] p-6">
      <div className="mx-auto max-w-md rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-8 text-center shadow-lg">
        <span className="mb-4 inline-block text-4xl">🔑</span>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Chave do Clerk não configurada
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Crie o arquivo{' '}
          <code className="rounded-md bg-[var(--surface-tertiary)] px-1.5 py-0.5 text-xs font-medium">
            apps/frontend/.env
          </code>{' '}
          e defina{' '}
          <code className="rounded-md bg-[var(--surface-tertiary)] px-1.5 py-0.5 text-xs font-medium">
            VITE_CLERK_PUBLISHABLE_KEY
          </code>{' '}
          com a chave pública do seu app em{' '}
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brand-600)] underline hover:no-underline"
          >
            dashboard.clerk.com
          </a>
          .
        </p>
        <p className="mt-4 text-xs text-[var(--text-tertiary)]">
          Reinicie o servidor após salvar o .env (pnpm run dev:frontend).
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!clerkPubKey) {
    return <ClerkMissingMessage />
  }
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppContent />
    </ClerkProvider>
  )
}
