import { ref } from 'vue'
import { publicService } from '@/services/public.service'
import { errorMessage } from '@/utils/format'
import { useCustomerStore } from '@/stores/customer'
import type { CreateBookingInput, CreateBookingResult } from '@/types/api'
import { cartItems } from './cart'
import { draft, resetDraft } from './useBookingDraft'
import { savePayIntent } from './payIntent'
import { orderWhatsapp } from './whatsappOrder'
import { isMobileDevice, openWhatsApp } from '@/utils/whatsapp'

// Resultado a nivel de módulo: la pantalla final sobrevive a cambios de paso.
const result = ref<CreateBookingResult | null>(null)
/** false = el navegador bloqueó la pestaña de WhatsApp: la pantalla final lo dice y ofrece el botón. */
const whatsappOpened = ref(true)

/**
 * En escritorio la pestaña de WhatsApp se abre en el mismo clic (antes de esperar al servidor),
 * porque después de un await el navegador la bloquea. En el celular no hace falta: se navega.
 */
function prepareWhatsappTab(): Window | null {
  if (isMobileDevice()) return null
  const tab = window.open('', '_blank')
  if (tab) {
    try {
      tab.document.title = 'Abriendo WhatsApp…'
      tab.document.body.innerHTML =
        '<p style="font-family:system-ui,sans-serif;padding:2rem;color:#12263F">Abriendo WhatsApp…</p>'
    } catch {
      /* algunas políticas no dejan escribir: no importa */
    }
  }
  return tab
}

export function useBookingSubmit() {
  const sending = ref(false)
  const error = ref('')

  function payload(): CreateBookingInput {
    const method = draft.paymentMethod || 'cash'
    return {
      branch: draft.branch,
      items: cartItems(draft.cart),
      date: draft.date,
      time: draft.time,
      customer: {
        name: draft.customer.name.trim(),
        email: draft.customer.email.trim(),
        phone: draft.customer.phone.trim(),
        documentId: draft.customer.documentId.trim(),
      },
      address: draft.address.trim(),
      zone: draft.zone.trim(),
      reference: draft.reference.trim(),
      notes: draft.notes.trim(),
      paymentMethod: method,
      transferProofUrl: method === 'transfer' ? draft.transferProofUrl : undefined,
      invoice: draft.invoice.required
        ? { ...draft.invoice }
        : { required: false, name: '', documentId: '', email: '', address: '' },
    }
  }

  async function submit() {
    sending.value = true
    error.value = ''
    const viaWhatsapp = draft.paymentMethod === 'whatsapp'
    const tab = viaWhatsapp ? prepareWhatsappTab() : null
    try {
      const res = await publicService.createBooking(payload())
      result.value = res
      if (viaWhatsapp) whatsappOpened.value = openWhatsApp(orderWhatsapp(res).url, tab)
      if (res.payment) {
        savePayIntent({
          code: res.booking.code,
          token: res.accessToken,
          clientTransactionId: res.payment.clientTransactionId,
        })
      }
      resetDraft()
      // Con sesión: el back pudo actualizar nombre/teléfono con los del pedido.
      useCustomerStore().refresh()
      return res
    } catch (e) {
      tab?.close()
      error.value = errorMessage(e, 'No pudimos crear tu pedido. Inténtalo de nuevo.')
      return null
    } finally {
      sending.value = false
    }
  }

  function clearResult() {
    result.value = null
  }

  return { submit, sending, error, result, clearResult, whatsappOpened }
}
