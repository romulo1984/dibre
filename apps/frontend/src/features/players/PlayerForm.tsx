import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import type { Player } from '@/domain/types'
import { STAR_MIN, STAR_MAX, ATTRIBUTE_LABELS } from '@/domain/types'
import { Button } from '@/components/ui/Button/Button'
import { AttributeRadarChart } from '@/features/players/AttributeRadarChart'
import { PlayerAvatar } from '@/features/players/PlayerAvatar'
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

/** Apenas atributos técnicos (sliders + radar); estrelas têm seletor próprio */
const TECHNICAL_ATTRIBUTE_KEYS: (keyof Pick<
  Player,
  'pass' | 'shot' | 'defense' | 'energy' | 'speed'
>)[] = ['pass', 'shot', 'defense', 'energy', 'speed']

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
  const cameraInputRef = useRef<HTMLInputElement>(null)

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

  const stateByKey = { pass, shot, defense, energy, speed } as const
  const setStateByKey = {
    pass: setPass,
    shot: setShot,
    defense: setDefense,
    energy: setEnergy,
    speed: setSpeed,
  } as const

  const technicalAttributes = {
    pass,
    shot,
    defense,
    energy,
    speed,
  }

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
          A imagem será recortada e comprimida (proporção 3×4).
        </p>

        {/* Inputs ocultos: galeria e câmera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {avatarUrl && (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-secondary)]">
            {/* Preview grande da foto */}
            <div className="flex items-center justify-center bg-[var(--surface-tertiary)] p-6">
              <PlayerAvatar
                player={{ name: name || 'Jogador', avatarUrl }}
                variant="rect"
                size="lg"
                className="rounded-xl shadow-lg ring-2 ring-[var(--color-brand-200)] ring-offset-4 ring-offset-[var(--surface-tertiary)]"
              />
            </div>

            {/* Ações */}
            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-primary)] p-3">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                🖼️ Galeria
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => cameraInputRef.current?.click()}>
                📷 Câmera
              </Button>
              <div className="flex-1" />
              <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl('')} className="text-red-600">
                Remover
              </Button>
            </div>

            {/* Base64 readonly */}
            {avatarUrl.startsWith('data:') && (
              <div className="border-t border-[var(--border-primary)] p-3">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Base64 da imagem
                </label>
                <textarea
                  readOnly
                  value={avatarUrl}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2 font-mono text-[10px] text-[var(--text-tertiary)] focus:outline-none"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-[var(--border-secondary)] bg-[var(--surface-tertiary)] p-8">
            <div className="flex size-20 items-center justify-center rounded-full bg-[var(--surface-secondary)]">
              <span className="text-3xl text-[var(--text-tertiary)]">📸</span>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">Adicione uma foto do jogador</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                🖼️ Galeria
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => cameraInputRef.current?.click()}>
                📷 Câmera
              </Button>
            </div>
          </div>
        )}
        {avatarError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{avatarError}</p>}
      </div>

      {/* Estrelas: 5 clicáveis (clique na Nª estrela = valor N) */}
      <div>
        <span className={labelClasses}>{ATTRIBUTE_LABELS.stars}</span>
        <div className="mt-2 flex items-center gap-1" role="group" aria-label="Quantidade de estrelas">
          {(Array.from({ length: STAR_MAX }, (_, i) => i + 1) as (1 | 2 | 3 | 4 | 5)[]).map(
            (n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                className={cn(
                  'rounded p-0.5 text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2',
                  stars >= n
                    ? 'text-[var(--color-accent-500)] hover:opacity-90'
                    : 'text-[var(--surface-tertiary)] hover:text-[var(--text-tertiary)]',
                )}
                aria-pressed={stars === n}
                aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
              >
                {stars >= n ? '★' : '☆'}
              </button>
            ),
          )}
          <span className="ml-2 text-sm font-medium text-[var(--text-secondary)]">{stars}</span>
        </div>
      </div>

      {/* Atributos técnicos: sliders + radar em tempo real */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Atributos técnicos
        </h3>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="min-w-0 flex-1 grid gap-4 sm:grid-cols-2">
            {TECHNICAL_ATTRIBUTE_KEYS.map((key) =>
              slider(ATTRIBUTE_LABELS[key], stateByKey[key], setStateByKey[key]),
            )}
          </div>
          <div className="shrink-0">
            <AttributeRadarChart
              attributes={technicalAttributes}
              size={220}
              ariaLabel="Preview dos atributos em tempo real"
            />
          </div>
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
