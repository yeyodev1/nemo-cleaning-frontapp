import { onMounted, ref, type Ref } from 'vue'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'

/** Lista simple (sin paginar) + estado de la hoja de edición. */
export function useCrudList<T extends { _id: string }>(fetcher: () => Promise<T[]>) {
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const editing = ref<T | null>(null) as Ref<T | null>
  const formOpen = ref(false)
  const toast = useToastStore()

  async function load() {
    loading.value = true
    try {
      items.value = await fetcher()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      loading.value = false
    }
  }

  function open(item: T | null) {
    editing.value = item
    formOpen.value = true
  }

  function onSaved() {
    formOpen.value = false
    load()
  }

  onMounted(load)
  return { items, loading, editing, formOpen, load, open, onSaved }
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
