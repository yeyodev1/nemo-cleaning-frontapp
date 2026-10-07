import { computed, ref, toRef, watch } from 'vue'
import { useReport } from '@/composables/admin/useReport'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { errorMessage, money, monthISO } from '@/utils/format'
import type { CommissionTier } from '@/types/operation'

/** "Hasta $10 → 30 %", "Más de $35 → 50 %": la regla en palabras, como la usa el negocio. */
export function describeTiers(tiers: CommissionTier[]): string[] {
  return tiers.map((t, i) => {
    const next = tiers[i + 1]
    if (!next) return t.above ? `Más de ${money(t.above)} → ${t.percent} %` : `Cualquier excedente → ${t.percent} %`
    if (!t.above) return `Hasta ${money(next.above)} → ${t.percent} %`
    return `De ${money(t.above)} a ${money(next.above)} → ${t.percent} %`
  })
}

/** Hoja FEE del mes: tabla día × operador, totales por quincena y ajustes manuales. */
export function useCommissions() {
  const scope = useAdminScope()
  const toast = useToastStore()
  const month = ref(monthISO())
  const branch = toRef(scope, 'branch')
  const { data, loading, load } = useReport(() => operationService.commissions(month.value, scope.query), [month, branch])
  const operator = ref('')

  watch(data, (d) => {
    // Se abre con quien más FEE lleva: es lo primero que se quiere revisar.
    if (d && !d.operators.some((o) => o._id === operator.value))
      operator.value = [...d.totals].sort((x, y) => y.total - x.total || y.production - x.production)[0]?.operator || ''
  })

  const days = computed(() => {
    if (!data.value || !operator.value) return []
    return data.value.days.filter((d) => d.cells[operator.value]).map((d) => ({ date: d.date, ...d.cells[operator.value]! }))
  })
  const selectedTotals = computed(() => data.value?.totals.find((t) => t.operator === operator.value))

  async function removeAdjustment(id: string) {
    try {
      await operationService.deleteAdjustment(id)
      toast.success('Ajuste eliminado')
      await load()
      return true
    } catch (e) {
      toast.error(errorMessage(e))
      return false
    }
  }

  return { month, data, loading, load, operator, days, selectedTotals, removeAdjustment }
}
