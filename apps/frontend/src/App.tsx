import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { Layout } from './components/layout/Layout.js'
import { HomePage } from './pages/HomePage.js'
import { PlayersPage } from './pages/PlayersPage.js'
import { PlayerDetailPage } from './pages/PlayerDetailPage.js'
import { PlayerNewPage } from './pages/PlayerNewPage.js'
import { PlayerEditPage } from './pages/PlayerEditPage.js'
import { PeladasPage } from './pages/PeladasPage.js'
import { PeladaDetailPage } from './pages/PeladaDetailPage.js'
import { PeladaNewPage } from './pages/PeladaNewPage.js'

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 p-6 dark:bg-neutral-950">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
        Chave do Clerk não configurada
      </h1>
      <p className="max-w-md text-center text-sm text-neutral-600 dark:text-neutral-400">
        Crie o arquivo <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">apps/frontend/.env</code> e
        defina <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">VITE_CLERK_PUBLISHABLE_KEY</code> com
        a chave pública do seu app em{' '}
        <a
          href="https://dashboard.clerk.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 underline hover:no-underline dark:text-emerald-400"
        >
          dashboard.clerk.com
        </a>
        . Sem isso o login (admin) não funciona; a visualização de jogadores e peladas pode funcionar se a API estiver no ar.
      </p>
      <p className="text-xs text-neutral-500">
        Depois de salvar o .env, reinicie o servidor de desenvolvimento (pnpm run dev:frontend).
      </p>
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
