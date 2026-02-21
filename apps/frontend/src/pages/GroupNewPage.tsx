import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader/PageHeader'
import { Button } from '@/components/ui/Button/Button'
import { createGroup } from '@/services/groups.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import { BlurFade } from '@/components/magicui/blur-fade'

export function GroupNewPage() {
  const getToken = useAuthToken()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const token = await getToken()
      if (!token) return
      const group = await createGroup({ name: name.trim(), description: description.trim() || null }, token)
      navigate(`/groups/${group.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grupo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <BlurFade delay={0.1}>
        <PageHeader.Root>
          <div>
            <PageHeader.Title>Novo grupo</PageHeader.Title>
            <PageHeader.Description>
              Crie um grupo e convide outros usuários para visualizar suas peladas e jogadores.
            </PageHeader.Description>
          </div>
        </PageHeader.Root>
      </BlurFade>

      <BlurFade delay={0.15}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-sm)]">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Nome do grupo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  placeholder="Ex: Pelada do Trabalho"
                  required
                  className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Descrição <span className="text-[var(--text-tertiary)] text-xs font-normal">(opcional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Descreva o grupo..."
                  className="w-full resize-none rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" loading={saving} disabled={!name.trim()}>
              Criar grupo
            </Button>
            <Link to="/groups">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </form>
      </BlurFade>
    </div>
  )
}
