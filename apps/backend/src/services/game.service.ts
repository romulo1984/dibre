import type { GameEntity } from '../domain/game.js'
import type { TeamAssignment } from '../domain/game.js'
import * as gameRepo from '../repositories/game.repository.js'
import * as playerRepo from '../repositories/player.repository.js'
import { drawBalancedTeams } from './balance.service.js'

export async function listGames(ownerId: string): Promise<GameEntity[]> {
  return gameRepo.findAllGamesByOwner(ownerId)
}

export async function getGameById(id: string, ownerId: string): Promise<GameEntity | null> {
  return gameRepo.findGameByIdForOwner(id, ownerId)
}

export async function createGame(
  data: { name: string; numberOfTeams: number },
  ownerId: string
): Promise<{ error?: string; game?: GameEntity }> {
  if (!data.name?.trim()) return { error: 'Name is required' }
  if (data.numberOfTeams < 2) return { error: 'At least 2 teams required' }
  const game = await gameRepo.createGame({
    ...data,
    createdById: ownerId,
  })
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

export async function getGamePlayers(gameId: string, ownerId: string): Promise<string[]> {
  const game = await gameRepo.findGameByIdForOwner(gameId, ownerId)
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
  ownerId: string
): Promise<TeamAssignment[]> {
  const game = await gameRepo.findGameByIdForOwner(gameId, ownerId)
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

export async function deleteGame(
  id: string,
  ownerId: string
): Promise<{ error?: string; ok?: boolean }> {
  const ok = await gameRepo.deleteGame(id, ownerId)
  if (!ok) return { error: 'Game not found' }
  return { ok: true }
}
