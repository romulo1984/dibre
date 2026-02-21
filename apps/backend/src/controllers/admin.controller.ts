import type { Request, Response } from 'express'
import * as adminService from '../services/admin.service.js'
import { z } from 'zod'

const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
})

export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const params = listUsersSchema.parse(req.query)
    const result = await adminService.listUsers(params)
    res.json(result)
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid parameters', details: e.errors })
      return
    }
    console.error(e)
    res.status(500).json({ error: 'Failed to list users' })
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const currentUserId = res.locals.userId as string

    if (id === currentUserId) {
      res.status(400).json({ error: 'Cannot delete your own account' })
      return
    }

    const deleted = await adminService.deleteUser(id)
    if (!deleted) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

export async function impersonate(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const token = await adminService.impersonateUser(id)
    if (!token) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to create impersonation token' })
  }
}
