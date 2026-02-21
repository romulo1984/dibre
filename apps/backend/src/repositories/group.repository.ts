import { prisma } from '../database/client.js'
import type {
  GroupEntity,
  GroupMemberEntity,
  GroupJoinRequestEntity,
  GroupInvitationEntity,
  UserSummary,
} from '../domain/group.js'

// ── Slug helpers ──────────────────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base
  let attempt = 0
  while (true) {
    const existing = await prisma.group.findUnique({ where: { slug } })
    if (!existing) return slug
    attempt++
    slug = `${base}-${attempt}`
  }
}

// ── Group CRUD ────────────────────────────────────────────────────────────────

function toGroupEntity(row: {
  id: string
  name: string
  description: string | null
  slug: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}): GroupEntity {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    slug: row.slug,
    ownerId: row.ownerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

export async function createGroup(data: {
  name: string
  description?: string | null
  slug: string
  ownerId: string
}): Promise<GroupEntity> {
  const row = await prisma.group.create({ data })
  return toGroupEntity(row)
}

export async function findGroupById(id: string): Promise<GroupEntity | null> {
  const row = await prisma.group.findFirst({ where: { id, deletedAt: null } })
  return row ? toGroupEntity(row) : null
}

export async function findGroupBySlug(slug: string): Promise<GroupEntity | null> {
  const row = await prisma.group.findFirst({ where: { slug, deletedAt: null } })
  return row ? toGroupEntity(row) : null
}

export async function findGroupsForUser(userId: string): Promise<GroupEntity[]> {
  // Groups the user owns or is a member of
  const [owned, memberships] = await Promise.all([
    prisma.group.findMany({
      where: { ownerId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: true,
      },
    }),
  ])

  const ownedIds = new Set(owned.map((g) => g.id))
  const memberGroups = memberships
    .map((m) => m.group)
    .filter((g) => !g.deletedAt && !ownedIds.has(g.id))

  return [...owned, ...memberGroups].map(toGroupEntity)
}

export async function updateGroup(
  id: string,
  data: Partial<{ name: string; description: string | null }>
): Promise<GroupEntity | null> {
  const row = await prisma.group.update({ where: { id }, data })
  return row ? toGroupEntity(row) : null
}

export async function softDeleteGroup(id: string): Promise<boolean> {
  try {
    await prisma.group.update({ where: { id }, data: { deletedAt: new Date() } })
    return true
  } catch {
    return false
  }
}

// ── Membership ────────────────────────────────────────────────────────────────

export async function isGroupOwner(groupId: string, userId: string): Promise<boolean> {
  const group = await prisma.group.findFirst({ where: { id: groupId, ownerId: userId } })
  return !!group
}

export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  return !!member
}

export async function findGroupMembers(groupId: string): Promise<GroupMemberEntity[]> {
  const rows = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { joinedAt: 'asc' },
  })
  return rows.map((r) => ({
    id: r.id,
    groupId: r.groupId,
    userId: r.userId,
    joinedAt: r.joinedAt,
    user: r.user,
  }))
}

export async function addGroupMember(groupId: string, userId: string): Promise<GroupMemberEntity> {
  const row = await prisma.groupMember.create({
    data: { groupId, userId },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  return {
    id: row.id,
    groupId: row.groupId,
    userId: row.userId,
    joinedAt: row.joinedAt,
    user: row.user,
  }
}

export async function removeGroupMember(groupId: string, userId: string): Promise<boolean> {
  try {
    await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId } } })
    return true
  } catch {
    return false
  }
}

// ── Join Requests ─────────────────────────────────────────────────────────────

export async function findJoinRequest(
  groupId: string,
  userId: string
): Promise<GroupJoinRequestEntity | null> {
  const row = await prisma.groupJoinRequest.findUnique({
    where: { groupId_userId: { groupId, userId } },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!row) return null
  return {
    id: row.id,
    groupId: row.groupId,
    userId: row.userId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: row.user,
  }
}

export async function findJoinRequestById(id: string): Promise<GroupJoinRequestEntity | null> {
  const row = await prisma.groupJoinRequest.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!row) return null
  return {
    id: row.id,
    groupId: row.groupId,
    userId: row.userId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: row.user,
  }
}

export async function findPendingJoinRequests(groupId: string): Promise<GroupJoinRequestEntity[]> {
  const rows = await prisma.groupJoinRequest.findMany({
    where: { groupId, status: 'pending' },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map((r) => ({
    id: r.id,
    groupId: r.groupId,
    userId: r.userId,
    status: r.status as 'pending' | 'accepted' | 'declined',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: r.user,
  }))
}

export async function createJoinRequest(
  groupId: string,
  userId: string
): Promise<GroupJoinRequestEntity> {
  const row = await prisma.groupJoinRequest.create({
    data: { groupId, userId },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  return {
    id: row.id,
    groupId: row.groupId,
    userId: row.userId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: row.user,
  }
}

export async function updateJoinRequestStatus(
  id: string,
  status: 'accepted' | 'declined'
): Promise<GroupJoinRequestEntity | null> {
  const row = await prisma.groupJoinRequest.update({
    where: { id },
    data: { status },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  return {
    id: row.id,
    groupId: row.groupId,
    userId: row.userId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: row.user,
  }
}

export async function deleteJoinRequest(groupId: string, userId: string): Promise<boolean> {
  try {
    await prisma.groupJoinRequest.delete({ where: { groupId_userId: { groupId, userId } } })
    return true
  } catch {
    return false
  }
}

// ── Invitations ───────────────────────────────────────────────────────────────

export async function findInvitation(
  groupId: string,
  invitedUserId: string
): Promise<GroupInvitationEntity | null> {
  const row = await prisma.groupInvitation.findUnique({
    where: { groupId_invitedUserId: { groupId, invitedUserId } },
    include: {
      group: { select: { id: true, name: true, slug: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  })
  if (!row) return null
  return {
    id: row.id,
    groupId: row.groupId,
    invitedUserId: row.invitedUserId,
    invitedByUserId: row.invitedByUserId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    group: row.group,
    invitedBy: row.invitedBy,
  }
}

export async function findInvitationById(id: string): Promise<GroupInvitationEntity | null> {
  const row = await prisma.groupInvitation.findUnique({
    where: { id },
    include: {
      group: { select: { id: true, name: true, slug: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  })
  if (!row) return null
  return {
    id: row.id,
    groupId: row.groupId,
    invitedUserId: row.invitedUserId,
    invitedByUserId: row.invitedByUserId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    group: row.group,
    invitedBy: row.invitedBy,
  }
}

export async function findPendingInvitationsForUser(
  invitedUserId: string
): Promise<GroupInvitationEntity[]> {
  const rows = await prisma.groupInvitation.findMany({
    where: { invitedUserId, status: 'pending' },
    include: {
      group: { select: { id: true, name: true, slug: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => ({
    id: r.id,
    groupId: r.groupId,
    invitedUserId: r.invitedUserId,
    invitedByUserId: r.invitedByUserId,
    status: r.status as 'pending' | 'accepted' | 'declined',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    group: r.group,
    invitedBy: r.invitedBy,
  }))
}

export async function createInvitation(data: {
  groupId: string
  invitedUserId: string
  invitedByUserId: string
}): Promise<GroupInvitationEntity> {
  const row = await prisma.groupInvitation.create({
    data,
    include: {
      group: { select: { id: true, name: true, slug: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  })
  return {
    id: row.id,
    groupId: row.groupId,
    invitedUserId: row.invitedUserId,
    invitedByUserId: row.invitedByUserId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    group: row.group,
    invitedBy: row.invitedBy,
  }
}

export async function updateInvitationStatus(
  id: string,
  status: 'accepted' | 'declined'
): Promise<GroupInvitationEntity | null> {
  const row = await prisma.groupInvitation.update({
    where: { id },
    data: { status },
    include: {
      group: { select: { id: true, name: true, slug: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  })
  return {
    id: row.id,
    groupId: row.groupId,
    invitedUserId: row.invitedUserId,
    invitedByUserId: row.invitedByUserId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    group: row.group,
    invitedBy: row.invitedBy,
  }
}

/** Resets a declined invitation back to pending (re-invite). Also updates the inviter. */
export async function resetDeclinedInvitation(
  id: string,
  invitedByUserId: string
): Promise<GroupInvitationEntity> {
  const row = await prisma.groupInvitation.update({
    where: { id },
    data: { status: 'pending', invitedByUserId },
    include: {
      group: { select: { id: true, name: true, slug: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  })
  return {
    id: row.id,
    groupId: row.groupId,
    invitedUserId: row.invitedUserId,
    invitedByUserId: row.invitedByUserId,
    status: row.status as 'pending' | 'accepted' | 'declined',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    group: row.group,
    invitedBy: row.invitedBy,
  }
}

// ── User search ───────────────────────────────────────────────────────────────

export async function searchUsers(query: string, excludeUserId: string): Promise<UserSummary[]> {
  const rows = await prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 20,
  })
  return rows
}

export async function findUserByEmail(email: string): Promise<UserSummary | null> {
  const row = await prisma.user.findFirst({
    where: { email },
    select: { id: true, name: true, email: true },
  })
  return row ?? null
}

export async function findUserById(id: string): Promise<UserSummary | null> {
  const row = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  })
  return row ?? null
}

// ── Group member access ───────────────────────────────────────────────────────

/**
 * Returns true if viewerId is a member of any active group owned by ownerId.
 * Used to allow group members to view the owner's players/games.
 */
export async function isGroupMemberOfOwner(viewerId: string, ownerId: string): Promise<boolean> {
  const membership = await prisma.groupMember.findFirst({
    where: {
      userId: viewerId,
      group: { ownerId, deletedAt: null },
    },
  })
  return !!membership
}

// ── Game ↔ Group assignment ───────────────────────────────────────────────────

export async function findGamesByGroupId(groupId: string): Promise<string[]> {
  const rows = await prisma.game.findMany({
    where: { groupId, deletedAt: null },
    select: { id: true },
  })
  return rows.map((r) => r.id)
}

export async function setGameGroup(gameId: string, groupId: string | null): Promise<void> {
  await prisma.game.update({ where: { id: gameId }, data: { groupId } })
}

// ── Pending invitations (for member list with status) ─────────────────────────

export async function findPendingInvitationsByGroup(groupId: string): Promise<GroupInvitationEntity[]> {
  const rows = await prisma.groupInvitation.findMany({
    where: { groupId, status: 'pending' },
    include: {
      invitedUser: { select: { id: true, name: true, email: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => ({
    id: r.id,
    groupId: r.groupId,
    invitedUserId: r.invitedUserId,
    invitedByUserId: r.invitedByUserId,
    status: r.status as 'pending' | 'accepted' | 'declined',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    invitedBy: r.invitedBy,
    invitedUser: r.invitedUser,
  }))
}
