import type {
  Group,
  GroupDetailResponse,
  GroupMember,
  GroupJoinRequest,
  GroupInvitation,
  GroupMembersWithPendingResponse,
  UserSummary,
} from '@/domain/types'
import type { Player, Game } from '@/domain/types'
import { api } from '@/services/api'

export async function listGroups(
  token: string
): Promise<{ groups: Group[]; currentUserId: string }> {
  return api.get<{ groups: Group[]; currentUserId: string }>('/groups', token)
}

export async function getGroup(id: string, token: string): Promise<GroupDetailResponse> {
  return api.get<GroupDetailResponse>(`/groups/${id}`, token)
}

export async function createGroup(
  data: { name: string; description?: string | null },
  token: string
): Promise<Group> {
  return api.post<Group>('/groups', data, token)
}

export async function updateGroup(
  id: string,
  data: { name?: string; description?: string | null },
  token: string
): Promise<Group> {
  return api.patch<Group>(`/groups/${id}`, data, token)
}

export async function deleteGroup(id: string, token: string): Promise<void> {
  return api.delete(`/groups/${id}`, token)
}

// ── Group content ─────────────────────────────────────────────────────────────

export async function getGroupPlayers(id: string, token: string): Promise<Player[]> {
  return api.get<Player[]>(`/groups/${id}/players`, token)
}

export async function getGroupGames(id: string, token: string): Promise<Game[]> {
  return api.get<Game[]>(`/groups/${id}/games`, token)
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function getGroupMembers(id: string, token: string): Promise<GroupMember[]> {
  return api.get<GroupMember[]>(`/groups/${id}/members`, token)
}

export async function removeGroupMember(
  groupId: string,
  userId: string,
  token: string
): Promise<void> {
  return api.delete(`/groups/${groupId}/members/${userId}`, token)
}

// ── Join requests ─────────────────────────────────────────────────────────────

export async function requestToJoin(groupId: string, token: string): Promise<GroupJoinRequest> {
  return api.post<GroupJoinRequest>(`/groups/${groupId}/request-join`, {}, token)
}

export async function cancelJoinRequest(groupId: string, token: string): Promise<void> {
  return api.delete(`/groups/${groupId}/request-join`, token)
}

export async function getJoinRequests(
  groupId: string,
  token: string
): Promise<GroupJoinRequest[]> {
  return api.get<GroupJoinRequest[]>(`/groups/${groupId}/join-requests`, token)
}

export async function respondToJoinRequest(
  groupId: string,
  requestId: string,
  action: 'accept' | 'decline',
  token: string
): Promise<void> {
  return api.post<void>(`/groups/${groupId}/join-requests/${requestId}/respond`, { action }, token)
}

// ── Invitations ───────────────────────────────────────────────────────────────

export async function inviteUser(
  groupId: string,
  userId: string,
  token: string
): Promise<GroupInvitation> {
  return api.post<GroupInvitation>(`/groups/${groupId}/invite/${userId}`, {}, token)
}

export async function getMyInvitations(token: string): Promise<GroupInvitation[]> {
  return api.get<GroupInvitation[]>('/invitations', token)
}

export async function respondToInvitation(
  invitationId: string,
  action: 'accept' | 'decline',
  token: string
): Promise<void> {
  return api.post<void>(`/invitations/${invitationId}/respond`, { action }, token)
}

// ── User search ───────────────────────────────────────────────────────────────

export async function searchUsers(query: string, token: string): Promise<UserSummary[]> {
  return api.get<UserSummary[]>(`/users/search?q=${encodeURIComponent(query)}`, token)
}

// ── Invite by email ───────────────────────────────────────────────────────────

export async function inviteByEmail(
  groupId: string,
  email: string,
  token: string
): Promise<GroupInvitation> {
  return api.post<GroupInvitation>(`/groups/${groupId}/invite-by-email`, { email }, token)
}

// ── Members with pending invitations ─────────────────────────────────────────

export async function getGroupMembersWithPending(
  groupId: string,
  token: string
): Promise<GroupMembersWithPendingResponse> {
  return api.get<GroupMembersWithPendingResponse>(`/groups/${groupId}/members-with-pending`, token)
}

// ── Game assignment ───────────────────────────────────────────────────────────

export async function getGroupOwnerGames(groupId: string, token: string): Promise<Game[]> {
  return api.get<Game[]>(`/groups/${groupId}/owner-games`, token)
}

export async function assignGameToGroup(
  groupId: string,
  gameId: string,
  token: string
): Promise<void> {
  return api.post<void>(`/groups/${groupId}/games/${gameId}`, {}, token)
}

export async function removeGameFromGroup(
  groupId: string,
  gameId: string,
  token: string
): Promise<void> {
  return api.delete(`/groups/${groupId}/games/${gameId}`, token)
}
