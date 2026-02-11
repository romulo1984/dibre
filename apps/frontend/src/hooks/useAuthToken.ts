import { useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'

/**
 * Returns a stable function that resolves to the current session token for API calls.
 * Returns null when not signed in. Memoized to avoid triggering useEffect on every render.
 */
export function useAuthToken(): () => Promise<string | null> {
  const { getToken, isSignedIn } = useAuth()
  return useCallback(async () => {
    if (!isSignedIn) return null
    return getToken()
  }, [getToken, isSignedIn])
}
