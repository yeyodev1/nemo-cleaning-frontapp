import { computed, ref } from 'vue'
import { addDays, monthRange, shortDate, todayISO, weekdayOf } from '@/utils/format'

/** Periodo por semana (lunes a domingo) o por quincena (1–15 / 16–fin), con flechas. */
export function usePeriod() {
  const mode = ref<'week' | 'fortnight'>('week')
  const anchor = ref(todayISO())

  const range = computed(() => {
    const a = anchor.value
    if (mode.value === 'week') {
      const back = (weekdayOf(a) + 6) % 7
      const from = addDays(a, -back)
      return { from, to: addDays(from, 6) }
    }
    const month = a.slice(0, 7)
    const { to } = monthRange(month)
    return Number(a.slice(8, 10)) <= 15 ? { from: `${month}-01`, to: `${month}-15` } : { from: `${month}-16`, to }
  })

  const label = computed(() => `${shortDate(range.value.from)} al ${shortDate(range.value.to)}`)

  function shift(n: number) {
    if (mode.value === 'week') anchor.value = addDays(anchor.value, 7 * n)
    else anchor.value = n > 0 ? addDays(range.value.to, 1) : addDays(range.value.from, -1)
  }

  return { mode, anchor, range, label, shift }
}
