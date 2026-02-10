import type { AuthLocals } from './auth.js'

declare global {
  namespace Express {
    interface Response {
      locals: Record<string, unknown> & Partial<AuthLocals>
    }
  }
}

export {}
