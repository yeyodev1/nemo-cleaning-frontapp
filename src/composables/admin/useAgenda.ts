import { computed, ref, watch } from 'vue'
import { bookingsService } from '@/services/bookings.service'
import { useAdminScope } from '@/stores/adminScope'
import { errorMessage, todayISO } from '@/utils/format'
import type { Agenda, Booking, OperatorRef } from '@/types/api'

export const UNASSIGNED = '__none__'

export function useAgenda() {
  const scope = useAdminScope()
  const date = ref(todayISO())
  const data = ref<Agenda | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      data.value = await bookingsService.agenda(scope.query, date.value)
    } catch (e) {
      data.value = null
      error.value = errorMessage(e, 'No se pudo cargar la agenda')
    } finally {
      loading.value = false
    }
  }

  const bookings = computed(() =>
    [...(data.value?.bookings || [])].filter((b) => b.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time)),
  )
  const cancelled = computed(() => (data.value?.bookings || []).filter((b) => b.status === 'cancelled'))

  /** Agrupa por hora para la vista móvil. */
  const byTime = computed(() => {
    const groups = new Map<string, Booking[]>()
    for (const b of bookings.value) {
      const list = groups.get(b.time) || []
      list.push(b)
      groups.set(b.time, list)
    }
    return [...groups.entries()].map(([time, items]) => ({ time, items }))
  })

  /** Columnas por operador (+ "Sin asignar") para escritorio. */
  const columns = computed(() => {
    const ops: OperatorRef[] = (data.value?.operators || []).map((o) => ({ _id: o._id, name: o.name, color: o.color }))
    // Operadores asignados que no vinieron en la lista (otra sucursal) igual tienen columna.
    for (const b of bookings.value) for (const o of b.operators) if (!ops.some((x) => x._id === o._id)) ops.push(o)
    const cols = ops.map((o) => ({ id: o._id, name: o.name, color: o.color || '#1E2D3A', items: bookings.value.filter((b) => b.operators.some((x) => x._id === o._id)) }))
    const none = bookings.value.filter((b) => !b.operators.length)
    return [{ id: UNASSIGNED, name: 'Sin asignar', color: '#5F6B77', items: none }, ...cols]
  })

  function replace(b: Booking) {
    if (!data.value) return
    data.value.bookings = data.value.bookings.map((x) => (x._id === b._id ? { ...x, ...b } : x))
  }

  watch([date, () => scope.branch], load, { immediate: true })
  return { date, data, loading, error, load, bookings, cancelled, byTime, columns, replace }
}
