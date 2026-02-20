import type { Request, Response } from 'express'
import * as notifService from '../services/notification.service.js'

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string
    const notifications = await notifService.getNotificationsForUser(userId)
    const unreadCount = await notifService.getUnreadCount(userId)
    res.json({ notifications, unreadCount })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to list notifications' })
  }
}

export async function markRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await notifService.markRead(id, userId)
    if (result.error) {
      res.status(404).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string
    await notifService.markAllRead(userId)
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to mark all notifications as read' })
  }
}
