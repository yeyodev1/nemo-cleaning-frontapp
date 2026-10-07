import APIBase from './httpBase'
import type { User } from '@/types/api'

class AuthService extends APIBase {
  /** Siempre responde `{ ok: true }`: no revela si la cuenta existe. */
  requestCode(email: string) {
    return this.post<{ ok: true }>('auth/request-code', { email })
  }

  verify(email: string, code: string) {
    return this.post<{ token: string; user: User }>('auth/verify', { email, code })
  }

  /** El contrato dice "usuario actual"; se acepta también `{ user }` por si el back lo envuelve. */
  async me(): Promise<User> {
    const data = await this.get<User | { user: User }>('auth/me')
    return 'user' in data && data.user ? data.user : (data as User)
  }
}

export const authService = new AuthService()
