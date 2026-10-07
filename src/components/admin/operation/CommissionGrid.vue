<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import AddPersonSheet, { type AddPersonPayload } from '@/components/admin/grid/AddPersonSheet.vue'
import MonthGrid from '@/components/admin/grid/MonthGrid.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import YearNav from '@/components/admin/sheet/YearNav.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useMonthGrid, useWide } from '@/composables/admin/useMonthGrid'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { errorMessage, monthISO } from '@/utils/format'
import type { GridRow } from '@/types/grid'

/**
 * Hoja "Comisiones": lo que gerencia escribe por colaborador y mes. Estas cifras son las que
 * entran al estado de resultados (el FEE calculado es solo referencia, en la otra pestaña).
 */
const scope = useAdminScope()
const toast = useToastStore()
const user = useUserStore()
const wide = useWide()
const branch = toRef(scope, 'branch')
const g = useMonthGrid({
  fetch: (y) => operationService.commissionEntries(y, scope.query),
  save: async (r, month, value) => {
    await operationService.saveCommissionEntry({ user: r.user, name: r.name, branch: r.branch, position: r.position, month, amount: value })
  },
  deps: [branch],
})
defineExpose({ reload: () => g.load() })

const thisYear = Number(monthISO().slice(0, 4))
const current = computed(() => (g.year.value === thisYear ? Number(monthISO().slice(5, 7)) - 1 : undefined))
const staffLeft = computed(() => (g.data.value?.staff ?? []).filter((s) => !g.rows.value.some((r) => r.user === s._id)))

const addOpen = ref(false)
const adding = ref(false)
async function add(p: AddPersonPayload) {
  adding.value = true
  try {
    const key = p.staff ? `${p.branch}|u:${p.staff._id}` : `${p.branch}|n:${p.name.toLowerCase()}`
    g.addRow({
      key,
      user: p.staff?._id ?? null,
      name: p.name,
      position: p.position,
      branch: p.branch,
      branchName: scope.branchName(p.branch),
      months: Array(12).fill(null),
      notes: Array(12).fill(''),
      total: 0,
    })
    const row = g.rows.value.find((r) => r.key === key)
    if (row && p.amount !== null) await g.commit(row, p.month, p.amount)
    addOpen.value = false
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    adding.value = false
  }
}

const removing = ref<GridRow | null>(null)
const busy = ref(false)
async function confirmRemove() {
  const r = removing.value
  if (!r) return
  busy.value = true
  try {
    if (r.months.some((v) => v !== null)) {
      await operationService.removeCommissionRow({ year: g.year.value, user: r.user, name: r.name, branch: r.branch })
      await g.load()
    }
    g.dropLocal(r.key)
    toast.success(`${r.name} ya no está en las comisiones de ${g.year.value}`)
    removing.value = null
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div :class="{ 'is-stale': g.loading.value && !!g.data.value }">
    <div class="bar">
      <YearNav v-model="g.year.value" :suffix="scope.branchName(scope.branch) || 'Todas las sucursales'" />
      <button v-if="user.isAdmin" type="button" class="btn btn--primary btn--sm" @click="addOpen = true"><AppIcon name="plus" :size="16" /> Agregar colaborador</button>
    </div>
    <p class="tip">Toca una celda, escribe la comisión del mes y pulsa Enter: se guarda sola. Estos valores son los que usa el estado de resultados.</p>

    <div v-if="g.loading.value && !g.data.value" class="skeleton" style="height: 300px"></div>
    <EmptyState v-else-if="!g.rows.value.length" :title="`Sin comisiones en ${g.year.value}`" text="Agrega a cada colaborador y escribe lo que comisionó en el mes." icon="wallet">
      <button v-if="user.isAdmin" type="button" class="btn btn--primary" @click="addOpen = true"><AppIcon name="plus" /> Agregar colaborador</button>
    </EmptyState>
    <MonthGrid
      v-else
      v-model:month="g.month.value"
      :rows="g.rows.value"
      :month-totals="g.monthTotals.value"
      :total="g.total.value"
      :year="g.year.value"
      :wide="wide"
      :editable="user.isAdmin"
      :status="g.status"
      :row-total="g.rowTotal"
      :current="current"
      :show-branch="!scope.branch"
      caption="Comisiones por colaborador y mes"
      @commit="g.commit"
      @remove="removing = $event"
    />

    <AddPersonSheet
      :open="addOpen"
      title="Agregar a comisiones"
      amount-label="Comisión del mes"
      new-hint="Se agrega solo a esta hoja con su nombre (no se crea en Personal)."
      :staff="staffLeft"
      :branches="scope.visibleBranches"
      :default-branch="scope.branch"
      :month="g.month.value"
      :busy="adding"
      @close="addOpen = false"
      @add="add"
    />
    <ConfirmSheet
      :open="!!removing"
      title="Quitar de comisiones"
      :message="removing ? `Se borran las comisiones de ${removing.name} en ${g.year.value}. El estado de resultados se actualiza solo.` : ''"
      confirm-label="Quitar"
      danger
      :busy="busy"
      @close="removing = null"
      @confirm="confirmRemove"
    />
  </div>
</template>

<style scoped lang="scss">
.is-stale :deep(.sheet-wrap),
.is-stale :deep(.mobile) {
  opacity: 0.45;
  transition: opacity $dur-fast ease;
  pointer-events: none;
}

.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.tip {
  font-size: $text-xs;
  color: $ink-muted;
  margin-bottom: 0.75rem;
}
</style>
