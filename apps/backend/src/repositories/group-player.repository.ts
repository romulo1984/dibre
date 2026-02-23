import { prisma } from '../database/client.js'
import type { PlayerEntity } from '../domain/player.js'

function toPlayerEntity(row: {
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
  deletedAt: Date | null
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
    deletedAt: row.deletedAt ?? null,
  }
}

export async function findGroupPlayers(groupId: string): Promise<PlayerEntity[]> {
  const rows = await prisma.groupPlayer.findMany({
    where: { groupId, player: { deletedAt: null } },
    include: { player: true },
    orderBy: { player: { name: 'asc' } },
  })
  return rows.map((r) => toPlayerEntity(r.player))
}

export interface AvailablePlayer extends PlayerEntity {
  isInGroup: boolean
}

export async function findAvailablePlayers(
  groupId: string,
  ownerId: string
): Promise<AvailablePlayer[]> {
  const [allPlayers, groupPlayerRows] = await Promise.all([
    prisma.player.findMany({
      where: { createdById: ownerId, deletedAt: null },
      orderBy: { name: 'asc' },
    }),
    prisma.groupPlayer.findMany({
      where: { groupId },
      select: { playerId: true },
    }),
  ])

  const inGroupSet = new Set(groupPlayerRows.map((r) => r.playerId))

  return allPlayers.map((p) => ({
    ...toPlayerEntity(p),
    isInGroup: inGroupSet.has(p.id),
  }))
}

export async function syncGroupPlayers(
  groupId: string,
  playerIds: string[]
): Promise<void> {
  await prisma.$transaction([
    prisma.groupPlayer.deleteMany({ where: { groupId } }),
    ...(playerIds.length > 0
      ? [
          prisma.groupPlayer.createMany({
            data: playerIds.map((playerId) => ({ groupId, playerId })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ])
}

export async function addPlayerToGroup(groupId: string, playerId: string): Promise<void> {
  await prisma.groupPlayer.upsert({
    where: { groupId_playerId: { groupId, playerId } },
    create: { groupId, playerId },
    update: {},
  })
}

export async function removePlayerFromGroup(groupId: string, playerId: string): Promise<void> {
  await prisma.groupPlayer.deleteMany({ where: { groupId, playerId } })
}

export async function addNewPlayerToOwnerGroups(
  playerId: string,
  ownerId: string
): Promise<void> {
  const ownerGroups = await prisma.group.findMany({
    where: { ownerId, deletedAt: null },
    select: { id: true },
  })

  if (ownerGroups.length === 0) return

  await prisma.groupPlayer.createMany({
    data: ownerGroups.map((g) => ({ groupId: g.id, playerId })),
    skipDuplicates: true,
  })
}
