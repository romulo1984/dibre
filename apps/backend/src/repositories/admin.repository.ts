import { prisma } from '../database/client.js'

export interface AdminUserRow {
  id: string
  clerkId: string
  email: string | null
  name: string | null
  role: string
  createdAt: Date
  _count: {
    players: number
    games: number
    ownedGroups: number
    groupMemberships: number
  }
}

export async function listUsers(params: {
  page: number
  perPage: number
  search?: string
}): Promise<{ users: AdminUserRow[]; total: number }> {
  const { page, perPage, search } = params
  const skip = (page - 1) * perPage

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            players: true,
            games: true,
            ownedGroups: true,
            groupMemberships: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return { users: users as AdminUserRow[], total }
}

export async function deleteUser(userId: string): Promise<{ clerkId: string } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { clerkId: true },
  })
  if (!user) return null

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { OR: [{ toUserId: userId }, { fromUserId: userId }] } }),
    prisma.groupInvitation.deleteMany({ where: { OR: [{ invitedUserId: userId }, { invitedByUserId: userId }] } }),
    prisma.groupJoinRequest.deleteMany({ where: { userId } }),
    prisma.groupMember.deleteMany({ where: { userId } }),
    prisma.player.updateMany({ where: { createdById: userId }, data: { createdById: null } }),
    prisma.game.updateMany({ where: { createdById: userId }, data: { createdById: null } }),
    prisma.group.deleteMany({ where: { ownerId: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ])

  return { clerkId: user.clerkId }
}

export async function getUserById(userId: string): Promise<AdminUserRow | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          players: true,
          games: true,
          ownedGroups: true,
          groupMemberships: true,
        },
      },
    },
  })
  return user as AdminUserRow | null
}
