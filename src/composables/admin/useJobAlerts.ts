import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useToastStore } from '@/stores/toast'
import { readJSON, writeJSON } from '@/utils/storage'
import { todayISO } from '@/utils/format'
import type { OperatorDay } from '@/types/api'

export interface JobAlert {
  id: string
  tone: 'info' | 'warning' | 'danger' | 'success'
  icon: 'clock' | 'alert' | 'bell' | 'play'
  text: string
  jobId?: string
}

const SEEN_KEY = 'nemo_jobs_seen'
const REFRESH_MS = 2 * 60 * 1000

const nowMinutes = () => {
  const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Guayaquil', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  const [h = 0, m = 0] = t.split(':').map(Number)
  return h * 60 + m
}
const toMin = (t: string) => {
  const [h = 0, m = 0] = t.split(':').map(Number)
  return h * 60 + m
}

/**
 * Alertas del día para el operador: servicios nuevos asignados, el próximo, los atrasados
 * y el que está en curso sin terminar. Se refresca solo cada 2 minutos y al volver a la app.
 */
export function useJobAlerts(day: Ref<OperatorDay | null>, date: Ref<string>, reload: () => Promise<void> | void) {
  const toast = useToastStore()
  const now = ref(nowMinutes())
  const newIds = ref<string[]>([])
  let timer: ReturnType<typeof setInterval> | undefined

  // Servicios que el operador aún no había visto (por día): se marcan como "Nuevo".
  watch(day, (d) => {
    if (!d) return
    const seen = readJSON<Record<string, string[]>>(SEEN_KEY, {})
    const before = seen[d.date]
    const ids = d.bookings.map((b) => b._id)
    const fresh = before ? ids.filter((id) => !before.includes(id)) : []
    if (fresh.length) {
      newIds.value = [...new Set([...newIds.value, ...fresh])]
      toast.success(fresh.length === 1 ? 'Te asignaron un servicio nuevo' : `Te asignaron ${fresh.length} servicios nuevos`)
      navigator.vibrate?.(200)
    }
    // Solo se guardan los últimos días para no crecer sin fin.
    const keep = Object.fromEntries(Object.entries({ ...seen, [d.date]: ids }).sort(([a], [b]) => b.localeCompare(a)).slice(0, 7))
    writeJSON(SEEN_KEY, keep)
  })

  const alerts = computed<JobAlert[]>(() => {
    const d = day.value
    if (!d || d.date !== todayISO()) return []
    const list: JobAlert[] = []
    const open = d.bookings.filter((b) => !['completed', 'cancelled', 'no_show'].includes(b.status))

    if (newIds.value.length) {
      list.push({ id: 'new', tone: 'info', icon: 'bell', text: newIds.value.length === 1 ? 'Tienes un servicio nuevo asignado. Revísalo abajo.' : `Tienes ${newIds.value.length} servicios nuevos asignados. Revísalos abajo.` })
    }
    for (const b of open.filter((b) => b.status === 'in_progress')) {
      list.push({ id: `run-${b._id}`, tone: 'success', icon: 'play', jobId: b._id, text: `En curso: ${b.time} · ${b.customer?.name}. Al acabar toca Terminar y reporta el cobro.` })
    }
    for (const b of open.filter((b) => b.status !== 'in_progress' && toMin(b.time) + 15 < now.value)) {
      list.push({ id: `late-${b._id}`, tone: 'danger', icon: 'alert', jobId: b._id, text: `Atrasado: ${b.time} · ${b.customer?.name}. Aún no lo inicias.` })
    }
    const next = open.find((b) => b.status !== 'in_progress' && toMin(b.time) + 15 >= now.value)
    if (next) {
      const mins = toMin(next.time) - now.value
      const when = mins <= 0 ? 'ahora' : mins < 60 ? `en ${mins} min` : `a las ${next.time}`
      list.push({ id: `next-${next._id}`, tone: mins <= 30 ? 'warning' : 'info', icon: 'clock', jobId: next._id, text: `Próximo servicio ${when}: ${next.time} · ${next.customer?.name}${next.zone ? ` (${next.zone})` : ''}.` })
    }
    if (!open.length && d.bookings.length) list.push({ id: 'done', tone: 'success', icon: 'play', text: '¡Terminaste todos tus servicios de hoy!' })
    return list
  })

  function tick() {
    now.value = nowMinutes()
    if (date.value === todayISO()) reload()
  }
  function onVisible() {
    if (document.visibilityState === 'visible') tick()
  }

  onMounted(() => {
    timer = setInterval(tick, REFRESH_MS)
    document.addEventListener('visibilitychange', onVisible)
  })
  onBeforeUnmount(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
  })

  return { alerts, newIds }
}
