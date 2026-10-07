import { defineStore } from 'pinia'
import { whatsappService } from '@/services/whatsapp.service'
import { useAdminScope } from './adminScope'

const EVERY_MS = 60_000
let timer: ReturnType<typeof setInterval> | undefined

/**
 * Burbuja de "Pedidos por WhatsApp" en el menú: cuántos esperan confirmación. Se consulta al
 * entrar al panel, cada minuto y al volver a la pestaña (los asesores la dejan abierta).
 */
export const useWhatsappInbox = defineStore('whatsappInbox', {
  state: () => ({ pending: 0 }),
  actions: {
    async refresh() {
      try {
        this.pending = (await whatsappService.count(useAdminScope().query)).pending
      } catch {
        /* sin conteo no se bloquea nada */
      }
    },
    start() {
      this.refresh()
      if (timer) return
      timer = setInterval(() => document.visibilityState === 'visible' && this.refresh(), EVERY_MS)
      document.addEventListener('visibilitychange', onVisible)
    },
    stop() {
      clearInterval(timer)
      timer = undefined
      document.removeEventListener('visibilitychange', onVisible)
    },
  },
})

function onVisible() {
  if (document.visibilityState === 'visible') useWhatsappInbox().refresh()
}
