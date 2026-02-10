import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '@/hooks/useAuthToken'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Card } from '@/components/ui/Card/Card'
import { Button } from '@/components/ui/Button/Button'
import { createGame } from '@/services/games.service'
import { BlurFade } from '@/components/magicui/blur-fade'

const inputClasses =
  'w-full rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:outline-none'

const labelClasses = 'mb-1.5 block text-sm font-medium text-[var(--text-secondary)]'

export function PeladaNewPage() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const getToken = useAuthToken()
  const [name, setName] = useState('')
  const [numberOfTeams, setNumberOfTeams] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-900/20">
        <span className="mb-2 text-3xl">🔒</span>
        <p className="font-medium text-amber-800 dark:text-amber-200">
          Faça login como admin para criar peladas.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('Não autenticado')
      const game = await createGame({ name: name.trim(), numberOfTeams }, token)
      navigate(`/peladas/${game.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>Nova pelada</PageHeader.Title>
            <PageHeader.Description>Defina o nome e a quantidade de times.</PageHeader.Description>
          </div>
        </PageHeader.Root>
      </BlurFade>
      <BlurFade delay={0.2}>
        <Card.Root>
          <Card.Content className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <span>⚠️</span> {error}
                </div>
              )}
              <div>
                <label className={labelClasses}>Nome da pelada</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                  placeholder="Ex: Pelada do domingo"
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Número de times</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={numberOfTeams}
                  onChange={(e) => setNumberOfTeams(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
              <div className="flex gap-3 border-t border-[var(--border-primary)] pt-5">
                <Button type="submit" loading={loading}>
                  Criar pelada
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/peladas')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card.Root>
      </BlurFade>
    </div>
  )
}
