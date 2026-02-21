import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthToken } from '@/hooks/useAuthToken'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Card } from '@/components/ui/Card/Card'
import { Button } from '@/components/ui/Button/Button'
import { DateTimeField } from '@/components/ui/DateTimeField'
import { TeamsNumberInput } from '@/components/ui/TeamsNumberInput'
import { TeamColorPicker } from '@/features/games/TeamColorPicker'
import { createGame } from '@/services/games.service'
import { listGroups } from '@/services/groups.service'
import { formatGameDate, parseDateTimeLocal } from '@/utils/dateFormat'
import { BlurFade } from '@/components/magicui/blur-fade'
import type { Group } from '@/domain/types'

const inputClasses =
  'w-full rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:outline-none'

const labelClasses = 'mb-1.5 block text-sm font-medium text-[var(--text-secondary)]'

function buildGameName(nameTrimmed: string, dateTimeValue: string): string {
  const date = parseDateTimeLocal(dateTimeValue)
  const dateStr = date ? formatGameDate(date) : ''

  if (nameTrimmed && dateStr) {
    return `${nameTrimmed} (${dateStr})`
  }
  if (dateStr) {
    return `Pelada de ${dateStr}`
  }
  return nameTrimmed
}

export function GameNewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const getToken = useAuthToken()

  const preselectedGroupId = searchParams.get('groupId')

  const [name, setName] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [numberOfTeams, setNumberOfTeams] = useState(2)
  const [groupId, setGroupId] = useState<string | null>(preselectedGroupId)
  const [teamColors, setTeamColors] = useState<Record<string, string>>({})
  const [ownedGroups, setOwnedGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; dateTime?: string }>({})

  useEffect(() => {
    let cancelled = false
    getToken().then(async (token) => {
      if (cancelled || !token) return
      try {
        const data = await listGroups(token)
        if (!cancelled) {
          setOwnedGroups(
            data.groups.filter((g) => g.ownerId === data.currentUserId && !g.deletedAt)
          )
        }
      } catch {
        // silent
      }
    })
    return () => {
      cancelled = true
    }
  }, [getToken])

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

    const finalName = buildGameName(nameTrimmed, dateTime)
    const colorsToSend = Object.keys(teamColors).length > 0 ? teamColors : null

    setLoading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('Não autenticado')
      const game = await createGame(
        { name: finalName, numberOfTeams, groupId, teamColors: colorsToSend },
        token
      )
      navigate(`/games/${game.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar')
    } finally {
      setLoading(false)
    }
  }

  const selectedGroup = ownedGroups.find((g) => g.id === groupId)

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
                  <span aria-hidden>&#x26A0;&#xFE0F;</span> {error}
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
                    <p
                      id="name-error"
                      className="text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
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
                  onChange={(n) => {
                    setNumberOfTeams(n)
                    const pruned: Record<string, string> = {}
                    for (let i = 1; i <= n; i++) {
                      if (teamColors[String(i)]) pruned[String(i)] = teamColors[String(i)]
                    }
                    setTeamColors(pruned)
                  }}
                  label="Quantos times?"
                />
              </div>

              {/* Group selector */}
              {ownedGroups.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelClasses}>Grupo (opcional)</label>
                  <select
                    value={groupId ?? ''}
                    onChange={(e) => setGroupId(e.target.value || null)}
                    className={inputClasses}
                  >
                    <option value="">Pelada avulsa (sem grupo)</option>
                    {ownedGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  {selectedGroup && (
                    <p className="text-xs text-[var(--text-tertiary)]">
                      A pelada será vinculada ao grupo &ldquo;{selectedGroup.name}&rdquo; e visível
                      para os membros.
                    </p>
                  )}
                </div>
              )}

              {/* Team colors */}
              <TeamColorPicker
                numberOfTeams={numberOfTeams}
                teamColors={teamColors}
                onChange={setTeamColors}
              />

              <div className="flex flex-wrap gap-3 border-t border-[var(--border-primary)] pt-6">
                <Button type="submit" loading={loading}>
                  Criar pelada
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
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
