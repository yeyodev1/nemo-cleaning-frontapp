import { ref } from 'vue'
import { publicService } from '@/services/public.service'
import { errorMessage } from '@/utils/format'
import type { CreateBookingInput, CreateBookingResult } from '@/types/api'
import { cartItems } from './cart'
import { draft, resetDraft } from './useBookingDraft'
import { savePayIntent } from './payIntent'

// Resultado a nivel de módulo: la pantalla final sobrevive a cambios de paso.
const result = ref<CreateBookingResult | null>(null)

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
    try {
      const res = await publicService.createBooking(payload())
      result.value = res
      if (res.payment) {
        savePayIntent({
          code: res.booking.code,
          token: res.accessToken,
          clientTransactionId: res.payment.clientTransactionId,
        })
      }
      resetDraft()
      return res
    } catch (e) {
      error.value = errorMessage(e, 'No pudimos crear tu pedido. Inténtalo de nuevo.')
      return null
    } finally {
      sending.value = false
    }
  }

  function clearResult() {
    result.value = null
  }

  return { submit, sending, error, result, clearResult }
}
