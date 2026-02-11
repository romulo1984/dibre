import type { PlayerEntity } from '../domain/player.js'
import { STAR_MIN, STAR_MAX, validateAttributes } from '../domain/player.js'
import * as gameRepo from '../repositories/game.repository.js'
import * as playerRepo from '../repositories/player.repository.js'

export interface PlayerProfileGame {
  id: string
  name: string
  createdAt: Date
}

export interface PlayerProfileTeammate {
  player: PlayerEntity
  timesTogether: number
}

export async function listPlayers(ownerId: string): Promise<PlayerEntity[]> {
  return playerRepo.findAllPlayersByOwner(ownerId)
}

export async function getPlayerById(id: string, ownerId: string): Promise<PlayerEntity | null> {
  return playerRepo.findPlayerByIdForOwner(id, ownerId)
}

export async function getPlayerWithParticipationCount(
  id: string,
  ownerId: string
): Promise<{ player: PlayerEntity; participationCount: number } | null> {
  const player = await playerRepo.findPlayerByIdForOwner(id, ownerId)
  if (!player) return null
  const participationCount = await playerRepo.countParticipations(id)
  return { player, participationCount }
}

/** Perfil completo: jogador, contagem de participações, peladas e top 5 parceiros (mesmo time). */
export async function getPlayerProfile(
  id: string,
  ownerId: string
): Promise<{
  player: PlayerEntity
  participationCount: number
  games: PlayerProfileGame[]
  teammates: PlayerProfileTeammate[]
} | null> {
  const base = await getPlayerWithParticipationCount(id, ownerId)
  if (!base) return null

  const games = await playerRepo.findParticipatedGames(id, ownerId)

  const countByPlayerId = new Map<string, number>()
  for (const g of games) {
    const teams = await gameRepo.getTeamsByGameId(g.id)
    for (const team of teams) {
      if (!team.playerIds.includes(id)) continue
      for (const otherId of team.playerIds) {
        if (otherId === id) continue
        countByPlayerId.set(otherId, (countByPlayerId.get(otherId) ?? 0) + 1)
      }
    }
  }
  const topIds = Array.from(countByPlayerId.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([playerId]) => playerId)
  const teammatePlayers = await playerRepo.findPlayersByIds(topIds)
  const teammates: PlayerProfileTeammate[] = topIds
    .map((playerId) => {
      const player = teammatePlayers.find((p) => p.id === playerId)
      const timesTogether = countByPlayerId.get(playerId) ?? 0
      return player ? { player, timesTogether } : null
    })
    .filter((t): t is PlayerProfileTeammate => t != null)

  return {
    player: base.player,
    participationCount: base.participationCount,
    games,
    teammates,
  }
}

export async function createPlayer(
  data: {
    name: string
    avatarUrl?: string | null
    stars: number
    pass: number
    shot: number
    defense: number
    energy: number
    speed: number
  },
  ownerId: string
): Promise<{ error?: string; player?: PlayerEntity }> {
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
    createdById: ownerId,
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
  }>,
  ownerId: string
): Promise<{ error?: string; player?: PlayerEntity }> {
  const existing = await playerRepo.findPlayerByIdForOwner(id, ownerId)
  if (!existing) return { error: 'Player not found' }
  if (data.name !== undefined && !data.name?.trim()) return { error: 'Name cannot be empty' }
  if (!validateAttributes(data)) {
    return { error: `All attributes must be between ${STAR_MIN} and ${STAR_MAX}` }
  }
  const updated = await playerRepo.updatePlayer(id, data)
  return { player: updated ?? existing }
}

export async function deletePlayer(
  id: string,
  ownerId: string
): Promise<{ error?: string; ok?: boolean }> {
  const existing = await playerRepo.findPlayerByIdForOwner(id, ownerId)
  if (!existing) return { error: 'Player not found' }
  const ok = await playerRepo.deletePlayer(id)
  if (!ok) return { error: 'Player not found' }
  return { ok: true }
}
