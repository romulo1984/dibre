import * as groupRepo from '../repositories/group.repository.js'
import * as notifRepo from '../repositories/notification.repository.js'
import * as playerRepo from '../repositories/player.repository.js'
import * as gameRepo from '../repositories/game.repository.js'
import type {
  GroupEntity,
  GroupMemberEntity,
  GroupJoinRequestEntity,
  GroupInvitationEntity,
  UserSummary,
} from '../domain/group.js'
import type { PlayerEntity } from '../domain/player.js'
import type { GameEntity } from '../domain/game.js'

// ── Create Group ──────────────────────────────────────────────────────────────

export async function createGroup(
  data: { name: string; description?: string | null },
  ownerId: string
): Promise<{ error?: string; group?: GroupEntity }> {
  if (!data.name?.trim()) return { error: 'Group name is required' }
  const baseSlug = groupRepo.generateSlug(data.name.trim())
  if (!baseSlug) return { error: 'Invalid group name' }
  const slug = await groupRepo.ensureUniqueSlug(baseSlug)
  const group = await groupRepo.createGroup({
    name: data.name.trim(),
    description: data.description ?? null,
    slug,
    ownerId,
  })
  return { group }
}

// ── Get Group ─────────────────────────────────────────────────────────────────

export async function getGroupById(id: string): Promise<GroupEntity | null> {
  return groupRepo.findGroupById(id)
}

export async function getGroupBySlug(slug: string): Promise<GroupEntity | null> {
  return groupRepo.findGroupBySlug(slug)
}

export async function listGroupsForUser(userId: string): Promise<GroupEntity[]> {
  return groupRepo.findGroupsForUser(userId)
}

// ── Update / Delete ───────────────────────────────────────────────────────────

export async function updateGroup(
  id: string,
  data: Partial<{ name: string; description: string | null }>,
  userId: string
): Promise<{ error?: string; group?: GroupEntity }> {
  const isOwner = await groupRepo.isGroupOwner(id, userId)
  if (!isOwner) return { error: 'Not authorized' }
  if (data.name !== undefined && !data.name?.trim()) return { error: 'Group name cannot be empty' }
  const group = await groupRepo.updateGroup(id, data)
  if (!group) return { error: 'Group not found' }
  return { group }
}

export async function deleteGroup(
  id: string,
  userId: string
): Promise<{ error?: string; ok?: boolean }> {
  const isOwner = await groupRepo.isGroupOwner(id, userId)
  if (!isOwner) return { error: 'Not authorized' }
  const ok = await groupRepo.softDeleteGroup(id)
  if (!ok) return { error: 'Group not found' }
  return { ok: true }
}

// ── Group Content (owner's players/games) ─────────────────────────────────────

export async function getGroupPlayers(
  groupId: string,
  viewerUserId: string
): Promise<{ error?: string; players?: PlayerEntity[] }> {
  const group = await groupRepo.findGroupById(groupId)
  if (!group) return { error: 'Group not found' }

  const isMember = await groupRepo.isGroupMember(groupId, viewerUserId)
  const isOwner = group.ownerId === viewerUserId
  if (!isOwner && !isMember) return { error: 'Access denied' }

  const players = await playerRepo.findAllPlayersByOwner(group.ownerId)
  return { players: players.filter((p) => !p.deletedAt) }
}

export async function getGroupGames(
  groupId: string,
  viewerUserId: string
): Promise<{ error?: string; games?: GameEntity[] }> {
  const group = await groupRepo.findGroupById(groupId)
  if (!group) return { error: 'Group not found' }

  const isMember = await groupRepo.isGroupMember(groupId, viewerUserId)
  const isOwner = group.ownerId === viewerUserId
  if (!isOwner && !isMember) return { error: 'Access denied' }

  const games = await gameRepo.findGamesByGroupId(groupId)
  return { games }
}

export async function getOwnerGamesForGroup(
  groupId: string,
  requesterId: string
): Promise<{ error?: string; games?: GameEntity[] }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, requesterId)
  if (!isOwner) return { error: 'Not authorized' }
  const group = await groupRepo.findGroupById(groupId)
  if (!group) return { error: 'Group not found' }
  const games = await gameRepo.findAllGamesByOwner(group.ownerId)
  return { games: games.filter((g) => !g.deletedAt) }
}

export async function assignGameToGroup(
  groupId: string,
  gameId: string,
  requesterId: string
): Promise<{ error?: string; ok?: boolean }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, requesterId)
  if (!isOwner) return { error: 'Not authorized' }
  const game = await gameRepo.findGameByIdForOwner(gameId, requesterId)
  if (!game) return { error: 'Game not found' }
  await groupRepo.setGameGroup(gameId, groupId)
  return { ok: true }
}

export async function removeGameFromGroup(
  groupId: string,
  gameId: string,
  requesterId: string
): Promise<{ error?: string; ok?: boolean }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, requesterId)
  if (!isOwner) return { error: 'Not authorized' }
  const game = await gameRepo.findGameByIdForOwner(gameId, requesterId)
  if (!game || game.groupId !== groupId) return { error: 'Game not in this group' }
  await groupRepo.setGameGroup(gameId, null)
  return { ok: true }
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function getGroupMembers(
  groupId: string
): Promise<GroupMemberEntity[]> {
  return groupRepo.findGroupMembers(groupId)
}

export async function removeGroupMember(
  groupId: string,
  targetUserId: string,
  requesterId: string
): Promise<{ error?: string; ok?: boolean }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, requesterId)
  if (!isOwner) return { error: 'Not authorized' }
  // Cannot remove the owner
  const group = await groupRepo.findGroupById(groupId)
  if (group?.ownerId === targetUserId) return { error: 'Cannot remove the group owner' }
  const ok = await groupRepo.removeGroupMember(groupId, targetUserId)
  if (!ok) return { error: 'Member not found' }
  return { ok: true }
}

// ── Join Requests ─────────────────────────────────────────────────────────────

export async function requestToJoin(
  groupId: string,
  userId: string
): Promise<{ error?: string; request?: GroupJoinRequestEntity }> {
  const group = await groupRepo.findGroupById(groupId)
  if (!group) return { error: 'Group not found' }
  if (group.ownerId === userId) return { error: 'You are the owner of this group' }

  const alreadyMember = await groupRepo.isGroupMember(groupId, userId)
  if (alreadyMember) return { error: 'Already a member' }

  // Block if the user already has a pending invitation
  const pendingInvitation = await groupRepo.findInvitation(groupId, userId)
  if (pendingInvitation && pendingInvitation.status === 'pending') {
    return { error: 'You have a pending invitation to this group' }
  }

  // Check for existing pending request
  const existing = await groupRepo.findJoinRequest(groupId, userId)
  if (existing && existing.status === 'pending') return { error: 'Request already pending' }

  const request = await groupRepo.createJoinRequest(groupId, userId)

  // Notify the owner
  const userName = request.user?.name ?? request.user?.email ?? 'Alguém'
  await notifRepo.createNotification({
    type: 'GROUP_JOIN_REQUEST',
    toUserId: group.ownerId,
    fromUserId: userId,
    groupId,
    relatedId: request.id,
    message: `${userName} solicitou participação no grupo "${group.name}"`,
  })

  return { request }
}

export async function cancelJoinRequest(
  groupId: string,
  userId: string
): Promise<{ error?: string; ok?: boolean }> {
  const ok = await groupRepo.deleteJoinRequest(groupId, userId)
  if (!ok) return { error: 'Request not found' }
  return { ok: true }
}

export async function getPendingJoinRequests(
  groupId: string,
  requesterId: string
): Promise<{ error?: string; requests?: GroupJoinRequestEntity[] }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, requesterId)
  if (!isOwner) return { error: 'Not authorized' }
  const requests = await groupRepo.findPendingJoinRequests(groupId)
  return { requests }
}

export async function respondToJoinRequest(
  groupId: string,
  requestId: string,
  action: 'accept' | 'decline',
  ownerId: string
): Promise<{ error?: string; ok?: boolean }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, ownerId)
  if (!isOwner) return { error: 'Not authorized' }

  const request = await groupRepo.findJoinRequestById(requestId)
  if (!request || request.groupId !== groupId) return { error: 'Request not found' }
  if (request.status !== 'pending') return { error: 'Request already processed' }

  const status = action === 'accept' ? 'accepted' : 'declined'
  await groupRepo.updateJoinRequestStatus(requestId, status)

  if (action === 'accept') {
    await groupRepo.addGroupMember(groupId, request.userId)
  }

  return { ok: true }
}

// ── Invitations ───────────────────────────────────────────────────────────────

export async function inviteUser(
  groupId: string,
  invitedUserId: string,
  invitedByUserId: string
): Promise<{ error?: string; invitation?: GroupInvitationEntity }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, invitedByUserId)
  if (!isOwner) return { error: 'Not authorized' }

  if (invitedUserId === invitedByUserId) return { error: 'Cannot invite yourself' }

  const group = await groupRepo.findGroupById(groupId)
  if (!group) return { error: 'Group not found' }

  const alreadyMember = await groupRepo.isGroupMember(groupId, invitedUserId)
  if (alreadyMember) return { error: 'User is already a member' }

  const existing = await groupRepo.findInvitation(groupId, invitedUserId)
  if (existing && existing.status === 'pending') return { error: 'Invitation already pending' }

  // Re-invite: reset a previously declined invitation instead of creating a duplicate
  const invitation =
    existing && existing.status === 'declined'
      ? await groupRepo.resetDeclinedInvitation(existing.id, invitedByUserId)
      : await groupRepo.createInvitation({ groupId, invitedUserId, invitedByUserId })

  // Notify the invited user
  const inviterName = invitation.invitedBy?.name ?? invitation.invitedBy?.email ?? 'Alguém'
  await notifRepo.createNotification({
    type: 'GROUP_INVITATION',
    toUserId: invitedUserId,
    fromUserId: invitedByUserId,
    groupId,
    relatedId: invitation.id,
    message: `${inviterName} convidou você para participar do grupo "${group.name}"`,
  })

  return { invitation }
}

export async function getPendingInvitationsForUser(
  userId: string
): Promise<GroupInvitationEntity[]> {
  return groupRepo.findPendingInvitationsForUser(userId)
}

export async function respondToInvitation(
  invitationId: string,
  action: 'accept' | 'decline',
  userId: string
): Promise<{ error?: string; ok?: boolean }> {
  const invitation = await groupRepo.findInvitationById(invitationId)
  if (!invitation) return { error: 'Invitation not found' }
  if (invitation.invitedUserId !== userId) return { error: 'Not authorized' }
  if (invitation.status !== 'pending') return { error: 'Invitation already processed' }

  const status = action === 'accept' ? 'accepted' : 'declined'
  await groupRepo.updateInvitationStatus(invitationId, status)

  if (action === 'accept') {
    await groupRepo.addGroupMember(invitation.groupId, userId)
  } else {
    // Notify the owner that their invitation was declined
    const decliningUser = await groupRepo.findUserById(userId)
    const userName = decliningUser?.name ?? decliningUser?.email ?? 'Alguém'
    const groupName = invitation.group?.name ?? 'grupo'
    await notifRepo.createNotification({
      type: 'GROUP_INVITATION',
      toUserId: invitation.invitedByUserId,
      fromUserId: userId,
      groupId: invitation.groupId,
      relatedId: invitation.id,
      message: `${userName} recusou o convite para participar do grupo "${groupName}"`,
    })
  }

  return { ok: true }
}

// ── User search ───────────────────────────────────────────────────────────────

export async function searchUsers(query: string, excludeUserId: string): Promise<UserSummary[]> {
  if (!query?.trim() || query.trim().length < 2) return []
  return groupRepo.searchUsers(query.trim(), excludeUserId)
}

// ── Invite by email ───────────────────────────────────────────────────────────

export async function inviteByEmail(
  groupId: string,
  email: string,
  invitedByUserId: string
): Promise<{ error?: string; notFound?: boolean; invitation?: GroupInvitationEntity }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, invitedByUserId)
  if (!isOwner) return { error: 'Not authorized' }

  const group = await groupRepo.findGroupById(groupId)
  if (!group) return { error: 'Group not found' }

  const user = await groupRepo.findUserByEmail(email.toLowerCase().trim())
  if (!user) return { notFound: true }

  if (user.id === invitedByUserId) return { error: 'Cannot invite yourself' }

  const alreadyMember = await groupRepo.isGroupMember(groupId, user.id)
  if (alreadyMember) return { error: 'User is already a member' }

  const existing = await groupRepo.findInvitation(groupId, user.id)
  if (existing && existing.status === 'pending') return { error: 'Invitation already pending' }

  // Re-invite: reset a previously declined invitation instead of creating a duplicate
  const invitation =
    existing && existing.status === 'declined'
      ? await groupRepo.resetDeclinedInvitation(existing.id, invitedByUserId)
      : await groupRepo.createInvitation({ groupId, invitedUserId: user.id, invitedByUserId })

  const inviterName = invitation.invitedBy?.name ?? invitation.invitedBy?.email ?? 'Alguém'
  await notifRepo.createNotification({
    type: 'GROUP_INVITATION',
    toUserId: user.id,
    fromUserId: invitedByUserId,
    groupId,
    relatedId: invitation.id,
    message: `${inviterName} convidou você para participar do grupo "${group.name}"`,
  })

  return { invitation }
}

// ── Members with pending invitations ─────────────────────────────────────────

export async function getGroupMembersWithPending(
  groupId: string,
  requesterId: string
): Promise<{ error?: string; members?: GroupMemberEntity[]; pendingInvitations?: GroupInvitationEntity[] }> {
  const isOwner = await groupRepo.isGroupOwner(groupId, requesterId)
  if (!isOwner) return { error: 'Not authorized' }
  const [members, pendingInvitations] = await Promise.all([
    groupRepo.findGroupMembers(groupId),
    groupRepo.findPendingInvitationsByGroup(groupId),
  ])
  return { members, pendingInvitations }
}

// ── Viewer role check ─────────────────────────────────────────────────────────

export async function getGroupMembership(
  groupId: string,
  userId: string
): Promise<{
  isOwner: boolean
  isMember: boolean
  pendingRequest: boolean
  pendingInvitation: boolean
}> {
  const [group, isMember, joinReq, invitation] = await Promise.all([
    groupRepo.findGroupById(groupId),
    groupRepo.isGroupMember(groupId, userId),
    groupRepo.findJoinRequest(groupId, userId),
    groupRepo.findInvitation(groupId, userId),
  ])

  return {
    isOwner: group?.ownerId === userId,
    isMember,
    pendingRequest: joinReq?.status === 'pending',
    pendingInvitation: invitation?.status === 'pending',
  }
}
