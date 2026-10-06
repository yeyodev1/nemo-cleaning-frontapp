import APIBase from './httpBase'
import type { User } from '@/types/api'

class AuthService extends APIBase {
  login(email: string, password: string) {
    return this.post<{ token: string; user: User }>('auth/login', { email, password })
  }

  /** El contrato dice "usuario actual"; se acepta también `{ user }` por si el back lo envuelve. */
  async me(): Promise<User> {
    const data = await this.get<User | { user: User }>('auth/me')
    return 'user' in data && data.user ? data.user : (data as User)
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.patch<{ message?: string }>('auth/password', { currentPassword, newPassword })
  }
}

export const authService = new AuthService()
