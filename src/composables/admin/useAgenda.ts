import { computed, ref, watch } from 'vue'
import { bookingsService } from '@/services/bookings.service'
import { useAdminScope } from '@/stores/adminScope'
import { addDays, errorMessage, todayISO, weekStart } from '@/utils/format'
import { readJSON, writeJSON } from '@/utils/storage'
import type { Agenda, Booking, OperatorRef } from '@/types/api'

export const UNASSIGNED = '__none__'
export type AgendaView = 'day' | 'week' | 'month'

const VIEW_KEY = 'nemo_agenda_view'

/** Días que muestra cada vista: la semana va de lunes a domingo; el mes, 6 semanas completas. */
export function agendaRange(view: AgendaView, date: string): { from: string; to: string } {
  if (view === 'week') {
    const from = weekStart(date)
    return { from, to: addDays(from, 6) }
  }
  if (view === 'month') {
    const from = weekStart(`${date.slice(0, 7)}-01`)
    return { from, to: addDays(from, 41) }
  }
  return { from: date, to: date }
}

export function useAgenda() {
  const scope = useAdminScope()
  const date = ref(todayISO())
  const saved = readJSON<AgendaView>(VIEW_KEY, 'day')
  const view = ref<AgendaView>(['day', 'week', 'month'].includes(saved) ? saved : 'day')
  const data = ref<Agenda | null>(null)
  const loading = ref(false)
  const error = ref('')

  const range = computed(() => agendaRange(view.value, date.value))

  let seq = 0
  async function load() {
    const mine = ++seq
    loading.value = true
    error.value = ''
    try {
      const res = await bookingsService.agenda(scope.query, date.value, view.value === 'day' ? undefined : range.value)
      if (mine === seq) data.value = res
    } catch (e) {
      if (mine !== seq) return
      data.value = null
      error.value = errorMessage(e, 'No se pudo cargar la agenda')
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  const bookings = computed(() =>
    [...(data.value?.bookings || [])]
      .filter((b) => b.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
  )
  const cancelled = computed(() => (data.value?.bookings || []).filter((b) => b.status === 'cancelled'))

  /** Servicios por día (semana y mes). */
  const byDate = computed(() => {
    const map = new Map<string, Booking[]>()
    for (const b of bookings.value) {
      const list = map.get(b.date) || []
      list.push(b)
      map.set(b.date, list)
    }
    return map
  })

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

  /** Desde semana o mes: tocar un día abre ese día. */
  function openDay(iso: string) {
    date.value = iso
    view.value = 'day'
  }

  watch(view, (v) => writeJSON(VIEW_KEY, v))
  // Solo se recarga si cambia lo que se pide (moverse dentro de la misma semana no recarga).
  watch(
    () => `${view.value === 'day' ? date.value : `${range.value.from}_${range.value.to}`}|${scope.branch}`,
    load,
    { immediate: true },
  )
  return { date, view, range, data, loading, error, load, bookings, cancelled, byDate, byTime, columns, replace, openDay }
}
