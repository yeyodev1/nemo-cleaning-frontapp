import { ref } from 'vue'
import { bookingsService, type BookingPatch, type ManualPaymentInput } from '@/services/bookings.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { BookingDetail, BookingStatus } from '@/types/api'

/** Detalle de un pedido en el panel y todas sus acciones. */
export function useBookingDetail(id: string) {
  const toast = useToastStore()
  const booking = ref<BookingDetail | null>(null)
  const loading = ref(true)
  const error = ref('')
  const saving = ref(false)

  async function load() {
    loading.value = true
    error.value = ''
    try {
      booking.value = await bookingsService.detail(id)
    } catch (e) {
      error.value = errorMessage(e, 'No se pudo cargar el pedido')
    } finally {
      loading.value = false
    }
  }

  // Las respuestas de PATCH pueden no traer los pagos: se conservan los que ya había.
  function merge(next: BookingDetail) {
    booking.value = { ...(booking.value || {}), ...next, payments: next.payments ?? booking.value?.payments } as BookingDetail
  }

  async function run(fn: () => Promise<void>, ok: string) {
    saving.value = true
    try {
      await fn()
      toast.success(ok)
      return true
    } catch (e) {
      toast.error(errorMessage(e))
      return false
    } finally {
      saving.value = false
    }
  }

  const update = (patch: BookingPatch, ok = 'Pedido actualizado') =>
    run(async () => merge(await bookingsService.update(id, patch)), ok)

  const setStatus = (status: BookingStatus, note?: string) =>
    run(async () => merge(await bookingsService.setStatus(id, status, note)), 'Estado actualizado')

  const addPayment = (body: ManualPaymentInput) =>
    run(async () => {
      await bookingsService.addPayment(id, body)
      booking.value = await bookingsService.detail(id)
    }, 'Pago registrado')

  const reviewPayment = (paymentId: string, approved: boolean) =>
    run(async () => {
      await bookingsService.reviewPayment(paymentId, approved)
      booking.value = await bookingsService.detail(id)
    }, approved ? 'Transferencia aprobada' : 'Transferencia rechazada')

  load()
  return { booking, loading, error, saving, load, update, setStatus, addPayment, reviewPayment }
}
