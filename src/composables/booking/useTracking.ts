import { computed, ref } from 'vue'
import { publicService } from '@/services/public.service'
import { useCatalogStore } from '@/stores/catalog'
import { errorMessage } from '@/utils/format'
import type { Booking, Branch } from '@/types/api'

/** Página pública /pedido/:code?token=: carga, comprobante y cancelación. */
export function useTracking(code: string, token: string) {
  const catalog = useCatalogStore()
  const booking = ref<Booking | null>(null)
  const loading = ref(true)
  const error = ref('')
  const busy = ref(false)

  const branch = computed<Branch | undefined>(() => {
    const b = booking.value?.branch
    if (!b) return undefined
    return typeof b === 'string' ? catalog.branchById(b) : b
  })

  const closed = computed(() =>
    ['completed', 'cancelled', 'no_show'].includes(booking.value?.status || ''),
  )
  const needsPayment = computed(
    () =>
      !!booking.value &&
      !closed.value &&
      ['pending', 'partial'].includes(booking.value.paymentStatus),
  )
  const canCancel = computed(() => {
    const b = booking.value
    if (!b || !['pending', 'confirmed'].includes(b.status)) return false
    return !(b.paymentMethod === 'card' && b.paymentStatus === 'paid')
  })

  async function load() {
    if (!token) {
      loading.value = false
      error.value = 'Este enlace no es válido. Usa el enlace que te enviamos por correo.'
      return
    }
    loading.value = true
    error.value = ''
    try {
      catalog.load()
      booking.value = await publicService.booking(code, token)
    } catch (e) {
      const status = (e as { status?: number }).status
      error.value =
        status === 404 || status === 401 || status === 403
          ? 'No encontramos este pedido o el enlace ya no es válido.'
          : errorMessage(e, 'No pudimos cargar tu pedido.')
    } finally {
      loading.value = false
    }
  }

  async function uploadProof(file: File): Promise<string> {
    busy.value = true
    try {
      booking.value = await publicService.uploadBookingProof(code, token, file)
      return ''
    } catch (e) {
      return errorMessage(e, 'No pudimos subir el comprobante.')
    } finally {
      busy.value = false
    }
  }

  async function cancel(): Promise<string> {
    busy.value = true
    try {
      booking.value = await publicService.cancelBooking(code, token)
      return ''
    } catch (e) {
      return errorMessage(e, 'No pudimos cancelar el pedido.')
    } finally {
      busy.value = false
    }
  }

  return {
    booking,
    loading,
    error,
    busy,
    branch,
    closed,
    needsPayment,
    canCancel,
    load,
    uploadProof,
    cancel,
  }
}
