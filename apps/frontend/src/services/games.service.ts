import type { Game, TeamAssignment } from '../domain/types.js'
import { api } from './api.js'

export async function listGames(): Promise<Game[]> {
  return api.get<Game[]>('/games')
}

export async function getGame(id: string): Promise<Game> {
  return api.get<Game>(`/games/${id}`)
}

export async function getGamePlayers(id: string): Promise<{ playerIds: string[] }> {
  return api.get<{ playerIds: string[] }>(`/games/${id}/players`)
}

export async function getGameTeams(id: string): Promise<{ teams: TeamAssignment[] }> {
  return api.get<{ teams: TeamAssignment[] }>(`/games/${id}/teams`)
}

export async function createGame(
  data: { name: string; numberOfTeams: number },
  token: string
): Promise<Game> {
  return api.post<Game>('/games', data, token)
}

export async function setGamePlayers(
  gameId: string,
  playerIds: string[],
  token: string
): Promise<void> {
  return api.put<void>(`/games/${gameId}/players`, { playerIds }, token)
}

export async function runDraw(gameId: string, token: string): Promise<{ teams: TeamAssignment[] }> {
  return api.post<{ teams: TeamAssignment[] }>(`/games/${gameId}/draw`, {}, token)
}

export async function deleteGame(id: string, token: string): Promise<void> {
  return api.delete(`/games/${id}`, token)
}
