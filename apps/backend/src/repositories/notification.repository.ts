import { prisma } from '../database/client.js'
import type { NotificationEntity, NotificationType } from '../domain/group.js'

function toEntity(row: {
  id: string
  type: string
  toUserId: string
  fromUserId: string
  groupId: string | null
  relatedId: string | null
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
  fromUser?: { id: string; name: string | null; email: string | null }
  group?: { id: string; name: string; slug: string } | null
}): NotificationEntity {
  return {
    id: row.id,
    type: row.type as NotificationType,
    toUserId: row.toUserId,
    fromUserId: row.fromUserId,
    groupId: row.groupId,
    relatedId: row.relatedId,
    message: row.message,
    read: row.read,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    fromUser: row.fromUser,
    group: row.group ?? null,
  }
}

export async function createNotification(data: {
  type: NotificationType
  toUserId: string
  fromUserId: string
  groupId?: string | null
  relatedId?: string | null
  message: string
}): Promise<NotificationEntity> {
  const row = await prisma.notification.create({
    data: {
      type: data.type,
      toUserId: data.toUserId,
      fromUserId: data.fromUserId,
      groupId: data.groupId ?? null,
      relatedId: data.relatedId ?? null,
      message: data.message,
    },
    include: {
      fromUser: { select: { id: true, name: true, email: true } },
      group: { select: { id: true, name: true, slug: true } },
    },
  })
  return toEntity(row)
}

export async function findNotificationsForUser(userId: string): Promise<NotificationEntity[]> {
  const rows = await prisma.notification.findMany({
    where: { toUserId: userId },
    include: {
      fromUser: { select: { id: true, name: true, email: true } },
      group: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return rows.map(toEntity)
}

export async function countUnreadForUser(userId: string): Promise<number> {
  return prisma.notification.count({ where: { toUserId: userId, read: false } })
}

export async function markNotificationRead(id: string, userId: string): Promise<boolean> {
  try {
    await prisma.notification.updateMany({ where: { id, toUserId: userId }, data: { read: true } })
    return true
  } catch {
    return false
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({ where: { toUserId: userId, read: false }, data: { read: true } })
}
