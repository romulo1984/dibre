import type { Game, TeamAssignment, Player } from '@/domain/types'
import { api } from '@/services/api'

export async function listGames(token: string): Promise<Game[]> {
  return api.get<Game[]>('/games', token)
}

export async function getGame(id: string, token: string): Promise<Game> {
  return api.get<Game>(`/games/${id}`, token)
}

export async function getGamePlayers(
  id: string,
  token: string
): Promise<{ playerIds: string[] }> {
  return api.get<{ playerIds: string[] }>(`/games/${id}/players`, token)
}

export async function getGameTeams(
  id: string,
  token: string
): Promise<{ teams: TeamAssignment[] }> {
  return api.get<{ teams: TeamAssignment[] }>(`/games/${id}/teams`, token)
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

export async function getGameTeamPlayers(id: string, token: string): Promise<Player[]> {
  return api.get<Player[]>(`/games/${id}/team-players`, token)
}
