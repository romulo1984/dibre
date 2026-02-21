import { api } from '@/services/api'

export interface AdminUser {
  id: string
  clerkId: string
  email: string | null
  name: string | null
  role: string
  createdAt: string
  _count: {
    players: number
    games: number
    ownedGroups: number
    groupMemberships: number
  }
}

export interface AdminUsersResponse {
  users: AdminUser[]
  total: number
}

export async function listUsers(
  token: string,
  params: { page?: number; perPage?: number; search?: string } = {},
): Promise<AdminUsersResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.perPage) query.set('perPage', String(params.perPage))
  if (params.search) query.set('search', params.search)
  const qs = query.toString()
  return api.get<AdminUsersResponse>(`/admin/users${qs ? `?${qs}` : ''}`, token)
}

export async function deleteUser(id: string, token: string): Promise<void> {
  return api.delete(`/admin/users/${id}`, token)
}

export async function impersonateUser(
  id: string,
  token: string,
): Promise<{ token: string }> {
  return api.post<{ token: string }>(`/admin/users/${id}/impersonate`, {}, token)
}
