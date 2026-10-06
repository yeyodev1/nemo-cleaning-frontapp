import { ref } from 'vue'
import { publicService } from '@/services/public.service'
import { errorMessage } from '@/utils/format'
import { readPayIntent } from './payIntent'

/**
 * Confirmación al volver de Payphone. Se dispara al cargar la página: si no se
 * confirma a tiempo, Payphone reversa el cobro. El backend es idempotente, así
 * que recargar no cobra dos veces.
 */
export type ConfirmPhase = 'confirming' | 'approved' | 'rejected' | 'error' | 'missing'

export function usePaymentConfirm() {
  const phase = ref<ConfirmPhase>('confirming')
  const message = ref('')
  const code = ref('')
  const token = ref('')

  async function confirm(id: string, txId: string) {
    const intent = readPayIntent()
    code.value = intent?.code || ''
    token.value = intent?.token || ''
    if (!id || !txId) {
      phase.value = 'missing'
      return
    }
    phase.value = 'confirming'
    try {
      const res = await publicService.confirmPayphone(id, txId)
      code.value = res.booking?.code || code.value
      token.value = res.accessToken || res.booking?.accessToken || token.value
      phase.value = res.status === 'approved' ? 'approved' : 'rejected'
    } catch (e) {
      message.value = errorMessage(e, 'No pudimos confirmar el pago.')
      phase.value = 'error'
    }
  }

  return { phase, message, code, token, confirm }
}
