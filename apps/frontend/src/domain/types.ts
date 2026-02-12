export const STAR_MIN = 1
export const STAR_MAX = 5

export type Role = 'admin' | 'viewer'

export interface PlayerAttributes {
  stars: number
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
}

export interface Player {
  id: string
  name: string
  avatarUrl?: string | null
  stars: number
  pass: number
  shot: number
  defense: number
  energy: number
  speed: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface PlayerWithParticipation {
  player: Player
  participationCount: number
}

/** Pelada em que o jogador participou (resumo para listagem) */
export interface PlayerParticipationGame {
  id: string
  name: string
  createdAt: string
  deletedAt?: string | null
}

/** Parceiro de time: jogador + quantas vezes esteve no mesmo time no sorteio */
export interface PlayerTeammate {
  player: Player
  timesTogether: number
}

/** Resposta do perfil do jogador (página de detalhe) */
export interface PlayerProfileResponse {
  player: Player
  participationCount: number
  games: PlayerParticipationGame[]
  teammates: PlayerTeammate[]
}

export interface Game {
  id: string
  name: string
  numberOfTeams: number
  createdById: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface TeamAssignment {
  teamName: string
  order: number
  playerIds: string[]
  playerIdsWith5Stars: string[]
  playerIdsWith1Star: string[]
  avgStars: number
  avgPass: number
  avgShot: number
  avgDefense: number
  avgEnergy: number
  avgSpeed: number
}

// Display labels in Portuguese (UI only)
export const ATTRIBUTE_LABELS: Record<keyof PlayerAttributes, string> = {
  stars: 'Estrelas',
  pass: 'Passe',
  shot: 'Chute',
  defense: 'Defesa',
  energy: 'Energia',
  speed: 'Velocidade',
}
