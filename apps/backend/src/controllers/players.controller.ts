import type { Request, Response } from 'express'
import * as playerService from '../services/player.service.js'
import { z } from 'zod'

const MAX_AVATAR_BASE64_LENGTH = 500_000 // ~375KB em base64

const avatarSchema = z
  .string()
  .optional()
  .nullable()
  .transform((s) => (s === '' || s == null ? null : s))
  .refine(
    (s) => {
      if (s == null) return true
      if (s.startsWith('data:image/') && s.includes(';base64,')) {
        return s.length <= MAX_AVATAR_BASE64_LENGTH
      }
      if (s.startsWith('http://') || s.startsWith('https://')) {
        return s.length <= 2000
      }
      return false
    },
    { message: 'Avatar deve ser uma URL (http/https) ou imagem em base64 (até ~375KB)' }
  )

const createPlayerSchema = z.object({
  name: z.string().min(1).max(200),
  avatarUrl: avatarSchema,
  stars: z.number().int().min(1).max(5),
  pass: z.number().int().min(1).max(5),
  shot: z.number().int().min(1).max(5),
  defense: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  speed: z.number().int().min(1).max(5),
})

const updatePlayerSchema = createPlayerSchema.partial()

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string
    const players = await playerService.listPlayers(userId)
    res.json(players)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to list players' })
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await playerService.getPlayerProfile(id, userId)
    if (!result) {
      res.status(404).json({ error: 'Player not found' })
      return
    }
    res.json({
      player: result.player,
      participationCount: result.participationCount,
      isOwner: result.isOwner,
      createdByName: result.createdByName,
      games: result.games.map((g) => ({
        id: g.id,
        name: g.name,
        createdAt: g.createdAt.toISOString(),
        deletedAt: g.deletedAt ? g.deletedAt.toISOString() : null,
      })),
      teammates: result.teammates.map((t) => ({
        player: t.player,
        timesTogether: t.timesTogether,
      })),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get player' })
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createPlayerSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
      return
    }
    const userId = res.locals.userId as string
    const result = await playerService.createPlayer(parsed.data, userId)
    if (result.error) {
      res.status(400).json({ error: result.error })
      return
    }
    res.status(201).json(result.player)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to create player' })
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const parsed = updatePlayerSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
      return
    }
    const userId = res.locals.userId as string
    const result = await playerService.updatePlayer(id, parsed.data, userId)
    if (result.error) {
      const status = result.error === 'Player not found' ? 404 : 400
      res.status(status).json({ error: result.error })
      return
    }
    res.json(result.player)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update player' })
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await playerService.deletePlayer(id, userId)
    if (result.error) {
      res.status(404).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to delete player' })
  }
}

/* ── Export ── */

export async function exportPlayers(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string
    const includeAvatar = req.query.avatar === 'true'
    const idsParam = req.query.ids as string | undefined
    const playerIds = idsParam ? idsParam.split(',').filter(Boolean) : undefined
    const result = await playerService.exportPlayers(userId, includeAvatar, playerIds)
    res.json({ data: result.text, exported: result.exported })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to export players' })
  }
}

/* ── Import ── */

export async function importPlayers(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string
    const { data } = req.body
    if (typeof data !== 'string' || !data.trim()) {
      res.status(400).json({ error: 'Campo "data" é obrigatório e deve ser texto' })
      return
    }
    const result = await playerService.importPlayers(data, userId)
    res.json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to import players' })
  }
}
