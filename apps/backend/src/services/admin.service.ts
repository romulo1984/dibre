import * as adminRepo from '../repositories/admin.repository.js'
import { getClerkClient } from '../lib/clerk.js'

export async function listUsers(params: { page: number; perPage: number; search?: string }) {
  return adminRepo.listUsers(params)
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await adminRepo.deleteUser(userId)
  if (!result) return false

  try {
    const clerk = getClerkClient()

    // Revoke all active sessions to force immediate logout
    const sessions = await clerk.sessions.getSessionList({ userId: result.clerkId, status: 'active' })
    await Promise.all(
      sessions.data.map((s) => clerk.sessions.revokeSession(s.id)),
    )

    await clerk.users.deleteUser(result.clerkId)
  } catch (err) {
    console.error('[admin] Failed to delete user from Clerk:', err)
  }

  return true
}

export async function getUserById(userId: string) {
  return adminRepo.getUserById(userId)
}
