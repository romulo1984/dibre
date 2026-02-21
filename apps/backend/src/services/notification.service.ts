import * as notifRepo from '../repositories/notification.repository.js'
import type { NotificationEntity } from '../domain/group.js'

export async function getNotificationsForUser(userId: string): Promise<NotificationEntity[]> {
  return notifRepo.findNotificationsForUser(userId)
}

export async function getUnreadCount(userId: string): Promise<number> {
  return notifRepo.countUnreadForUser(userId)
}

export async function markRead(
  id: string,
  userId: string
): Promise<{ error?: string; ok?: boolean }> {
  const ok = await notifRepo.markNotificationRead(id, userId)
  if (!ok) return { error: 'Notification not found' }
  return { ok: true }
}

export async function markAllRead(userId: string): Promise<void> {
  await notifRepo.markAllNotificationsRead(userId)
}
