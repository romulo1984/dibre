import type { Request, Response } from 'express'
import { z } from 'zod'
import * as groupService from '../services/group.service.js'

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
})

const updateGroupSchema = createGroupSchema.partial()

// ── Groups CRUD ───────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string
    const groups = await groupService.listGroupsForUser(userId)
    res.json({ groups, currentUserId: userId })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to list groups' })
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createGroupSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
      return
    }
    const userId = res.locals.userId as string
    const result = await groupService.createGroup(parsed.data, userId)
    if (result.error) {
      res.status(400).json({ error: result.error })
      return
    }
    res.status(201).json(result.group)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to create group' })
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const group = await groupService.getGroupById(id)
    if (!group) {
      res.status(404).json({ error: 'Group not found' })
      return
    }
    const membership = await groupService.getGroupMembership(id, userId)
    res.json({ group, membership })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get group' })
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const parsed = updateGroupSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
      return
    }
    const userId = res.locals.userId as string
    const result = await groupService.updateGroup(id, parsed.data, userId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 400
      res.status(status).json({ error: result.error })
      return
    }
    res.json(result.group)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update group' })
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.deleteGroup(id, userId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 404
      res.status(status).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to delete group' })
  }
}

// ── Group content ─────────────────────────────────────────────────────────────

export async function getPlayers(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.getGroupPlayers(id, userId)
    if (result.error) {
      const status = result.error === 'Access denied' ? 403 : 404
      res.status(status).json({ error: result.error })
      return
    }
    res.json(result.players)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get group players' })
  }
}

export async function getGames(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.getGroupGames(id, userId)
    if (result.error) {
      const status = result.error === 'Access denied' ? 403 : 404
      res.status(status).json({ error: result.error })
      return
    }
    res.json(result.games)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get group games' })
  }
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function getMembers(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const members = await groupService.getGroupMembers(id)
    res.json(members)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get group members' })
  }
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    const { id, userId: targetUserId } = req.params
    const requesterId = res.locals.userId as string
    const result = await groupService.removeGroupMember(id, targetUserId, requesterId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 404
      res.status(status).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to remove member' })
  }
}

// ── Join Requests ─────────────────────────────────────────────────────────────

export async function requestJoin(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.requestToJoin(id, userId)
    if (result.error) {
      res.status(400).json({ error: result.error })
      return
    }
    res.status(201).json(result.request)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to request to join' })
  }
}

export async function cancelJoinRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.cancelJoinRequest(id, userId)
    if (result.error) {
      res.status(404).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to cancel join request' })
  }
}

export async function getJoinRequests(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.getPendingJoinRequests(id, userId)
    if (result.error) {
      res.status(403).json({ error: result.error })
      return
    }
    res.json(result.requests)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get join requests' })
  }
}

export async function respondToJoinRequest(req: Request, res: Response): Promise<void> {
  try {
    const { id, requestId } = req.params
    const { action } = req.body as { action: 'accept' | 'decline' }
    if (action !== 'accept' && action !== 'decline') {
      res.status(400).json({ error: 'Action must be "accept" or "decline"' })
      return
    }
    const userId = res.locals.userId as string
    const result = await groupService.respondToJoinRequest(id, requestId, action, userId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 400
      res.status(status).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to respond to join request' })
  }
}

// ── Invitations ───────────────────────────────────────────────────────────────

export async function inviteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id, userId: targetUserId } = req.params
    const invitedByUserId = res.locals.userId as string
    const result = await groupService.inviteUser(id, targetUserId, invitedByUserId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 400
      res.status(status).json({ error: result.error })
      return
    }
    res.status(201).json(result.invitation)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to invite user' })
  }
}

export async function getMyInvitations(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string
    const invitations = await groupService.getPendingInvitationsForUser(userId)
    res.json(invitations)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get invitations' })
  }
}

export async function respondToInvitation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { action } = req.body as { action: 'accept' | 'decline' }
    if (action !== 'accept' && action !== 'decline') {
      res.status(400).json({ error: 'Action must be "accept" or "decline"' })
      return
    }
    const userId = res.locals.userId as string
    const result = await groupService.respondToInvitation(id, action, userId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 400
      res.status(status).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to respond to invitation' })
  }
}

// ── User search ───────────────────────────────────────────────────────────────

export async function searchUsers(req: Request, res: Response): Promise<void> {
  try {
    const q = (req.query.q as string) ?? ''
    const userId = res.locals.userId as string
    const users = await groupService.searchUsers(q, userId)
    res.json(users)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to search users' })
  }
}

// ── Invite by email ───────────────────────────────────────────────────────────

export async function inviteByEmail(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { email } = req.body as { email: string }
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' })
      return
    }
    const userId = res.locals.userId as string
    const result = await groupService.inviteByEmail(id, email, userId)
    if (result.notFound) {
      res.status(404).json({ error: 'Usuário não encontrado com este e-mail' })
      return
    }
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 400
      res.status(status).json({ error: result.error })
      return
    }
    res.status(201).json(result.invitation)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to invite user' })
  }
}

// ── Members with pending invitations ─────────────────────────────────────────

export async function getMembersWithPending(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.getGroupMembersWithPending(id, userId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 404
      res.status(status).json({ error: result.error })
      return
    }
    res.json({ members: result.members, pendingInvitations: result.pendingInvitations })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get members' })
  }
}

// ── Game assignment ───────────────────────────────────────────────────────────

export async function getOwnerGames(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.getOwnerGamesForGroup(id, userId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 404
      res.status(status).json({ error: result.error })
      return
    }
    res.json(result.games)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to get owner games' })
  }
}

export async function assignGame(req: Request, res: Response): Promise<void> {
  try {
    const { id, gameId } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.assignGameToGroup(id, gameId, userId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 404
      res.status(status).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to assign game' })
  }
}

export async function unassignGame(req: Request, res: Response): Promise<void> {
  try {
    const { id, gameId } = req.params
    const userId = res.locals.userId as string
    const result = await groupService.removeGameFromGroup(id, gameId, userId)
    if (result.error) {
      const status = result.error === 'Not authorized' ? 403 : 404
      res.status(status).json({ error: result.error })
      return
    }
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to unassign game' })
  }
}
