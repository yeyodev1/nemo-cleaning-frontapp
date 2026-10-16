import { ref, watch } from 'vue'
import { operatorService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage, todayISO } from '@/utils/format'
import type { OperatorDay, OperatorJob } from '@/types/api'

export type JobStatus = 'on_the_way' | 'in_progress' | 'completed'

/** GPS del celular una sola vez (al iniciar el servicio), con mensajes claros si falla. */
export function currentPosition(): Promise<{ lat: number; lng: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Tu celular no permite compartir la ubicación desde el navegador.'))
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy || 0) }),
      (e) =>
        reject(
          new Error(
            e.code === e.PERMISSION_DENIED
              ? 'Activa el permiso de ubicación: toca el candado junto a la dirección de la página → Ubicación → Permitir.'
              : e.code === e.TIMEOUT
                ? 'El GPS tardó demasiado. Sal a un lugar abierto e inténtalo otra vez.'
                : 'No pudimos obtener tu ubicación. Revisa que el GPS esté encendido e inténtalo otra vez.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    )
  })
}

/** Turno y servicios del operador para un día. Iniciar marca la ubicación (solo esa vez). */
export function useMyJobs() {
  const toast = useToastStore()
  const date = ref(todayISO())
  const day = ref<OperatorDay | null>(null)
  const loading = ref(false)
  const error = ref('')
  const busyId = ref('')
  const locatingId = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      day.value = await operatorService.day(date.value)
    } catch (e) {
      error.value = errorMessage(e, 'No se pudieron cargar tus servicios')
    } finally {
      loading.value = false
    }
  }

  function replace(job: OperatorJob) {
    if (!day.value) return
    day.value.bookings = day.value.bookings.map((j) => (j._id === job._id ? job : j))
  }

  async function setStatus(job: OperatorJob, status: JobStatus, payment?: { method: 'cash' | 'transfer'; cashReceived: number; handedTo?: string }) {
    busyId.value = job._id
    try {
      let location: { lat: number; lng: number; accuracy: number } | undefined
      if (status === 'in_progress' && !job.startCheck) {
        locatingId.value = job._id
        try {
          location = await currentPosition()
        } finally {
          locatingId.value = ''
        }
      }
      replace(await operatorService.setStatus(job._id, status, { location, payment }))
      toast.success(status === 'completed' ? '¡Servicio terminado!' : status === 'in_progress' ? 'Servicio iniciado · ubicación marcada' : 'Listo: vas en camino')
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      busyId.value = ''
    }
  }

  watch(date, load, { immediate: true })
  return { date, day, loading, error, busyId, locatingId, load, setStatus, replace }
}
