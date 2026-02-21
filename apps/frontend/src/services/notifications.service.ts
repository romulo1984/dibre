import type { NotificationsResponse } from '@/domain/types'
import { api } from '@/services/api'

export async function getNotifications(token: string): Promise<NotificationsResponse> {
  return api.get<NotificationsResponse>('/notifications', token)
}

export async function markNotificationRead(id: string, token: string): Promise<void> {
  return api.patch<void>(`/notifications/${id}/read`, {}, token)
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  return api.post<void>('/notifications/read-all', {}, token)
}
