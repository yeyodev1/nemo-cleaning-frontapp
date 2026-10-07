<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import Pagination from '@/components/admin/common/Pagination.vue'
import FilterBar from '@/components/admin/finance/FilterBar.vue'
import ExpenseForm from '@/components/admin/finance/ExpenseForm.vue'
import ExpenseItem from '@/components/admin/finance/ExpenseItem.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { usePagedList } from '@/composables/admin/usePagedList'
import { financeService, type ExpenseFilters, type ExpensePage } from '@/services/finance.service'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { expenseCategory, options, paidFrom } from '@/config/labels'
import { expenseKind } from '@/config/financeLabels'
import { errorMessage, money, monthISO, monthRange } from '@/utils/format'
import type { Expense } from '@/types/api'

const scope = useAdminScope()
const user = useUserStore()
const toast = useToastStore()
const month = ref(monthISO())
const branch = toRef(scope, 'branch')
const summary = ref<ExpensePage | null>(null)

const initial: ExpenseFilters = { ...monthRange(month.value), category: '', paidFrom: '', kind: '' }
const { filters, items, page, pages, total, loading, load } = usePagedList(
  async (q) => {
    const res = await financeService.expenses({ ...q, branch: scope.query, paidFrom: user.isAdmin ? q.paidFrom : 'petty_cash', limit: 50 })
    summary.value = res
    return res
  },
  initial,
  [branch],
)
watch(month, (m) => m && Object.assign(filters, monthRange(m)))
onMounted(() => load(1))
const t = computed(() => summary.value?.totals)
const employeeName = (id?: string | null) => (id ? scope.operators.find((o) => o._id === id)?.name || 'Colaborador' : '')
const branchName = (id: string | null) => (id ? scope.branchName(id) || 'Sucursal' : 'General')

const formOpen = ref(false)
const editing = ref<Expense | null>(null)
function openForm(e: Expense | null) {
  editing.value = e
  formOpen.value = true
}
function onSaved() {
  formOpen.value = false
  load()
}

const toDelete = ref<Expense | null>(null)
const deleteSeries = ref(false)
const deleting = ref(false)
function askDelete(e: Expense) {
  deleteSeries.value = false
  toDelete.value = e
}
async function confirmDelete() {
  const e = toDelete.value
  if (!e) return
  deleting.value = true
  try {
    const r = await financeService.deleteExpense(e._id, deleteSeries.value)
    toast.success(deleteSeries.value ? `Se eliminaron ${r.deleted ?? ''} cuotas del diferido` : 'Gasto eliminado')
    toDelete.value = null
    load()
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    deleting.value = false
  }
}

const repeating = ref(false)
async function repeatFixed() {
  repeating.value = true
  try {
    const r = await ledgerService.repeatFixed(month.value, scope.query)
    if (r.created) toast.success(`Listo: se copiaron ${r.created} gastos fijos (${r.names.join(', ')})`)
    else toast.info(r.skipped ? 'Los gastos fijos de este mes ya estaban cargados' : 'El mes anterior no tiene gastos fijos que se repitan')
    load(1)
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    repeating.value = false
  }
}
</script>

<template>
  <section>
    <PageIntro text="Todo lo que se gasta: caja menor y gerencia, fijos y variables, diferidos en cuotas y anticipos al personal (se descuentan en Nómina).">
      <button v-if="user.isAdmin" type="button" class="btn btn--ghost" :disabled="repeating" @click="repeatFixed">
        <AppIcon name="refresh" /> {{ repeating ? 'Copiando…' : 'Repetir gastos fijos' }}
      </button>
      <button type="button" class="btn btn--primary" @click="openForm(null)"><AppIcon name="plus" /> Nuevo gasto</button>
    </PageIntro>

    <KpiRow>
      <KpiCard label="Total del mes" :value="money(summary?.totalAmount)" icon="receipt" :hint="`${total} gastos`" />
      <KpiCard label="Variables" :value="money(t?.variable)" icon="chart" tone="warning" hint="Incluye anticipos y propinas" />
      <KpiCard label="Fijos" :value="money(t?.fixed)" icon="calendar" tone="aqua" />
      <KpiCard label="Caja menor" :value="money(t?.pettyCash)" icon="cash" :hint="user.isAdmin ? `Gerencia ${money(t?.management)}` : undefined" />
    </KpiRow>

    <FilterBar>
      <MonthNav v-model="month" class="month" />
      <label class="field">
        <span class="field__label">Categoría</span>
        <select v-model="filters.category">
          <option value="">Todas</option>
          <option v-for="o in options(expenseCategory)" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Tipo</span>
        <select v-model="filters.kind">
          <option value="">Fijos y variables</option>
          <option v-for="o in options(expenseKind)" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>
      <label v-if="user.isAdmin" class="field">
        <span class="field__label">Pagado desde</span>
        <select v-model="filters.paidFrom">
          <option value="">Todos</option>
          <option v-for="o in options(paidFrom)" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>
    </FilterBar>

    <div v-if="loading && !items.length" class="rows"><span v-for="i in 5" :key="i" class="skeleton" style="height: 72px"></span></div>
    <EmptyState v-else-if="!items.length" title="No hay gastos en este mes" text="Registra el primero. Si tienes gastos fijos del mes pasado (alquiler), usa «Repetir gastos fijos»." icon="receipt">
      <button type="button" class="btn btn--primary" @click="openForm(null)"><AppIcon name="plus" /> Nuevo gasto</button>
    </EmptyState>
    <TransitionGroup v-else name="fade-up" tag="ul" class="rows">
      <ExpenseItem v-for="e in items" :key="e._id" :e="e" :branch-name="branchName(e.branch)" :employee-name="employeeName(e.employee)" @edit="openForm(e)" @remove="askDelete(e)" />
    </TransitionGroup>
    <Pagination :page="page" :pages="pages" :total="total" @go="load" />

    <ExpenseForm :open="formOpen" :expense="editing" @close="formOpen = false" @saved="onSaved" />
    <ConfirmSheet
      :open="!!toDelete"
      title="Eliminar gasto"
      :message="toDelete ? `«${toDelete.description}» por ${money(toDelete.amount)} se quitará de los reportes.` : ''"
      confirm-label="Eliminar"
      danger
      :busy="deleting"
      @close="toDelete = null"
      @confirm="confirmDelete"
    >
      <label v-if="toDelete?.installment" class="check series">
        <input v-model="deleteSeries" type="checkbox" /> Eliminar las {{ toDelete.installment.count }} cuotas de este diferido
      </label>
    </ConfirmSheet>
  </section>
</template>

<style scoped lang="scss">
.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

// El mes ocupa toda la fila en celular: "Septiembre de 2026" no cabe en media columna.
.month {
  flex: 1 1 100% !important;

  @include from('md') {
    flex: 1 1 280px !important;
  }
}

.series {
  margin-top: 0.75rem;
}
</style>
