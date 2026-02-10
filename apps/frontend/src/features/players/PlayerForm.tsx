import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import type { Player } from '@/domain/types'
import { STAR_MIN, STAR_MAX, ATTRIBUTE_LABELS } from '@/domain/types'
import { Button } from '@/components/ui/Button/Button'
import { compressImageToBase64 } from '@/utils/avatarImage'
import { cn } from '@/lib/utils'

interface PlayerFormProps {
  initial?: Partial<Player>
  onSubmit: (data: {
    name: string
    avatarUrl?: string | null
    stars: number
    pass: number
    shot: number
    defense: number
    energy: number
    speed: number
  }) => Promise<void>
  onCancel?: () => void
}

const ATTRIBUTE_KEYS: (keyof Pick<
  Player,
  'stars' | 'pass' | 'shot' | 'defense' | 'energy' | 'speed'
>)[] = ['stars', 'pass', 'shot', 'defense', 'energy', 'speed']

const inputClasses =
  'w-full rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-all focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:outline-none'

const labelClasses = 'mb-1.5 block text-sm font-medium text-[var(--text-secondary)]'

export function PlayerForm({ initial, onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? '')
  const [stars, setStars] = useState(initial?.stars ?? 3)
  const [pass, setPass] = useState(initial?.pass ?? 3)
  const [shot, setShot] = useState(initial?.shot ?? 3)
  const [defense, setDefense] = useState(initial?.defense ?? 3)
  const [energy, setEnergy] = useState(initial?.energy ?? 3)
  const [speed, setSpeed] = useState(initial?.speed ?? 3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        avatarUrl: avatarUrl?.trim() || null,
        stars,
        pass,
        shot,
        defense,
        energy,
        speed,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      setAvatarError(null)
    } finally {
      setLoading(false)
    }
  }

  const slider = (label: string, value: number, setValue: (n: number) => void) => (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={STAR_MIN}
          max={STAR_MAX}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="flex-1 accent-[var(--color-brand-500)]"
        />
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-lg text-sm font-bold',
            value >= 4
              ? 'bg-[var(--color-brand-100)] text-[var(--color-brand-700)]'
              : value <= 2
                ? 'bg-red-100 text-red-700'
                : 'bg-[var(--surface-tertiary)] text-[var(--text-primary)]',
          )}
        >
          {value}
        </span>
      </div>
    </label>
  )

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError(null)
    try {
      const dataUrl = await compressImageToBase64(file)
      setAvatarUrl(dataUrl)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Erro ao processar a imagem')
    }
    e.target.value = ''
  }

  const stateByKey = { stars, pass, shot, defense, energy, speed } as const
  const setStateByKey = {
    stars: setStars,
    pass: setPass,
    shot: setShot,
    defense: setDefense,
    energy: setEnergy,
    speed: setSpeed,
  } as const

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span className="text-base">⚠️</span>
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className={labelClasses}>Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
          placeholder="Nome do jogador"
          required
        />
      </div>

      {/* Avatar */}
      <div>
        <span className={labelClasses}>Foto do jogador (opcional)</span>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          A imagem será recortada em quadrado e comprimida automaticamente.
        </p>
        {avatarUrl && (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) ? (
          <div className="flex flex-wrap items-center gap-4">
            <img
              src={avatarUrl}
              alt="Preview do avatar"
              className="size-20 rounded-full object-cover ring-2 ring-[var(--color-brand-200)] ring-offset-2 ring-offset-[var(--surface-primary)]"
            />
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Trocar foto
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl('')} className="text-red-600">
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Escolher imagem
            </Button>
            <p className="text-sm text-[var(--text-tertiary)]">ou cole uma URL:</p>
            <input
              type="url"
              value={avatarUrl ?? ''}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className={inputClasses}
              placeholder="https://..."
            />
          </div>
        )}
        {avatarError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{avatarError}</p>}
      </div>

      {/* Attributes */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Atributos
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {ATTRIBUTE_KEYS.map((key) =>
            slider(ATTRIBUTE_LABELS[key], stateByKey[key], setStateByKey[key]),
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-[var(--border-primary)] pt-6">
        <Button type="submit" loading={loading}>
          {initial?.id ? 'Atualizar' : 'Cadastrar'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
