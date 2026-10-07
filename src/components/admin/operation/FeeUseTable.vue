<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { errorMessage, money, monthLabel } from '@/utils/format'
import type { CommissionSheet } from '@/types/operation'
import type { GridRow } from '@/types/grid'

/**
 * Puente entre la calculadora FEE (referencia) y la hoja manual: por persona, el FEE del mes
 * (operador + supervisor) junto a lo escrito a mano, y "Usar este valor" para copiarlo.
 */
const props = defineProps<{ sheet: CommissionSheet; month: string }>()
const emit = defineEmits<{ used: [] }>()
const scope = useAdminScope()
const toast = useToastStore()
const user = useUserStore()
const manualRows = ref<GridRow[]>([])
const busy = ref('')
const idx = computed(() => Number(props.month.slice(5, 7)) - 1)

async function loadManual() {
  try {
    manualRows.value = (await operationService.commissionEntries(Number(props.month.slice(0, 4)), scope.query)).rows
  } catch {
    manualRows.value = []
  }
}
watch([() => props.month, toRef(scope, 'branch')], loadManual, { immediate: true })

const people = computed(() => {
  const acc = new Map<string, { id: string; name: string; fee: number }>()
  for (const t of props.sheet.totals) acc.set(t.operator, { id: t.operator, name: t.name, fee: t.total })
  for (const s of props.sheet.supervisors) {
    if (!s.supervisor) continue
    const p = acc.get(s.supervisor) ?? { id: s.supervisor, name: s.name, fee: 0 }
    p.fee += s.total
    acc.set(s.supervisor, p)
  }
  return [...acc.values()]
    .map((p) => {
      const mine = manualRows.value.filter((r) => r.user === p.id && r.months[idx.value] !== null)
      return { ...p, manual: mine.length ? mine.reduce((s, r) => s + (r.months[idx.value] ?? 0), 0) : null }
    })
    .sort((a, b) => b.fee - a.fee)
})

async function use(p: { id: string; name: string; fee: number }) {
  busy.value = p.id
  try {
    await operationService.saveCommissionEntry({ user: p.id, month: props.month, amount: p.fee, branch: scope.branch || undefined })
    toast.success(`Comisión de ${p.name} en ${monthLabel(props.month)}: ${money(p.fee)}`)
    await loadManual()
    emit('used')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <SheetTable caption="Copiar el FEE calculado a la hoja de comisiones" compact>
    <thead>
      <tr><th>Persona</th><th class="num">FEE calculado</th><th class="num">Escrito en Comisiones</th><th v-if="user.isAdmin"></th></tr>
    </thead>
    <tbody>
      <tr v-for="p in people" :key="p.id">
        <td>{{ p.name }}</td>
        <td class="num">{{ money(p.fee) }}</td>
        <td class="num" :class="{ muted: p.manual === null }">{{ p.manual === null ? 'Vacío' : money(p.manual) }}</td>
        <td v-if="user.isAdmin">
          <button type="button" class="btn btn--soft btn--sm" :disabled="busy === p.id || p.manual === p.fee" @click="use(p)">
            <AppIcon :name="p.manual === p.fee ? 'check' : 'copy'" :size="15" />
            {{ p.manual === p.fee ? 'Ya está' : busy === p.id ? 'Copiando…' : 'Usar este valor' }}
          </button>
        </td>
      </tr>
    </tbody>
  </SheetTable>
</template>
