import { computed, ref, watch, type Ref } from 'vue'
import { publicService } from '@/services/public.service'
import { addDays, errorMessage, todayISO, weekdayOf } from '@/utils/format'
import type { Branch, Slot } from '@/types/api'

/** Próximos días laborables de la sucursal y los horarios del día elegido. */
export function useAvailability(branch: Ref<Branch | undefined>, date: Ref<string>, days = 30) {
  const slots = ref<Slot[]>([])
  const loading = ref(false)
  const error = ref('')
  let seq = 0

  const dates = computed(() => {
    const work = branch.value?.workDays
    const out: string[] = []
    const start = todayISO()
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i)
      if (!work || !work.length || work.includes(weekdayOf(d))) out.push(d)
    }
    return out
  })

  async function load() {
    const b = branch.value?._id
    if (!b || !date.value) {
      slots.value = []
      return
    }
    const mine = ++seq
    loading.value = true
    error.value = ''
    try {
      const res = await publicService.availability(b, date.value)
      if (mine === seq) slots.value = res.slots || []
    } catch (e) {
      if (mine === seq) {
        slots.value = []
        error.value = errorMessage(e, 'No pudimos cargar los horarios.')
      }
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  watch([() => branch.value?._id, date], load, { immediate: true })

  return { dates, slots, loading, error, reload: load }
}
