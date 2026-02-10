import type { Request, Response } from 'express'
import * as playerService from '../services/player.service.js'
import { z } from 'zod'

const createPlayerSchema = z.object({
  name: z.string().min(1).max(200),
  avatarUrl: z
    .union([z.string().url(), z.literal('')])
    .optional()
    .nullable()
    .transform((s) => (s === '' || s == null ? null : s)),
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
    const players = await playerService.listPlayers()
    res.json(players)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to list players' })
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const result = await playerService.getPlayerWithParticipationCount(id)
    if (!result) {
      res.status(404).json({ error: 'Player not found' })
      return
    }
    res.json(result)
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
    const result = await playerService.createPlayer(parsed.data)
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
    const result = await playerService.updatePlayer(id, parsed.data)
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
    const result = await playerService.deletePlayer(id)
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
