import { computed, reactive, ref, watch } from 'vue'
import { operationService, type ProductionFilters } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { paymentConfirmation } from '@/config/operationLabels'
import { addDays, errorMessage, monthISO, monthRange, todayISO } from '@/utils/format'
import type { ProductionList, ProductionOptions, ProductionRow } from '@/types/operation'

export type RangePreset = 'today' | 'yesterday' | 'fortnight' | 'month' | 'custom'

/** Rango de la quincena actual: Q1 = 1–15, Q2 = 16–fin de mes (como en el Excel). */
function fortnightRange() {
  const today = todayISO()
  const { from, to } = monthRange(monthISO())
  return Number(today.slice(8, 10)) <= 15 ? { from, to: `${today.slice(0, 7)}-15` } : { from: `${today.slice(0, 7)}-16`, to }
}

/** La "Base": filas filtrables con totales al pie, cambio de confirmación y exportar CSV. */
export function useProductionBase() {
  const scope = useAdminScope()
  const toast = useToastStore()
  const today = todayISO()
  const preset = ref<RangePreset>('today')
  const filters = reactive({ from: today, to: today, operator: '', zone: '', account: '', confirmation: '', q: '' })
  const data = ref<ProductionList | null>(null)
  const options = ref<ProductionOptions | null>(null)
  const loading = ref(false)
  const exporting = ref(false)
  const page = ref(1)
  let seq = 0

  operationService.productionOptions().then((o) => (options.value = o)).catch(() => {})

  function setPreset(p: RangePreset) {
    preset.value = p
    if (p === 'today') Object.assign(filters, { from: today, to: today })
    if (p === 'yesterday') Object.assign(filters, { from: addDays(today, -1), to: addDays(today, -1) })
    if (p === 'fortnight') Object.assign(filters, fortnightRange())
    if (p === 'month') Object.assign(filters, monthRange(monthISO()))
  }

  const query = (): ProductionFilters => ({ ...filters, branch: scope.query, page: page.value, limit: 50 })

  async function load(p = page.value) {
    page.value = p
    const mine = ++seq
    loading.value = true
    try {
      const res = await operationService.production(query())
      if (mine === seq) data.value = res
    } catch (e) {
      if (mine === seq) toast.error(errorMessage(e))
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  watch(
    () => [filters.from, filters.to, filters.operator, filters.zone, filters.account, filters.confirmation, scope.query],
    () => load(1),
    { immediate: true },
  )
  watch(() => filters.q, () => {
    clearTimeout(timer)
    timer = setTimeout(() => load(1), 300)
  })

  const zones = computed(() => {
    const all = (options.value?.branches || []).filter((b) => !scope.query || b._id === scope.query).flatMap((b) => b.zones)
    return [...new Set(all)]
  })

  /** Cambia la confirmación desde la Base (pasar a confirmado registra el cobro). */
  async function changeConfirmation(row: ProductionRow, confirmation: string, account?: string) {
    try {
      await operationService.setConfirmation(row._id, confirmation, account)
      toast.success('Confirmación actualizada')
      await load()
      return true
    } catch (e) {
      toast.error(errorMessage(e))
      return false
    }
  }

  async function exportCsv() {
    exporting.value = true
    try {
      const res = await operationService.production({ ...query(), page: 1, limit: 5000, all: '1' })
      const head = ['Código', 'Fecha', 'Operador', 'Cliente', 'Urbanización/Zona', 'Servicios', 'Total', 'Pagos', 'Confirmación', 'Propina', 'Por cobrar', 'Observaciones']
      const rows = res.items.map((r) => [
        r.code,
        r.date,
        r.operators.map((o) => o.name).join(' / '),
        r.customer?.name || '',
        r.zone,
        r.items.map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ''}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(' + '),
        (r.total / 100).toFixed(2),
        r.paymentAccount,
        paymentConfirmation[r.paymentConfirmation]?.label || '',
        (r.tip / 100).toFixed(2),
        (r.balance / 100).toFixed(2),
        r.notes,
      ])
      const esc = (v: string) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
      // BOM para que Excel abra las tildes bien.
      const csv = '﻿' + [head, ...rows].map((r) => r.map((c) => esc(String(c))).join(',')).join('\n')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      a.download = `base-produccion-${filters.from}_${filters.to}.csv`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
      toast.success(`${res.items.length} filas exportadas`)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      exporting.value = false
    }
  }

  return { preset, filters, data, options, zones, loading, exporting, page, setPreset, load, changeConfirmation, exportCsv }
}
