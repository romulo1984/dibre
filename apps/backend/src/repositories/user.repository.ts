import { prisma } from '../database/client.js'
import type { Role } from '../domain/game.js'

export async function findUserByClerkId(
  clerkId: string
): Promise<{ id: string; role: Role } | null> {
  const row = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  })
  if (!row) return null
  return { id: row.id, role: row.role as Role }
}

export async function upsertUserFromClerk(data: {
  clerkId: string
  email?: string | null
  name?: string | null
  role?: Role
}): Promise<{ id: string; role: Role }> {
  const row = await prisma.user.upsert({
    where: { clerkId: data.clerkId },
    create: {
      clerkId: data.clerkId,
      email: data.email ?? undefined,
      name: data.name ?? undefined,
      role: (data.role ?? 'viewer') as 'viewer' | 'admin',
    },
    update: {
      email: data.email ?? undefined,
      name: data.name ?? undefined,
      role: data.role ? (data.role as 'viewer' | 'admin') : undefined,
    },
    select: { id: true, role: true },
  })
  return { id: row.id, role: row.role as Role }
}
