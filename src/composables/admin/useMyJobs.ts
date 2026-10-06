import { ref, watch } from 'vue'
import { operatorService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage, todayISO } from '@/utils/format'
import type { Booking } from '@/types/api'

export type JobStatus = 'on_the_way' | 'in_progress' | 'completed'

/** Servicios del operador para un día, con cambio de estado optimista. */
export function useMyJobs() {
  const toast = useToastStore()
  const date = ref(todayISO())
  const jobs = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref('')
  const busyId = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const list = await operatorService.bookings(date.value)
      jobs.value = [...list].sort((a, b) => a.time.localeCompare(b.time))
    } catch (e) {
      error.value = errorMessage(e, 'No se pudieron cargar tus servicios')
    } finally {
      loading.value = false
    }
  }

  async function setStatus(job: Booking, status: JobStatus, note?: string) {
    const prev = job.status
    busyId.value = job._id
    job.status = status
    try {
      const updated = await operatorService.setStatus(job._id, status, note)
      Object.assign(job, updated)
      toast.success(status === 'completed' ? '¡Servicio terminado!' : status === 'in_progress' ? 'Servicio iniciado' : 'Avisamos que vas en camino')
    } catch (e) {
      job.status = prev
      toast.error(errorMessage(e))
    } finally {
      busyId.value = ''
    }
  }

  watch(date, load, { immediate: true })
  return { date, jobs, loading, error, busyId, load, setStatus }
}
