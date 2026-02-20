export type GroupRequestStatus = 'pending' | 'accepted' | 'declined'
export type NotificationType = 'GROUP_JOIN_REQUEST' | 'GROUP_INVITATION'

export interface GroupEntity {
  id: string
  name: string
  description: string | null
  slug: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface GroupMemberEntity {
  id: string
  groupId: string
  userId: string
  joinedAt: Date
  user?: {
    id: string
    name: string | null
    email: string | null
  }
}

export interface GroupJoinRequestEntity {
  id: string
  groupId: string
  userId: string
  status: GroupRequestStatus
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string | null
    email: string | null
  }
}

export interface GroupInvitationEntity {
  id: string
  groupId: string
  invitedUserId: string
  invitedByUserId: string
  status: GroupRequestStatus
  createdAt: Date
  updatedAt: Date
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

export interface NotificationEntity {
  id: string
  type: NotificationType
  toUserId: string
  fromUserId: string
  groupId: string | null
  relatedId: string | null
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
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

export interface UserSummary {
  id: string
  name: string | null
  email: string | null
}
