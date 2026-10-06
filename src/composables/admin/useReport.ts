import { ref, watch, type Ref } from 'vue'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'

/** Carga un reporte y lo recarga cuando cambian sus parámetros (fecha, mes, sucursal). */
export function useReport<T>(fetcher: () => Promise<T>, deps: Ref<unknown>[] | (() => unknown)) {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref('')
  const toast = useToastStore()
  let seq = 0

  async function load() {
    const mine = ++seq
    loading.value = true
    error.value = ''
    try {
      const res = await fetcher()
      if (mine === seq) data.value = res
    } catch (e) {
      if (mine !== seq) return
      error.value = errorMessage(e)
      toast.error(error.value)
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  watch(deps, load, { immediate: true })
  return { data, loading, error, load }
}
