export type Role = 'admin' | 'member' | 'viewer'

export interface GameEntity {
  id: string
  name: string
  numberOfTeams: number
  createdById: string | null
  groupId: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
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

/** Team as stored in DB (no 5/1 star lists; those are computed from players when returning API). */
export type TeamRecord = Omit<TeamAssignment, 'playerIdsWith5Stars' | 'playerIdsWith1Star'>
