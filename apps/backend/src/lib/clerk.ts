import { createClerkClient } from '@clerk/express'

let _clerkClient: ReturnType<typeof createClerkClient> | null = null

export function getClerkClient() {
  if (!_clerkClient) {
    _clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  }
  return _clerkClient
}
