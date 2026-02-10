import { useState, type FormEvent } from 'react'
import type { Player } from '../../domain/types.js'
import { STAR_MIN, STAR_MAX, ATTRIBUTE_LABELS } from '../../domain/types.js'
import { Button } from '../../components/ui/Button/Button.js'

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
        avatarUrl: avatarUrl.trim() || null,
        stars,
        pass,
        shot,
        defense,
        energy,
        speed,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const slider = (label: string, value: number, setValue: (n: number) => void) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={STAR_MIN}
          max={STAR_MAX}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-6 text-right text-sm font-medium">{value}</span>
      </div>
    </label>
  )

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
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          placeholder="Nome do jogador"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Foto / avatar (URL, opcional)
        </label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {ATTRIBUTE_KEYS.map((key) =>
          slider(ATTRIBUTE_LABELS[key], stateByKey[key], setStateByKey[key])
        )}
      </div>
      <div className="flex gap-2">
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
