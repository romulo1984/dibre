import type { Request, Response, NextFunction } from 'express'
import { createClerkClient, getAuth } from '@clerk/express'
import type { Role } from '../domain/game.js'
import { upsertUserFromClerk } from '../repositories/user.repository.js'
import type { AuthLocals } from '../types/auth.js'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export type { AuthLocals }

/**
 * Require authenticated user (any role). Returns 401 JSON for API.
 * Use for admin-only routes after ensuring role is admin.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId } = getAuth(req)
  if (!userId) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  let user: { id: string; role: Role } | null = null
  try {
    const clerkUser = await clerkClient.users.getUser(userId)
    const roleFromClerk = (clerkUser.publicMetadata?.role as Role) ?? 'viewer'
    user = await upsertUserFromClerk({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
      name:
        clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : (clerkUser.firstName ?? clerkUser.username ?? null),
      role: roleFromClerk,
    })
  } catch {
    res.status(401).json({ error: 'User not found' })
    return
  }

  if (!user) {
    res.status(401).json({ error: 'User not found' })
    return
  }

  res.locals.userId = user.id
  res.locals.clerkId = userId
  res.locals.role = user.role
  next()
}

/**
 * Require admin role. Use after requireAuth.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const locals = res.locals
  if (!locals?.role || locals.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }
  next()
}
