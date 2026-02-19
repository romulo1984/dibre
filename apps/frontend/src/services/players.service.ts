import type { Player, PlayerProfileResponse } from '@/domain/types'
import { api } from '@/services/api'

export async function listPlayers(token: string): Promise<Player[]> {
  return api.get<Player[]>('/players', token)
}

export async function getPlayer(id: string, token: string): Promise<PlayerProfileResponse> {
  return api.get<PlayerProfileResponse>(`/players/${id}`, token)
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

export interface ExportedPlayer {
  name: string
  stars: number
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
}

export interface ExportResult {
  data: string
  exported: ExportedPlayer[]
}

export async function exportPlayers(
  token: string,
  includeAvatar: boolean,
  playerIds?: string[]
): Promise<ExportResult> {
  let url = `/players/export?avatar=${includeAvatar}`
  if (playerIds && playerIds.length > 0) {
    url += `&ids=${playerIds.join(',')}`
  }
  return api.get<ExportResult>(url, token)
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  players: ExportedPlayer[]
}

export async function importPlayers(
  data: string,
  token: string
): Promise<ImportResult> {
  return api.post<ImportResult>('/players/import', { data }, token)
}
