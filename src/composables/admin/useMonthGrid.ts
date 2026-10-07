import { computed, onBeforeUnmount, reactive, ref, watch, type Ref } from 'vue'
import { useReport } from '@/composables/admin/useReport'
import { useToastStore } from '@/stores/toast'
import { errorMessage, monthISO } from '@/utils/format'
import type { CellStatus, GridRow, MonthGridData } from '@/types/grid'

export const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

export const monthKey = (year: number, i: number) => `${year}-${String(i + 1).padStart(2, '0')}`

/** true desde tablet: la grilla completa ENE…DIC; en celular se elige un mes y se escribe en lista. */
export function useWide(query = '(min-width: 768px)') {
  const mq = typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia(query) : null
  const wide = ref(mq?.matches ?? true)
  const on = (e: MediaQueryListEvent) => (wide.value = e.matches)
  mq?.addEventListener('change', on)
  onBeforeUnmount(() => mq?.removeEventListener('change', on))
  return wide
}

/**
 * Grilla anual tipo hoja (Nómina, Comisiones): copia local de las filas para que los
 * totales cambien al instante, guardado por celda con estado (guardando / guardado / error)
 * y filas nuevas que viven en pantalla hasta que se escribe el primer valor.
 */
export function useMonthGrid(opts: {
  fetch: (year: number) => Promise<MonthGridData>
  save: (row: GridRow, month: string, value: number | null) => Promise<void>
  deps: Ref<unknown>[]
}) {
  const toast = useToastStore()
  const now = monthISO()
  const year = ref(Number(now.slice(0, 4)))
  const month = ref(Number(now.slice(5, 7)) - 1)
  const { data, loading, load } = useReport(() => opts.fetch(year.value), [year, ...opts.deps])
  const rows = ref<GridRow[]>([])
  const statuses = reactive<Record<string, CellStatus>>({})
  const timers = new Map<string, number>()

  watch(data, (d) => {
    if (!d) return
    // Las filas agregadas que aún no tienen valores se conservan al recargar.
    const fresh = d.rows.map((r) => ({ ...r, months: [...r.months] }))
    const pending = rows.value.filter((r) => r.months.every((v) => v === null) && !fresh.some((f) => f.key === r.key))
    rows.value = [...fresh, ...(d.year === year.value ? pending : [])]
  })
  watch(year, (y) => {
    rows.value = []
    month.value = y === Number(now.slice(0, 4)) ? Number(now.slice(5, 7)) - 1 : 0
  })

  const monthTotals = computed(() =>
    Array.from({ length: 12 }, (_, i) => rows.value.reduce((s, r) => s + (r.months[i] ?? 0), 0)),
  )
  const total = computed(() => monthTotals.value.reduce((s, n) => s + n, 0))
  const rowTotal = (r: GridRow) => r.months.reduce<number>((s, v) => s + (v ?? 0), 0)

  const cellId = (r: GridRow, i: number) => `${r.key}#${i}`
  const status = (r: GridRow, i: number) => statuses[cellId(r, i)] || ''
  function setStatus(id: string, st: CellStatus) {
    statuses[id] = st
    clearTimeout(timers.get(id))
    if (st === 'saved') timers.set(id, window.setTimeout(() => (statuses[id] = ''), 1800))
  }

  async function commit(r: GridRow, i: number, value: number | null) {
    const id = cellId(r, i)
    const prev = r.months[i] ?? null
    r.months[i] = value
    setStatus(id, 'saving')
    try {
      await opts.save(r, monthKey(year.value, i), value)
      setStatus(id, 'saved')
    } catch (e) {
      r.months[i] = prev
      setStatus(id, 'error')
      toast.error(errorMessage(e))
    }
  }

  function addRow(row: GridRow) {
    if (rows.value.some((r) => r.key === row.key)) return toast.info(`${row.name} ya está en la tabla`)
    rows.value.push(row)
  }

  function dropLocal(key: string) {
    rows.value = rows.value.filter((r) => r.key !== key)
  }

  return { year, month, data, loading, load, rows, monthTotals, total, rowTotal, status, commit, addRow, dropLocal }
}
