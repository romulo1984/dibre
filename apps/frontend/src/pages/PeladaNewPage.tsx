import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthToken } from '../hooks/useAuthToken.js'
import { PageHeader } from '../components/ui/PageHeader/PageHeader.js'
import { Card } from '../components/ui/Card/Card.js'
import { Button } from '../components/ui/Button/Button.js'
import { createGame } from '../services/games.service.js'

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
      <div className="rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        Faça login como admin para criar peladas.
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
      <PageHeader.Root>
        <div>
          <PageHeader.Title>Nova pelada</PageHeader.Title>
          <PageHeader.Description>Defina o nome e a quantidade de times.</PageHeader.Description>
        </div>
      </PageHeader.Root>
      <Card.Root>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nome da pelada
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="Ex: Pelada do domingo"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Número de times
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={numberOfTeams}
                onChange={(e) => setNumberOfTeams(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            <div className="flex gap-2">
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
    </div>
  )
}
