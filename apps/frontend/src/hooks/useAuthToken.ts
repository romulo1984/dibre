import { useAuth } from '@clerk/clerk-react'

/**
 * Returns a function that resolves to the current session token for API calls.
 * Returns null when not signed in (viewer or anonymous).
 */
export function useAuthToken(): () => Promise<string | null> {
  const { getToken, isSignedIn } = useAuth()
  return async () => {
    if (!isSignedIn) return null
    return getToken()
  }
}
