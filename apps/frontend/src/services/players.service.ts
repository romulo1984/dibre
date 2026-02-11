import type { Player, PlayerWithParticipation } from '@/domain/types'
import { api } from '@/services/api'

export async function listPlayers(token: string): Promise<Player[]> {
  return api.get<Player[]>('/players', token)
}

export async function getPlayer(id: string, token: string): Promise<PlayerWithParticipation> {
  return api.get<PlayerWithParticipation>(`/players/${id}`, token)
}

export async function createPlayer(
  data: {
    name: string
    avatarUrl?: string | null
    stars: number
    pass: number
    shot: number
    defense: number
    energy: number
    speed: number
  },
  token: string
): Promise<Player> {
  return api.post<Player>('/players', data, token)
}

export async function updatePlayer(
  id: string,
  data: Partial<{
    name: string
    avatarUrl: string | null
    stars: number
    pass: number
    shot: number
    defense: number
    energy: number
    speed: number
  }>,
  token: string
): Promise<Player> {
  return api.patch<Player>(`/players/${id}`, data, token)
}

export async function deletePlayer(id: string, token: string): Promise<void> {
  return api.delete(`/players/${id}`, token)
}
