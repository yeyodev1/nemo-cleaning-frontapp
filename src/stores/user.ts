import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import { TOKEN_KEY, readToken } from '@/services/httpBase'
import type { Role, User } from '@/types/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (s) => Boolean(s.user),
    role: (s): Role | null => s.user?.role ?? null,
    isAdmin: (s) => s.user?.role === 'admin',
    isManager: (s) => s.user?.role === 'manager',
    isOperator: (s) => s.user?.role === 'operator',
    /** Ruta de inicio según el rol: el operador solo ve sus servicios. */
    home: (s) => (s.user?.role === 'operator' ? '/admin/mis-servicios' : '/admin'),
  },

  actions: {
    hasRole(roles?: Role[]) {
      if (!roles || roles.length === 0) return true
      return Boolean(this.user && roles.includes(this.user.role))
    },

    /** Segundo paso del acceso por código: guarda el token y la cuenta. */
    async verifyCode(email: string, code: string) {
      const { token, user } = await authService.verify(email, code)
      try {
        localStorage.setItem(TOKEN_KEY, token)
      } catch {
        /* modo privado: la sesión dura lo que la pestaña */
      }
      this.user = user
      return user
    },

    /** Recupera la sesión guardada verificándola contra /auth/me. */
    async restore() {
      if (this.user) return this.user
      if (!readToken()) return null
      this.loading = true
      try {
        this.user = await authService.me()
        return this.user
      } catch (e) {
        // Solo un 401 invalida la sesión; si el servidor está caído se conserva el token.
        if ((e as { status?: number }).status === 401) this.clear()
        return null
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.user = null
      try {
        localStorage.removeItem(TOKEN_KEY)
      } catch {
        /* nada */
      }
    },
  },
})
