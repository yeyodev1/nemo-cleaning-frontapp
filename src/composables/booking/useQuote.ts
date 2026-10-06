import { computed, effectScope, ref, watch } from 'vue'
import { publicService } from '@/services/public.service'
import { useCatalogStore } from '@/stores/catalog'
import type { QuoteResult } from '@/types/api'
import { cartCount, cartItems, localSubtotal } from './cart'
import { draft } from './useBookingDraft'

const server = ref<QuoteResult | null>(null)
const calculating = ref(false)
const failed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let seq = 0
let started = false

/**
 * Total del carrito: se calcula al instante en el cliente y se confirma con
 * POST /public/quote (el servidor manda). Si el API falla, queda el local.
 */
export function useQuote() {
  const catalog = useCatalogStore()
  const local = computed(() => localSubtotal(draft.cart, catalog.services))
  const count = computed(() => cartCount(draft.cart))
  const key = computed(() => JSON.stringify(cartItems(draft.cart)))

  async function refresh() {
    const items = cartItems(draft.cart)
    const mine = ++seq
    if (!items.length) {
      server.value = null
      calculating.value = false
      return
    }
    try {
      const q = await publicService.quote(items)
      if (mine !== seq) return
      server.value = q
      failed.value = false
    } catch {
      if (mine === seq) {
        server.value = null
        failed.value = true
      }
    } finally {
      if (mine === seq) calculating.value = false
    }
  }

  if (!started) {
    started = true
    // Scope propio: el watcher no muere cuando se desmonta el componente que lo creó.
    effectScope(true).run(() =>
      watch(
        key,
        () => {
          calculating.value = cartItems(draft.cart).length > 0
          clearTimeout(timer)
          timer = setTimeout(refresh, 450)
        },
        { immediate: true },
      ),
    )
  }

  const total = computed(() =>
    server.value && !calculating.value ? server.value.total : local.value,
  )
  const durationMinutes = computed(() => server.value?.durationMinutes || 0)

  return { local, total, count, server, calculating, failed, durationMinutes, refresh }
}
