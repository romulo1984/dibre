import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthToken } from '@/hooks/useAuthToken'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Card } from '@/components/ui/Card/Card'
import { Button } from '@/components/ui/Button/Button'
import { DateTimeField } from '@/components/ui/DateTimeField'
import { TeamsNumberInput } from '@/components/ui/TeamsNumberInput'
import { createGame } from '@/services/games.service'
import { formatPeladaDate, parseDateTimeLocal } from '@/utils/dateFormat'
import { BlurFade } from '@/components/magicui/blur-fade'

const inputClasses =
  'w-full rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:outline-none'

const labelClasses = 'mb-1.5 block text-sm font-medium text-[var(--text-secondary)]'

function buildPeladaName(nameTrimmed: string, dateTimeValue: string): string {
  const date = parseDateTimeLocal(dateTimeValue)
  const dateStr = date ? formatPeladaDate(date) : ''

  if (nameTrimmed && dateStr) {
    return `${nameTrimmed} (${dateStr})`
  }
  if (dateStr) {
    return `Pelada de ${dateStr}`
  }
  return nameTrimmed
}

export function PeladaNewPage() {
  const navigate = useNavigate()
  const getToken = useAuthToken()
  const [name, setName] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [numberOfTeams, setNumberOfTeams] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; dateTime?: string }>({})

  const nameTrimmed = name.trim()
  const hasName = nameTrimmed.length > 0
  const hasDateTime = dateTime.length >= 16
  const atLeastOne = hasName || hasDateTime

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!atLeastOne) {
      setFieldErrors({
        name: 'Informe o nome da pelada ou a data e hora.',
        dateTime: 'Informe o nome da pelada ou a data e hora.',
      })
      setError('Preencha pelo menos o nome da pelada ou a data e hora.')
      return
    }

    const finalName = buildPeladaName(nameTrimmed, dateTime)

    setLoading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('Não autenticado')
      const game = await createGame({ name: finalName, numberOfTeams }, token)
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
            <PageHeader.Description>
              Defina o nome e a data, e a quantidade de times. Pelo menos nome ou data/hora.
            </PageHeader.Description>
          </div>
        </PageHeader.Root>
      </BlurFade>
      <BlurFade delay={0.2}>
        <Card.Root className="overflow-hidden">
          <Card.Content className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                  role="alert"
                >
                  <span aria-hidden>⚠️</span> {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClasses}>Nome da pelada</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputClasses} ${fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Ex: Pelada do domingo"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>
                <DateTimeField
                  value={dateTime}
                  onChange={setDateTime}
                  label="Data e hora"
                  placeholder="Selecione data e hora"
                  error={fieldErrors.dateTime}
                />
              </div>

              <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)]/50 p-5">
                <TeamsNumberInput
                  value={numberOfTeams}
                  onChange={setNumberOfTeams}
                  label="Quantos times?"
                />
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[var(--border-primary)] pt-6">
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
