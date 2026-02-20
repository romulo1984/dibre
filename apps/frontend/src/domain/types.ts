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
  createdById?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface PlayerWithParticipation {
  player: Player
  participationCount: number
}

/** Game em que o jogador participou (resumo para listagem) */
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
  isOwner?: boolean
  createdByName?: string | null
  games: PlayerParticipationGame[]
  teammates: PlayerTeammate[]
}

export interface Game {
  id: string
  name: string
  numberOfTeams: number
  createdById: string | null
  createdByName?: string | null
  isOwner?: boolean
  groupId?: string | null
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

// ── Groups ────────────────────────────────────────────────────────────────────

export type GroupRequestStatus = 'pending' | 'accepted' | 'declined'
export type NotificationType = 'GROUP_JOIN_REQUEST' | 'GROUP_INVITATION'

export interface Group {
  id: string
  name: string
  description: string | null
  slug: string
  ownerId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface GroupMembership {
  isOwner: boolean
  isMember: boolean
  pendingRequest: boolean
  pendingInvitation: boolean
}

export interface GroupDetailResponse {
  group: Group
  membership: GroupMembership
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  joinedAt: string
  user?: {
    id: string
    name: string | null
    email: string | null
  }
}

export interface GroupJoinRequest {
  id: string
  groupId: string
  userId: string
  status: GroupRequestStatus
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string | null
    email: string | null
  }
}

export interface GroupInvitation {
  id: string
  groupId: string
  invitedUserId: string
  invitedByUserId: string
  status: GroupRequestStatus
  createdAt: string
  updatedAt: string
  group?: {
    id: string
    name: string
    slug: string
  }
  invitedBy?: {
    id: string
    name: string | null
    email: string | null
  }
  invitedUser?: {
    id: string
    name: string | null
    email: string | null
  }
}

export interface GroupMembersWithPendingResponse {
  members: GroupMember[]
  pendingInvitations: GroupInvitation[]
}

export interface Notification {
  id: string
  type: NotificationType
  toUserId: string
  fromUserId: string
  groupId: string | null
  relatedId: string | null
  message: string
  read: boolean
  createdAt: string
  updatedAt: string
  fromUser?: {
    id: string
    name: string | null
    email: string | null
  }
  group?: {
    id: string
    name: string
    slug: string
  } | null
}

export interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

export interface UserSummary {
  id: string
  name: string | null
  email: string | null
}
