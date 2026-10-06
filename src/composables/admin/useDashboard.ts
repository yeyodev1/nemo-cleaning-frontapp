import { ref, watch } from 'vue'
import { bookingsService } from '@/services/bookings.service'
import { useAdminScope } from '@/stores/adminScope'
import { errorMessage, monthISO, monthRange } from '@/utils/format'
import type { Dashboard } from '@/types/api'

export function useDashboard() {
  const scope = useAdminScope()
  const range = ref(monthRange(monthISO()))
  const data = ref<Dashboard | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      data.value = await bookingsService.dashboard({ branch: scope.query, ...range.value })
    } catch (e) {
      error.value = errorMessage(e, 'No se pudo cargar el resumen')
    } finally {
      loading.value = false
    }
  }

  watch([() => scope.branch, range], load, { deep: true, immediate: true })
  return { range, data, loading, error, load }
}
