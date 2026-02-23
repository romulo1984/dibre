import express from 'express'
import { clerkMiddleware } from '@clerk/express'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js'
import * as playersController from '../controllers/players.controller.js'
import * as gamesController from '../controllers/games.controller.js'
import * as groupsController from '../controllers/groups.controller.js'
import * as notificationsController from '../controllers/notifications.controller.js'
import * as adminController from '../controllers/admin.controller.js'

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
router.get('/games/:id/team-players', requireAuth, gamesController.getTeamPlayers)
router.post('/games', requireAuth, gamesController.create)
router.patch('/games/:id', requireAuth, gamesController.update)
router.put('/games/:id/players', requireAuth, gamesController.setPlayers)
router.post('/games/:id/draw', requireAuth, gamesController.runDraw)
router.delete('/games/:id', requireAuth, gamesController.remove)

// ---- Groups ----
router.get('/groups', requireAuth, groupsController.list)
router.post('/groups', requireAuth, groupsController.create)
router.get('/groups/:id', requireAuth, groupsController.getById)
router.patch('/groups/:id', requireAuth, groupsController.update)
router.delete('/groups/:id', requireAuth, groupsController.remove)

// Group content (players/games visible to members)
router.get('/groups/:id/players', requireAuth, groupsController.getPlayers)
router.get('/groups/:id/available-players', requireAuth, groupsController.getAvailablePlayers)
router.put('/groups/:id/players', requireAuth, groupsController.syncPlayers)
router.get('/groups/:id/games', requireAuth, groupsController.getGames)

// Group members
router.get('/groups/:id/members', requireAuth, groupsController.getMembers)
router.delete('/groups/:id/members/:userId', requireAuth, groupsController.removeMember)

// Join requests (user → owner)
router.post('/groups/:id/request-join', requireAuth, groupsController.requestJoin)
router.delete('/groups/:id/request-join', requireAuth, groupsController.cancelJoinRequest)
router.get('/groups/:id/join-requests', requireAuth, groupsController.getJoinRequests)
router.post('/groups/:id/join-requests/:requestId/respond', requireAuth, groupsController.respondToJoinRequest)

// Invitations (owner → user)
router.post('/groups/:id/invite/:userId', requireAuth, groupsController.inviteUser)
router.post('/groups/:id/invite-by-email', requireAuth, groupsController.inviteByEmail)
router.get('/invitations', requireAuth, groupsController.getMyInvitations)
router.post('/invitations/:id/respond', requireAuth, groupsController.respondToInvitation)

// Members with pending invitations (owner view)
router.get('/groups/:id/members-with-pending', requireAuth, groupsController.getMembersWithPending)

// Game assignment
router.get('/groups/:id/owner-games', requireAuth, groupsController.getOwnerGames)
router.post('/groups/:id/games/:gameId', requireAuth, groupsController.assignGame)
router.delete('/groups/:id/games/:gameId', requireAuth, groupsController.unassignGame)

// ---- Notifications ----
router.get('/notifications', requireAuth, notificationsController.list)
router.patch('/notifications/:id/read', requireAuth, notificationsController.markRead)
router.post('/notifications/read-all', requireAuth, notificationsController.markAllRead)

// ---- User search (for group invitations) ----
router.get('/users/search', requireAuth, groupsController.searchUsers)

// ---- Admin ----
router.get('/admin/users', requireAuth, requireAdmin, adminController.listUsers)
router.delete('/admin/users/:id', requireAuth, requireAdmin, adminController.deleteUser)
router.post('/admin/users/:id/impersonate', requireAuth, requireAdmin, adminController.impersonate)

export default router
