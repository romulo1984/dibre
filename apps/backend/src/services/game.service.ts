import type { GameEntity } from '../domain/game.js'
import type { TeamAssignment } from '../domain/game.js'
import type { PlayerEntity } from '../domain/player.js'
import * as gameRepo from '../repositories/game.repository.js'
import * as playerRepo from '../repositories/player.repository.js'
import * as groupRepo from '../repositories/group.repository.js'
import { drawBalancedTeams } from './balance.service.js'

/**
 * Returns game if viewer is the owner OR is a member of the specific group the game belongs to.
 * Games without a groupId are private — only the owner can view them.
 */
async function resolveGameForViewer(id: string, viewerId: string): Promise<GameEntity | null> {
  const asOwner = await gameRepo.findGameByIdForOwner(id, viewerId)
  if (asOwner) return asOwner
  const game = await gameRepo.findGameById(id)
  if (!game || game.deletedAt) return null
  // Games not assigned to any group are private
  if (!game.groupId) return null
  const isMember = await groupRepo.isGroupMember(game.groupId, viewerId)
  return isMember ? game : null
}

export async function listGames(ownerId: string): Promise<GameEntity[]> {
  return gameRepo.findAllGamesByOwner(ownerId)
}

export async function getGameById(
  id: string,
  viewerId: string
): Promise<{ game: GameEntity; createdByName: string | null; isOwner: boolean } | null> {
  const game = await resolveGameForViewer(id, viewerId)
  if (!game) return null
  const isOwner = game.createdById === viewerId
  let createdByName: string | null = null
  if (!isOwner && game.createdById) {
    const creator = await groupRepo.findUserById(game.createdById)
    createdByName = creator?.name ?? creator?.email ?? null
  }
  return { game, createdByName, isOwner }
}

export async function createGame(
  data: { name: string; numberOfTeams: number; groupId?: string | null; teamColors?: Record<string, string> | null },
  ownerId: string,
): Promise<{ error?: string; game?: GameEntity }> {
  if (!data.name?.trim()) return { error: 'Name is required' }
  if (data.numberOfTeams < 2) return { error: 'At least 2 teams required' }
  if (data.groupId) {
    const isOwner = await groupRepo.isGroupOwner(data.groupId, ownerId)
    if (!isOwner) return { error: 'You are not the owner of this group' }
  }
  const game = await gameRepo.createGame({
    name: data.name,
    numberOfTeams: data.numberOfTeams,
    createdById: ownerId,
    groupId: data.groupId ?? null,
    teamColors: data.teamColors ?? null,
  })
  return { game }
}

export async function updateGame(
  id: string,
  ownerId: string,
  data: { groupId?: string | null; teamColors?: Record<string, string> | null },
): Promise<{ error?: string; game?: GameEntity }> {
  if (data.groupId) {
    const isOwner = await groupRepo.isGroupOwner(data.groupId, ownerId)
    if (!isOwner) return { error: 'You are not the owner of this group' }
  }
  const game = await gameRepo.updateGame(id, ownerId, data)
  if (!game) return { error: 'Game not found' }
  return { game }
}

export async function setGamePlayers(
  gameId: string,
  playerIds: string[],
  ownerId: string
): Promise<{ error?: string }> {
  const game = await gameRepo.findGameByIdForOwner(gameId, ownerId)
  if (!game) return { error: 'Game not found' }
  await gameRepo.setGamePlayers(gameId, playerIds)
  return {}
}

export async function getGamePlayers(gameId: string, viewerId: string): Promise<string[]> {
  const game = await resolveGameForViewer(gameId, viewerId)
  if (!game) return []
  return gameRepo.getGamePlayerIds(gameId)
}

export async function runDraw(
  gameId: string,
  ownerId: string
): Promise<{ error?: string; teams?: TeamAssignment[] }> {
  const game = await gameRepo.findGameByIdForOwner(gameId, ownerId)
  if (!game) return { error: 'Game not found' }
  const playerIds = await gameRepo.getGamePlayerIds(gameId)
  if (playerIds.length === 0) return { error: 'No players in this game' }
  const players = await playerRepo.findPlayersByIds(playerIds)
  if (players.length !== playerIds.length) return { error: 'Some players not found' }
  const teams = drawBalancedTeams(players, game.numberOfTeams)
  await gameRepo.saveTeams(gameId, teams)
  return { teams }
}

export async function getGameTeams(
  gameId: string,
  viewerId: string
): Promise<TeamAssignment[]> {
  const game = await resolveGameForViewer(gameId, viewerId)
  if (!game) return []
  const teams = await gameRepo.getTeamsByGameId(gameId)
  const allPlayerIds = [...new Set(teams.flatMap((t) => t.playerIds))]
  const players = await playerRepo.findPlayersByIds(allPlayerIds)
  const starsByPlayerId = new Map(players.map((p) => [p.id, p.stars]))
  return teams.map((t) => ({
    ...t,
    playerIdsWith5Stars: t.playerIds.filter((id) => starsByPlayerId.get(id) === 5),
    playerIdsWith1Star: t.playerIds.filter((id) => starsByPlayerId.get(id) === 1),
  }))
}

/** Returns full player data for all players in drawn teams — accessible to group members. */
export async function getGameTeamPlayers(
  gameId: string,
  viewerId: string
): Promise<PlayerEntity[]> {
  const game = await resolveGameForViewer(gameId, viewerId)
  if (!game) return []
  const teams = await gameRepo.getTeamsByGameId(gameId)
  const allPlayerIds = [...new Set(teams.flatMap((t) => t.playerIds))]
  if (allPlayerIds.length === 0) return []
  return playerRepo.findPlayersByIds(allPlayerIds)
}

export async function deleteGame(
  id: string,
  ownerId: string
): Promise<{ error?: string; ok?: boolean }> {
  const ok = await gameRepo.deleteGame(id, ownerId)
  if (!ok) return { error: 'Game not found' }
  return { ok: true }
}
