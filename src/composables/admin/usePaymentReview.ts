import { ref } from 'vue'
import { bookingsService } from '@/services/bookings.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { Payment } from '@/types/api'

/** Cola de transferencias por revisar: aprobar o rechazar con nota opcional. */
export function usePaymentReview(branch: () => string | undefined) {
  const items = ref<Payment[]>([])
  const total = ref(0)
  const totalAmount = ref(0)
  const page = ref(1)
  const pages = ref(1)
  const loading = ref(false)
  const busy = ref('')
  const toast = useToastStore()

  // Por tandas de 20: con el historial hay cientos en revisión y pintarlas todas congela el celular.
  async function load(more = false) {
    loading.value = true
    try {
      const next = more ? page.value + 1 : 1
      const res = await bookingsService.payments({ status: 'review', branch: branch(), limit: 20, page: next })
      items.value = more ? [...items.value, ...res.items] : res.items
      total.value = res.total
      totalAmount.value = (res as { totalAmount?: number }).totalAmount ?? 0
      page.value = next
      pages.value = res.pages
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
      total.value = Math.max(0, total.value - 1)
      totalAmount.value = Math.max(0, totalAmount.value - p.amount)
      toast.success(approved ? 'Transferencia aprobada' : 'Transferencia rechazada')
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      busy.value = ''
    }
  }

  return { items, total, totalAmount, page, pages, loading, busy, load, review }
}
