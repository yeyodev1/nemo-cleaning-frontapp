import { computed, reactive, ref, toRef, watch } from 'vue'
import { useReport } from '@/composables/admin/useReport'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { errorMessage, monthISO } from '@/utils/format'
import type { GoalRow } from '@/types/operation'
import type { CellStatus } from '@/types/grid'

/** Estado de la meta igual que el back (`goal.service.ts#monthGoals`). */
function withGoal(r: GoalRow, goal: number, inProgress: boolean): GoalRow {
  const status = !goal ? 'no_goal' : r.production >= goal ? 'meets' : inProgress ? 'in_progress' : 'misses'
  return { ...r, goal, compliance: goal ? r.production / goal : null, diff: goal ? r.production - goal : 0, status }
}

/**
 * Metas del mes con escritura directa: la meta de cada operador se guarda al salir de la celda
 * y las tarjetas de resumen se recalculan al instante (la producción es real, no se toca).
 */
export function useGoalEntry() {
  const scope = useAdminScope()
  const toast = useToastStore()
  const month = ref(monthISO())
  const { data, loading, load } = useReport(() => operationService.goals(month.value, scope.query), [month, toRef(scope, 'branch')])
  const items = ref<GoalRow[]>([])
  const statuses = reactive<Record<string, CellStatus>>({})

  // Orden fijo por nombre: mientras se escribe, las filas no saltan de lugar.
  watch(data, (d) => (items.value = d ? [...d.items].sort((a, b) => a.name.localeCompare(b.name, 'es')) : []))

  const summary = computed(() => {
    const list = items.value
    const set = list.filter((i) => i.goal > 0)
    const goalTotal = set.reduce((s, i) => s + i.goal, 0)
    const prodWithGoal = set.reduce((s, i) => s + i.production, 0)
    return {
      goalTotal,
      production: list.reduce((s, i) => s + i.production, 0),
      companyProduction: data.value?.summary.companyProduction ?? 0,
      compliance: goalTotal ? prodWithGoal / goalTotal : null,
      meeting: set.filter((i) => i.status === 'meets').length,
      notMeeting: set.filter((i) => i.status !== 'meets').length,
      withoutGoal: list.length - set.length,
    }
  })

  async function commit(index: number, value: number | null) {
    const r = items.value[index]
    if (!r) return
    const inProgress = !!data.value?.inProgress
    const prev = r
    items.value[index] = withGoal(r, value ?? 0, inProgress)
    statuses[r.operator] = 'saving'
    try {
      await operationService.saveGoal({ operator: r.operator, month: month.value, amount: value ?? 0, notes: r.notes })
      statuses[r.operator] = 'saved'
      setTimeout(() => statuses[r.operator] === 'saved' && (statuses[r.operator] = ''), 1800)
    } catch (e) {
      items.value[index] = prev
      statuses[r.operator] = 'error'
      toast.error(errorMessage(e))
    }
  }

  return { month, data, loading, load, items, summary, statuses, commit }
}
