import { computed, type Ref } from 'vue'
import { monthRange } from '@/utils/format'

const MONTH = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Encabezados Q1 / Q2 con las fechas del mes ("Q1 · 1–15 oct", "Q2 · 16–31 oct"). */
export function useQColumns(month: Ref<string>) {
  return computed(() => {
    const m = MONTH[Number(month.value.slice(5, 7)) - 1] || ''
    const last = Number(monthRange(month.value).to.slice(8, 10))
    return { q1: `Q1 · 1–15 ${m}`, q2: `Q2 · 16–${last} ${m}`, total: 'Total mes' }
  })
}
