export const STAR_MIN = 1
export const STAR_MAX = 5

export interface PlayerAttributes {
  stars: number
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
}

export interface PlayerEntity extends PlayerAttributes {
  id: string
  name: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export function validateAttributes(attrs: Partial<PlayerAttributes>): boolean {
  const range = [STAR_MIN, STAR_MAX] as const
  const keys: (keyof PlayerAttributes)[] = ['stars', 'pass', 'shot', 'defense', 'energy', 'speed']
  for (const key of keys) {
    const v = attrs[key]
    if (v != null && (typeof v !== 'number' || v < range[0] || v > range[1])) return false
  }
  return true
}

export function averageAttributes(attrs: PlayerAttributes): number {
  const { stars, pass, shot, defense, energy, speed } = attrs
  return (stars + pass + shot + defense + energy + speed) / 6
}
