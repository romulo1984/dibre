import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader/PageHeader.js'

export function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader.Root>
        <div>
          <PageHeader.Title>dib.re</PageHeader.Title>
          <PageHeader.Description>
            Avalie atletas da pelada e gere times equilibrados automaticamente.
          </PageHeader.Description>
        </div>
      </PageHeader.Root>
      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          to="/players"
          className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Jogadores</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Cadastre jogadores e defina estrelas e atributos técnicos.
          </p>
        </Link>
        <Link
          to="/peladas"
          className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Peladas</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Crie peladas, selecione jogadores e faça o sorteio equilibrado.
          </p>
        </Link>
      </div>
    </div>
  )
}
