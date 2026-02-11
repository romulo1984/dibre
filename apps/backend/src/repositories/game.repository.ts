import { prisma } from '../database/client.js'
import type { GameEntity } from '../domain/game.js'
import type { TeamAssignment, TeamRecord } from '../domain/game.js'

function toGameEntity(row: {
  id: string
  name: string
  numberOfTeams: number
  createdById: string | null
  createdAt: Date
  updatedAt: Date
}): GameEntity {
  return {
    id: row.id,
    name: row.name,
    numberOfTeams: row.numberOfTeams,
    createdById: row.createdById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function findAllGamesByOwner(ownerId: string): Promise<GameEntity[]> {
  const rows = await prisma.game.findMany({
    where: { createdById: ownerId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(toGameEntity)
}

export async function findGameById(id: string): Promise<GameEntity | null> {
  const row = await prisma.game.findUnique({ where: { id } })
  return row ? toGameEntity(row) : null
}

export async function findGameByIdForOwner(
  id: string,
  ownerId: string
): Promise<GameEntity | null> {
  const row = await prisma.game.findFirst({
    where: { id, createdById: ownerId },
  })
  return row ? toGameEntity(row) : null
}

export async function createGame(data: {
  name: string
  numberOfTeams: number
  createdById: string
}): Promise<GameEntity> {
  const row = await prisma.game.create({ data })
  return toGameEntity(row)
}

export async function setGamePlayers(gameId: string, playerIds: string[]): Promise<void> {
  await prisma.gamePlayer.deleteMany({ where: { gameId } })
  if (playerIds.length > 0) {
    await prisma.gamePlayer.createMany({
      data: playerIds.map((playerId) => ({ gameId, playerId })),
    })
  }
}

export async function getGamePlayerIds(gameId: string): Promise<string[]> {
  const rows = await prisma.gamePlayer.findMany({
    where: { gameId },
    select: { playerId: true },
  })
  return rows.map((r: { playerId: string }) => r.playerId)
}

export async function saveTeams(gameId: string, assignments: TeamAssignment[]): Promise<void> {
  await prisma.team.deleteMany({ where: { gameId } })
  await prisma.team.createMany({
    data: assignments.map((t) => ({
      gameId,
      name: t.teamName,
      order: t.order,
      playerIds: JSON.stringify(t.playerIds),
      avgStars: t.avgStars,
      avgPass: t.avgPass,
      avgShot: t.avgShot,
      avgDefense: t.avgDefense,
      avgEnergy: t.avgEnergy,
      avgSpeed: t.avgSpeed,
    })),
  })
}

export async function getTeamsByGameId(gameId: string): Promise<TeamRecord[]> {
  const rows = await prisma.team.findMany({
    where: { gameId },
    orderBy: { order: 'asc' },
  })
  return rows.map(
    (r: {
      name: string
      order: number
      playerIds: string
      avgStars: number | null
      avgPass: number | null
      avgShot: number | null
      avgDefense: number | null
      avgEnergy: number | null
      avgSpeed: number | null
    }) => ({
      teamName: r.name,
      order: r.order,
      playerIds: JSON.parse(r.playerIds) as string[],
      avgStars: r.avgStars ?? 0,
      avgPass: r.avgPass ?? 0,
      avgShot: r.avgShot ?? 0,
      avgDefense: r.avgDefense ?? 0,
      avgEnergy: r.avgEnergy ?? 0,
      avgSpeed: r.avgSpeed ?? 0,
    })
  )
}

export async function deleteGame(id: string, ownerId: string): Promise<boolean> {
  const result = await prisma.game.deleteMany({ where: { id, createdById: ownerId } })
  return result.count > 0
}
