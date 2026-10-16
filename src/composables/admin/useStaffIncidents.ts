import { ref } from 'vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { errorMessage } from '@/utils/format'
import type { StaffIncident } from '@/types/operation'

/** Lista de novedades del personal (de una persona o de todo el equipo) con borrar. */
export function useStaffIncidents(userId?: string) {
  const toast = useToastStore()
  const me = useUserStore()
  const items = ref<StaffIncident[]>([])
  const loading = ref(false)
  const removing = ref<StaffIncident | null>(null)
  const busy = ref(false)

  async function load() {
    loading.value = true
    try {
      items.value = (await operationService.staffIncidents(userId ? { user: userId } : {})).items
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      loading.value = false
    }
  }

  function added(item: StaffIncident) {
    items.value = [item, ...items.value].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }

  const canDelete = (i: StaffIncident) => me.isAdmin || i.by?.id === me.user?._id

  async function remove() {
    if (!removing.value) return
    busy.value = true
    try {
      await operationService.deleteStaffIncident(removing.value._id)
      items.value = items.value.filter((i) => i._id !== removing.value?._id)
      toast.success('Novedad eliminada')
      removing.value = null
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      busy.value = false
    }
  }

  load()
  return { items, loading, removing, busy, load, added, canDelete, remove }
}
