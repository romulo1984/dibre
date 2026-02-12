import express from 'express'
import { clerkMiddleware } from '@clerk/express'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as playersController from '../controllers/players.controller.js'
import * as gamesController from '../controllers/games.controller.js'

const router: express.Router = express.Router()

router.use(clerkMiddleware())

// ---- Players (todos exigem login; escopo por dono) ----
router.get('/players', requireAuth, playersController.list)
router.get('/players/export', requireAuth, playersController.exportPlayers)
router.post('/players/import', requireAuth, playersController.importPlayers)
router.get('/players/:id', requireAuth, playersController.getById)
router.post('/players', requireAuth, playersController.create)
router.patch('/players/:id', requireAuth, playersController.update)
router.delete('/players/:id', requireAuth, playersController.remove)

// ---- Games / Peladas (todos exigem login; escopo por dono) ----
router.get('/games', requireAuth, gamesController.list)
router.get('/games/:id', requireAuth, gamesController.getById)
router.get('/games/:id/players', requireAuth, gamesController.getPlayers)
router.get('/games/:id/teams', requireAuth, gamesController.getTeams)
router.post('/games', requireAuth, gamesController.create)
router.put('/games/:id/players', requireAuth, gamesController.setPlayers)
router.post('/games/:id/draw', requireAuth, gamesController.runDraw)
router.delete('/games/:id', requireAuth, gamesController.remove)

export default router
