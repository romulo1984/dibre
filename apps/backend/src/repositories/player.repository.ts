import { prisma } from '../database/client.js'
import type { PlayerEntity } from '../domain/player.js'

function toEntity(row: {
  id: string
  name: string
  avatarUrl: string | null
  stars: number
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
  createdById: string | null
  createdAt: Date
  updatedAt: Date
}): PlayerEntity {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatarUrl ?? null,
    stars: row.stars,
    pass: row.pass,
    shot: row.shot,
    defense: row.defense,
    energy: row.energy,
    speed: row.speed,
    createdById: row.createdById ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function findAllPlayersByOwner(ownerId: string): Promise<PlayerEntity[]> {
  const rows = await prisma.player.findMany({
    where: { createdById: ownerId },
    orderBy: { name: 'asc' },
  })
  return rows.map(toEntity)
}

export async function findPlayerById(id: string): Promise<PlayerEntity | null> {
  const row = await prisma.player.findUnique({ where: { id } })
  return row ? toEntity(row) : null
}

export async function findPlayerByIdForOwner(
  id: string,
  ownerId: string
): Promise<PlayerEntity | null> {
  const row = await prisma.player.findFirst({
    where: { id, createdById: ownerId },
  })
  return row ? toEntity(row) : null
}

export async function findPlayersByIds(ids: string[]): Promise<PlayerEntity[]> {
  if (ids.length === 0) return []
  const rows = await prisma.player.findMany({ where: { id: { in: ids } } })
  return rows.map(toEntity)
}

export async function createPlayer(data: {
  name: string
  avatarUrl?: string | null
  createdById: string
  stars: number
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
}): Promise<PlayerEntity> {
  const row = await prisma.player.create({ data })
  return toEntity(row)
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
): Promise<PlayerEntity | null> {
  const row = await prisma.player.update({ where: { id }, data })
  return row ? toEntity(row) : null
}

export async function deletePlayer(id: string): Promise<boolean> {
  try {
    await prisma.player.delete({ where: { id } })
    return true
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025')
      return false
    throw e
  }
}

export async function countParticipations(playerId: string): Promise<number> {
  return prisma.gamePlayer.count({ where: { playerId } })
}
