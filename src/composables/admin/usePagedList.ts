import { reactive, ref, watch, type Ref } from 'vue'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { Paginated } from '@/types/api'

/**
 * Lista paginada con filtros: recarga al cambiar filtros (vuelve a página 1)
 * o al cambiar `deps` (p. ej. la sucursal global).
 */
export function usePagedList<T, F extends object>(
  fetcher: (q: F & { page: number }) => Promise<Paginated<T>>,
  initial: F,
  deps: Ref<unknown>[] = [],
) {
  const filters = reactive({ ...initial }) as F
  const items = ref<T[]>([]) as Ref<T[]>
  const page = ref(1)
  const pages = ref(1)
  const total = ref(0)
  const loading = ref(false)
  const toast = useToastStore()
  let seq = 0

  async function load(p = page.value) {
    const mine = ++seq
    loading.value = true
    try {
      const res = await fetcher({ ...(filters as F), page: p })
      if (mine !== seq) return
      items.value = res.items
      page.value = res.page || p
      pages.value = res.pages || 1
      total.value = res.total || res.items.length
    } catch (e) {
      if (mine === seq) toast.error(errorMessage(e))
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  watch(
    () => ({ ...(filters as object) }),
    () => {
      clearTimeout(timer)
      timer = setTimeout(() => load(1), 250)
    },
    { deep: true },
  )
  if (deps.length) watch(deps, () => load(1))

  return { filters, items, page, pages, total, loading, load }
}
