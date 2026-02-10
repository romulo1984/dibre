import type { Request, Response } from 'express'
import * as gameService from '../services/game.service.js'
import { z } from 'zod'

const createGameSchema = z.object({
  name: z.string().min(1).max(200),
  numberOfTeams: z.number().int().min(2).max(20),
})

const setPlayersSchema = z.object({
  playerIds: z.array(z.string().min(1)),
})

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const games = await gameService.listGames()
    res.json(games)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to list games' })
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const game = await gameService.getGameById(id)
    if (!game) {
      res.status(404).json({ error: 'Game not found' })
      return
    }
    res.json(game)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get game' })
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createGameSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
      return
    }
    const createdById = res.locals?.userId ?? null
    const result = await gameService.createGame({
      ...parsed.data,
      createdById: createdById ?? undefined,
    })
    if (result.error) {
      res.status(400).json({ error: result.error })
      return
    }
    res.status(201).json(result.game)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to create game' })
  }
}

export async function setPlayers(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const parsed = setPlayersSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
      return
    }
    const result = await gameService.setGamePlayers(id, parsed.data.playerIds)
    if (result.error) {
      res.status(404).json({ error: result.error })
      return
    }
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to set players' })
  }
}

export async function getPlayers(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const playerIds = await gameService.getGamePlayers(id)
    res.json({ playerIds })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get game players' })
  }
}

export async function runDraw(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const result = await gameService.runDraw(id)
    if (result.error) {
      const status = result.error === 'Game not found' ? 404 : 400
      res.status(status).json({ error: result.error })
      return
    }
    res.json({ teams: result.teams })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to run draw' })
  }
}

export async function getTeams(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const teams = await gameService.getGameTeams(id)
    res.json({ teams })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get teams' })
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const result = await gameService.deleteGame(id)
    if (result.error) {
      res.status(404).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to delete game' })
  }
}
