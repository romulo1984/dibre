import type { Role } from '../domain/game.js'

export interface AuthLocals {
  userId: string
  clerkId: string
  role: Role
}
