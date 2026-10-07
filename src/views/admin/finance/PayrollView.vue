<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import PayrollSheet from '@/components/admin/payroll/PayrollSheet.vue'
import PayrollTable from '@/components/admin/payroll/PayrollTable.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useReport } from '@/composables/admin/useReport'
import { pct } from '@/config/financeLabels'
import { errorMessage, money, monthISO } from '@/utils/format'
import type { PayrollRow } from '@/types/finance'

const scope = useAdminScope()
const toast = useToastStore()
const month = ref(monthISO())
const branch = toRef(scope, 'branch')
const { data, loading, load } = useReport(() => ledgerService.payroll(month.value, scope.query), [month, branch])

const editing = ref<PayrollRow | null>(null)
function onSaved() {
  editing.value = null
  load()
}

const toRemove = ref<PayrollRow | null>(null)
const removing = ref(false)
async function confirmRemove() {
  if (!toRemove.value) return
  removing.value = true
  try {
    await ledgerService.deletePayroll(toRemove.value._id)
    toast.success(`${toRemove.value.name} ya no está en la nómina de este mes`)
    toRemove.value = null
    editing.value = null
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    removing.value = false
  }
}

const addOpen = ref(false)
const addUser = ref('')
const addSalary = ref(0)
const missing = computed(() => data.value?.missing ?? [])
function pickUser() {
  addSalary.value = missing.value.find((m) => m._id === addUser.value)?.salary ?? 0
}
async function add() {
  if (!addUser.value) return toast.error('Elige a quién agregar')
  try {
    await ledgerService.addPayroll({ month: month.value, user: addUser.value, salary: addSalary.value })
    toast.success('Colaborador agregado a la nómina del mes')
    addOpen.value = false
    addUser.value = ''
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  }
}
</script>

<template>
  <section :class="{ 'is-stale': loading && !!data }" :aria-busy="loading">
    <PageIntro text="Sueldo de cada colaborador y lo pagado en cada quincena (Q1 = mitad del sueldo, Q2 = el resto). Los anticipos registrados en Gastos se descuentan solos.">
      <button type="button" class="btn btn--ghost" @click="addOpen = true"><AppIcon name="plus" /> Agregar colaborador</button>
      <RouterLink to="/admin/personal" class="btn btn--ghost"><AppIcon name="user" /> Sueldos en Personal</RouterLink>
    </PageIntro>

    <div class="filters"><MonthNav v-model="month" /></div>

    <KpiRow v-if="data">
      <KpiCard label="Total nómina" :value="money(data.totals.salary)" icon="users" :hint="`${data.items.length} colaboradores`" />
      <KpiCard label="Pagado Q1" :value="money(data.totals.paidQ1)" icon="check" tone="success" />
      <KpiCard label="Pagado Q2" :value="money(data.totals.paidQ2)" icon="check" tone="success" />
      <KpiCard label="Pendiente" :value="money(data.totals.pending)" icon="clock" tone="warning" :hint="data.totals.advances ? `Anticipos ${money(data.totals.advances)}` : undefined" />
      <KpiCard label="% pagado" :value="pct(data.totals.paidRatio)" icon="chart" tone="aqua" />
    </KpiRow>

    <div v-if="loading && !data" class="skeleton" style="height: 260px"></div>
    <EmptyState
      v-else-if="data && !data.items.length"
      title="La nómina de este mes está vacía"
      text="Carga el sueldo mensual de cada colaborador en Personal y aparecerán aquí solos, o agrégalos a mano."
      icon="users"
    >
      <button type="button" class="btn btn--primary" @click="addOpen = true"><AppIcon name="plus" /> Agregar colaborador</button>
    </EmptyState>
    <PayrollTable v-else-if="data" :data="data" @edit="editing = $event" />

    <PayrollSheet :open="!!editing" :row="editing" @close="editing = null" @saved="onSaved" @remove="toRemove = editing" />
    <ConfirmSheet
      :open="!!toRemove"
      title="Quitar de la nómina"
      :message="toRemove ? `${toRemove.name} no aparecerá en la nómina de este mes ni en el estado de resultados. Los otros meses no cambian.` : ''"
      confirm-label="Quitar"
      danger
      :busy="removing"
      @close="toRemove = null"
      @confirm="confirmRemove"
    />
    <BaseSheet :open="addOpen" title="Agregar a la nómina del mes" @close="addOpen = false">
      <div class="add">
        <label class="field">
          <span class="field__label">Colaborador</span>
          <select v-model="addUser" @change="pickUser">
            <option value="">Elige…</option>
            <option v-for="m in missing" :key="m._id" :value="m._id">{{ m.name }}{{ m.position ? ` · ${m.position}` : '' }}</option>
          </select>
          <span v-if="!missing.length" class="field__hint">Todo el personal activo ya está en este mes.</span>
        </label>
        <MoneyField v-model="addSalary" label="Sueldo del mes" />
      </div>
      <template #footer>
        <button type="button" class="btn btn--ghost" @click="addOpen = false">Cancelar</button>
        <button type="button" class="btn btn--primary" @click="add">Agregar</button>
      </template>
    </BaseSheet>
  </section>
</template>

<style scoped lang="scss">
// Mientras llega el mes/periodo nuevo, lo anterior se atenúa para no confundirlo con lo actual.
.is-stale :deep(.kpis),
.is-stale :deep(.sheet-wrap),
.is-stale :deep(.rows),
.is-stale :deep(.grid) {
  opacity: 0.45;
  transition: opacity $dur-fast ease;
  pointer-events: none;
}

.filters {
  max-width: 360px;
  margin-bottom: 1rem;
}

.add {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
</style>
