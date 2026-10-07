import { ref } from 'vue'
import { customerService } from '@/services/customer.service'
import { errorMessage } from '@/utils/format'
import type { CustomerBooking } from '@/types/api'

/** "Mis pedidos": páginas de 10 que se van sumando con "Ver más". */
export function useMyBookings() {
  const items = ref<CustomerBooking[]>([])
  const total = ref(0)
  const page = ref(0)
  const pages = ref(1)
  const loading = ref(false)
  const error = ref('')

  async function load(more = false) {
    loading.value = true
    error.value = ''
    try {
      const next = more ? page.value + 1 : 1
      const res = await customerService.bookings(next, 10)
      items.value = more ? [...items.value, ...res.items] : res.items
      total.value = res.total
      page.value = res.page
      pages.value = res.pages
    } catch (e) {
      error.value = errorMessage(e, 'No pudimos cargar tus pedidos')
    } finally {
      loading.value = false
    }
  }

  return { items, total, page, pages, loading, error, load }
}
