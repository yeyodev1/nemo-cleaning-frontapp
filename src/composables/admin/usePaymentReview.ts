import { ref } from 'vue'
import { bookingsService } from '@/services/bookings.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { Payment } from '@/types/api'

/** Cola de transferencias por revisar: aprobar o rechazar con nota opcional. */
export function usePaymentReview(branch: () => string | undefined) {
  const items = ref<Payment[]>([])
  const loading = ref(false)
  const busy = ref('')
  const toast = useToastStore()

  async function load() {
    loading.value = true
    try {
      const res = await bookingsService.payments({ status: 'review', branch: branch(), limit: 100 })
      items.value = res.items
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      loading.value = false
    }
  }

  async function review(p: Payment, approved: boolean, note?: string) {
    busy.value = p._id
    try {
      await bookingsService.reviewPayment(p._id, approved, note || undefined)
      items.value = items.value.filter((x) => x._id !== p._id)
      toast.success(approved ? 'Transferencia aprobada' : 'Transferencia rechazada')
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      busy.value = ''
    }
  }

  return { items, loading, busy, load, review }
}
