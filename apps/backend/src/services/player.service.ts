import type { PlayerEntity } from '../domain/player.js'
import { STAR_MIN, STAR_MAX, validateAttributes } from '../domain/player.js'
import * as playerRepo from '../repositories/player.repository.js'

export async function listPlayers(): Promise<PlayerEntity[]> {
  return playerRepo.findAllPlayers()
}

export async function getPlayerById(id: string): Promise<PlayerEntity | null> {
  return playerRepo.findPlayerById(id)
}

export async function getPlayerWithParticipationCount(
  id: string
): Promise<{ player: PlayerEntity; participationCount: number } | null> {
  const player = await playerRepo.findPlayerById(id)
  if (!player) return null
  const participationCount = await playerRepo.countParticipations(id)
  return { player, participationCount }
}

export async function createPlayer(data: {
  name: string
  avatarUrl?: string | null
  stars: number
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
}): Promise<{ error?: string; player?: PlayerEntity }> {
  if (!data.name?.trim()) return { error: 'Name is required' }
  const attrs = {
    stars: data.stars,
    pass: data.pass,
    shot: data.shot,
    defense: data.defense,
    energy: data.energy,
    speed: data.speed,
  }
  if (!validateAttributes(attrs)) {
    return { error: `All attributes must be between ${STAR_MIN} and ${STAR_MAX}` }
  }
  const player = await playerRepo.createPlayer({
    name: data.name.trim(),
    avatarUrl: data.avatarUrl ?? null,
    ...attrs,
  })
  return { player }
}

export async function updatePlayer(
  id: string,
  data: Partial<{
    name: string
    avatarUrl: string | null
    stars: number
    pass: number
    shot: number
    defense: number
    energy: number
    speed: number
  }>
): Promise<{ error?: string; player?: PlayerEntity }> {
  const existing = await playerRepo.findPlayerById(id)
  if (!existing) return { error: 'Player not found' }
  if (data.name !== undefined && !data.name?.trim()) return { error: 'Name cannot be empty' }
  if (!validateAttributes(data)) {
    return { error: `All attributes must be between ${STAR_MIN} and ${STAR_MAX}` }
  }
  const updated = await playerRepo.updatePlayer(id, data)
  return { player: updated ?? existing }
}

export async function deletePlayer(id: string): Promise<{ error?: string; ok?: boolean }> {
  const ok = await playerRepo.deletePlayer(id)
  if (!ok) return { error: 'Player not found' }
  return { ok: true }
}
