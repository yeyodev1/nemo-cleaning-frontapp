import { defineStore } from 'pinia'
import { customerService } from '@/services/customer.service'
import { CUSTOMER_TOKEN_KEY, readCustomerToken } from '@/services/httpBase'
import type { CustomerAccount, CustomerProfileInput } from '@/types/api'

/**
 * Sesión del cliente de la web pública. Vive aparte de la del personal (otro
 * token, otra clave en localStorage): una no abre la otra.
 */
export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customer: null as CustomerAccount | null,
    // Evita pedir /customer/me en cada navegación si no hay sesión válida.
    checked: false,
  }),

  getters: {
    isAuthenticated: (s) => Boolean(s.customer),
    firstName: (s) => (s.customer?.name || '').trim().split(/\s+/)[0] || '',
  },

  actions: {
    async verifyCode(email: string, code: string) {
      const { token, customer } = await customerService.verify(email, code)
      try {
        localStorage.setItem(CUSTOMER_TOKEN_KEY, token)
      } catch {
        /* modo privado: la sesión dura lo que la pestaña */
      }
      this.customer = customer
      this.checked = true
      return customer
    },

    /** Recupera la sesión guardada verificándola contra /customer/me. */
    async restore() {
      if (this.customer) return this.customer
      if (!readCustomerToken()) {
        this.checked = true
        return null
      }
      try {
        this.customer = await customerService.me()
        return this.customer
      } catch (e) {
        // Solo un 401 invalida la sesión; si el servidor está caído se conserva el token.
        if ((e as { status?: number }).status === 401) this.clear()
        return null
      } finally {
        this.checked = true
      }
    },

    /** Relee la ficha (p. ej. tras reservar, el back actualiza nombre y teléfono). */
    async refresh() {
      if (!this.customer) return
      try {
        this.customer = await customerService.me()
      } catch {
        /* se queda con la copia anterior */
      }
    },

    async update(body: CustomerProfileInput) {
      this.customer = await customerService.updateMe(body)
      return this.customer
    },

    clear() {
      this.customer = null
      try {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY)
      } catch {
        /* nada */
      }
    },
  },
})
