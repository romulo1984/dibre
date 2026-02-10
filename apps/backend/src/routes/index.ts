import express from 'express'
import { clerkMiddleware } from '@clerk/express'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js'
import * as playersController from '../controllers/players.controller.js'
import * as gamesController from '../controllers/games.controller.js'

const router: express.Router = express.Router()

router.use(clerkMiddleware())

// ---- Players ----
router.get('/players', playersController.list)
router.get('/players/:id', playersController.getById)
router.post('/players', requireAuth, requireAdmin, playersController.create)
router.patch('/players/:id', requireAuth, requireAdmin, playersController.update)
router.delete('/players/:id', requireAuth, requireAdmin, playersController.remove)

// ---- Games (display name: pelada in UI) ----
router.get('/games', gamesController.list)
router.get('/games/:id', gamesController.getById)
router.get('/games/:id/players', gamesController.getPlayers)
router.get('/games/:id/teams', gamesController.getTeams)
router.post('/games', requireAuth, requireAdmin, gamesController.create)
router.put('/games/:id/players', requireAuth, requireAdmin, gamesController.setPlayers)
router.post('/games/:id/draw', requireAuth, requireAdmin, gamesController.runDraw)
router.delete('/games/:id', requireAuth, requireAdmin, gamesController.remove)

export default router
