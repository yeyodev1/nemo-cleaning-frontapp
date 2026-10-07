<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import AddPersonSheet, { type AddPersonPayload } from '@/components/admin/grid/AddPersonSheet.vue'
import MonthGrid from '@/components/admin/grid/MonthGrid.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import YearNav from '@/components/admin/sheet/YearNav.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { MONTHS_SHORT, useMonthGrid, useWide } from '@/composables/admin/useMonthGrid'
import { createStaff } from '@/composables/admin/staffQuickCreate'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { errorMessage, monthISO } from '@/utils/format'
import type { GridRow } from '@/types/grid'

/** Hoja "Nómina": sueldo base por colaborador y mes. Cada celda es un mes y se guarda sola. */
const scope = useAdminScope()
const toast = useToastStore()
const wide = useWide()
const branch = toRef(scope, 'branch')
const g = useMonthGrid({
  fetch: (y) => ledgerService.payrollYear(y, scope.query),
  save: async (r, month, value) => {
    await ledgerService.savePayrollSalary({ user: r.user!, month, salary: value, position: r.position, branch: r.branch })
  },
  deps: [branch],
})
const thisYear = Number(monthISO().slice(0, 4))
const current = computed(() => (g.year.value === thisYear ? Number(monthISO().slice(5, 7)) - 1 : undefined))
const staffLeft = computed(() => (g.data.value?.staff ?? []).filter((s) => !g.rows.value.some((r) => r.user === s._id)))
const monthStr = (i: number) => `${g.year.value}-${String(i + 1).padStart(2, '0')}`

const addOpen = ref(false)
const adding = ref(false)
async function add(p: AddPersonPayload) {
  adding.value = true
  try {
    const staff = p.staff ?? (await createStaff({ name: p.name, position: p.position, branch: p.branch, salary: p.amount ?? 0 }))
    const row: GridRow = {
      key: staff._id,
      user: staff._id,
      name: staff.name,
      position: p.position,
      branch: p.branch || null,
      branchName: scope.branchName(p.branch),
      months: Array(12).fill(null),
      notes: Array(12).fill(''),
      total: 0,
    }
    g.addRow(row)
    const added = g.rows.value.find((r) => r.key === row.key)!
    if (p.amount !== null) await g.commit(added, p.month, p.amount)
    if (!p.staff) toast.success(`${p.name} quedó en Personal (sin acceso al panel)`)
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
      const res = await ledgerService.removePayrollRow({ user: r.user!, year: g.year.value })
      toast.success(res.kept ? `Se quitaron ${res.deleted} mes(es); ${res.kept} con pagos de quincena se conservan` : `${r.name} ya no está en la nómina de ${g.year.value}`)
      await g.load()
    }
    g.dropLocal(r.key)
    removing.value = null
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}

const copyOpen = ref(false)
const copying = ref(false)
const prevLabel = computed(() => (g.month.value ? MONTHS_SHORT[g.month.value - 1] : `DIC ${g.year.value - 1}`))
async function copy() {
  copying.value = true
  const to = monthStr(g.month.value)
  const from = g.month.value ? monthStr(g.month.value - 1) : `${g.year.value - 1}-12`
  try {
    const r = await ledgerService.copyPayroll(from, to, scope.query)
    toast.success(r.copied ? `${r.copied} sueldo(s) copiados` : 'Ese mes ya tenía todos los sueldos')
    copyOpen.value = false
    await g.load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    copying.value = false
  }
}
</script>

<template>
  <div :class="{ 'is-stale': g.loading.value && !!g.data.value }">
    <div class="bar">
      <YearNav v-model="g.year.value" :suffix="scope.branchName(scope.branch) || 'Todas las sucursales'" />
      <div class="bar__actions">
        <label v-if="wide" class="month-pick">
          <span>Mes</span>
          <select v-model.number="g.month.value">
            <option v-for="(m, i) in MONTHS_SHORT" :key="m" :value="i">{{ m }}</option>
          </select>
        </label>
        <button type="button" class="btn btn--ghost btn--sm" @click="copyOpen = true"><AppIcon name="copy" :size="16" /> Copiar de {{ prevLabel }} a {{ MONTHS_SHORT[g.month.value] }}</button>
        <button type="button" class="btn btn--primary btn--sm" @click="addOpen = true"><AppIcon name="plus" :size="16" /> Agregar colaborador</button>
      </div>
    </div>
    <p class="tip">Toca una celda, escribe el sueldo y pulsa Enter: se guarda solo. Cambiar un mes no cambia los demás.</p>

    <div v-if="g.loading.value && !g.data.value" class="skeleton" style="height: 300px"></div>
    <EmptyState v-else-if="!g.rows.value.length" :title="`Sin sueldos en ${g.year.value}`" text="Agrega a cada colaborador y escribe su sueldo base del mes." icon="users">
      <button type="button" class="btn btn--primary" @click="addOpen = true"><AppIcon name="plus" /> Agregar colaborador</button>
    </EmptyState>
    <MonthGrid
      v-else
      v-model:month="g.month.value"
      :rows="g.rows.value"
      :month-totals="g.monthTotals.value"
      :total="g.total.value"
      :year="g.year.value"
      :wide="wide"
      :editable="true"
      :status="g.status"
      :row-total="g.rowTotal"
      :current="current"
      :show-branch="!scope.branch"
      caption="Sueldo base por colaborador y mes"
      @commit="g.commit"
      @remove="removing = $event"
    />

    <AddPersonSheet
      :open="addOpen"
      title="Agregar a la nómina"
      amount-label="Sueldo base del mes"
      new-hint="Se crea en Personal sin correo (no entra al panel). Puedes completar sus datos después."
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
      title="Quitar de la nómina"
      :message="removing ? `Se borran los sueldos de ${removing.name} en ${g.year.value}. Los meses con pagos de quincena registrados se conservan.` : ''"
      confirm-label="Quitar"
      danger
      :busy="busy"
      @close="removing = null"
      @confirm="confirmRemove"
    />
    <ConfirmSheet
      :open="copyOpen"
      title="Copiar sueldos"
      :message="`Se copian los sueldos de ${prevLabel} a ${MONTHS_SHORT[g.month.value]} ${g.year.value}. Lo que ya escribiste en ${MONTHS_SHORT[g.month.value]} no se toca.`"
      confirm-label="Copiar"
      :busy="copying"
      @close="copyOpen = false"
      @confirm="copy"
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

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
}

.month-pick {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink-soft;

  select {
    min-height: 36px;
    width: auto;
  }
}

.tip {
  font-size: $text-xs;
  color: $ink-muted;
  margin-bottom: 0.75rem;
}
</style>
