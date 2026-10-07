import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { whatsappService } from '@/services/whatsapp.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useWhatsappInbox } from '@/stores/whatsappInbox'
import { errorMessage } from '@/utils/format'
import { useWaOptions } from './useWaOptions'
import type { WaOrder, WaTab } from '@/types/whatsapp'

/** Bandeja "Pedidos por WhatsApp": pestañas, búsqueda por código y refresco automático. */
export function useWaInbox() {
  const scope = useAdminScope()
  const toast = useToastStore()
  const badge = useWhatsappInbox()
  const wa = useWaOptions()

  const tab = ref<WaTab>('pending')
  const items = ref<WaOrder[]>([])
  const counts = ref({ pending: 0, unpaid: 0 })
  const loading = ref(true)
  const selected = ref<WaOrder | null>(null)
  const highlight = ref('')
  const code = ref('')
  const searching = ref(false)
  // "hace 5 min" se actualiza solo.
  const now = ref(Date.now())
  let clock: ReturnType<typeof setInterval> | undefined

  async function load(quiet = false) {
    if (!quiet) loading.value = true
    try {
      const res = await whatsappService.inbox(tab.value, scope.query)
      items.value = res.items
      counts.value = res.counts
      badge.pending = res.counts.pending
    } catch (e) {
      if (!quiet) toast.error(errorMessage(e))
    } finally {
      loading.value = false
    }
  }

  /** Pega "NEMO-000123", "123" o el mensaje completo del cliente: abre ese pedido. */
  async function search() {
    const q = code.value.trim()
    if (!q) return
    searching.value = true
    try {
      const found = await whatsappService.lookup(q)
      highlight.value = found._id
      selected.value = items.value.find((i) => i._id === found._id) || found
      code.value = ''
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      searching.value = false
    }
  }

  /** Tras una acción: se actualiza la tarjeta o sale de la pestaña si ya no le corresponde. */
  function onSaved(fresh: WaOrder) {
    const stays =
      tab.value === 'recent' ||
      (tab.value === 'pending' && fresh.status === 'pending') ||
      (tab.value === 'unpaid' && fresh.balance > 0)
    items.value = stays ? items.value.map((i) => (i._id === fresh._id ? fresh : i)) : items.value.filter((i) => i._id !== fresh._id)
    selected.value = null
    load(true)
  }

  watch(tab, () => load())
  watch(() => scope.branch, () => load())
  watch(() => badge.pending, (n, before) => n > before && tab.value === 'pending' && load(true))

  onMounted(() => {
    load()
    wa.load().catch((e) => toast.error(errorMessage(e)))
    clock = setInterval(() => (now.value = Date.now()), 30_000)
  })
  onBeforeUnmount(() => clearInterval(clock))

  return { tab, items, counts, loading, selected, highlight, code, searching, now, load, search, onSaved }
}
