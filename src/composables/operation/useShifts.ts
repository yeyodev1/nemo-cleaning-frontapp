import { computed, ref, toRef, watch } from 'vue'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { errorMessage, monthISO } from '@/utils/format'
import type { ShiftMonth, ShiftStatus } from '@/types/operation'

const CYCLE: ShiftStatus[] = ['active', 'off', 'half']

/**
 * Calendario de turnos. Cada toque cambia la celda al instante y se guarda en lote
 * (medio segundo después) para no hacer una petición por clic.
 */
export function useShifts() {
  const scope = useAdminScope()
  const toast = useToastStore()
  const month = ref(monthISO())
  const data = ref<ShiftMonth | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const pending = new Map<string, { operator: string; date: string; status: ShiftStatus }>()
  let timer: ReturnType<typeof setTimeout> | undefined

  async function load() {
    loading.value = true
    try {
      data.value = await operationService.shifts(month.value, scope.query)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      loading.value = false
    }
  }
  watch([month, toRef(scope, 'branch')], load, { immediate: true })

  const statusOf = (op: string, date: string): ShiftStatus => data.value?.cells[op]?.[date] || 'active'

  function set(op: string, date: string, status: ShiftStatus) {
    if (!data.value) return
    ;(data.value.cells[op] ??= {})[date] = status
    pending.set(`${op}|${date}`, { operator: op, date, status })
    clearTimeout(timer)
    timer = setTimeout(flush, 500)
  }

  function cycle(op: string, date: string) {
    const next = CYCLE[(CYCLE.indexOf(statusOf(op, date)) + 1) % CYCLE.length]!
    set(op, date, next)
  }

  async function flush() {
    if (!pending.size) return
    const changes = [...pending.values()]
    pending.clear()
    saving.value = true
    try {
      await operationService.saveShifts(changes)
    } catch (e) {
      toast.error(errorMessage(e))
      await load()
    } finally {
      saving.value = false
    }
  }

  /** Día libre fijo: marca LIBRE todos los <día de la semana> del mes para ese operador. */
  function weeklyOff(op: string, weekday: number) {
    for (const d of data.value?.days || []) if (d.weekday === weekday) set(op, d.date, 'off')
  }

  function allActive(op: string) {
    for (const d of data.value?.days || []) set(op, d.date, 'active')
  }

  const activeByDay = computed(() => {
    const out: Record<string, { active: number; half: number }> = {}
    for (const d of data.value?.days || []) {
      const row = { active: 0, half: 0 }
      for (const o of data.value?.operators || []) {
        const s = statusOf(o._id, d.date)
        if (s === 'active') row.active++
        if (s === 'half') row.half++
      }
      out[d.date] = row
    }
    return out
  })

  return { month, data, loading, saving, statusOf, cycle, weeklyOff, allActive, activeByDay, flush }
}
