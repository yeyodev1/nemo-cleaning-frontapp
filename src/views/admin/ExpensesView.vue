<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Pagination from '@/components/admin/common/Pagination.vue'
import FilterBar from '@/components/admin/finance/FilterBar.vue'
import ExpenseForm from '@/components/admin/finance/ExpenseForm.vue'
import { usePagedList } from '@/composables/admin/usePagedList'
import { financeService, type ExpenseFilters } from '@/services/finance.service'
import { useAdminScope } from '@/stores/adminScope'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { expenseCategory, options, paidFrom, paymentMethod } from '@/config/labels'
import { errorMessage, money, monthISO, monthRange, shortDate } from '@/utils/format'
import type { Expense } from '@/types/api'

const scope = useAdminScope()
const user = useUserStore()
const toast = useToastStore()
const month = ref(monthISO())
const branch = toRef(scope, 'branch')

const initial: ExpenseFilters = { ...monthRange(month.value), category: '', paidFrom: '' }
const { filters, items, page, pages, total, loading, load } = usePagedList(
  (q) => financeService.expenses({ ...q, branch: scope.query, paidFrom: user.isAdmin ? q.paidFrom : 'petty_cash', limit: 50 }),
  initial,
  [branch],
)
watch(month, (m) => m && Object.assign(filters, monthRange(m)))
onMounted(() => load(1))

// Totales de la página visible (el API no manda agregados en la lista).
const sumBy = (k: Expense['paidFrom']) => items.value.filter((e) => e.paidFrom === k).reduce((s, e) => s + e.amount, 0)
const petty = computed(() => sumBy('petty_cash'))
const mgmt = computed(() => sumBy('management'))

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

async function remove(e: Expense) {
  if (!window.confirm(`¿Eliminar el gasto "${e.description}" por ${money(e.amount)}?`)) return
  try {
    await financeService.deleteExpense(e._id)
    toast.success('Gasto eliminado')
    load()
  } catch (err) {
    toast.error(errorMessage(err))
  }
}
</script>

<template>
  <section>
    <div class="top">
      <div class="totals">
        <div class="totals__item"><span>Caja menor</span><strong class="money">{{ money(petty) }}</strong></div>
        <div v-if="user.isAdmin" class="totals__item"><span>Gerencia</span><strong class="money">{{ money(mgmt) }}</strong></div>
        <div class="totals__item totals__item--all"><span>Total</span><strong class="money">{{ money(petty + mgmt) }}</strong></div>
      </div>
      <button type="button" class="btn btn--primary" @click="openForm(null)"><AppIcon name="plus" /> Nuevo gasto</button>
    </div>

    <FilterBar>
      <label class="field"><span class="field__label">Mes</span><input v-model="month" type="month" /></label>
      <label class="field">
        <span class="field__label">Categoría</span>
        <select v-model="filters.category">
          <option value="">Todas</option>
          <option v-for="o in options(expenseCategory)" :key="o.value" :value="o.value">{{ o.label }}</option>
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

    <div v-if="loading && !items.length" class="rows"><span v-for="i in 5" :key="i" class="skeleton" style="height: 68px"></span></div>
    <p v-else-if="!items.length" class="empty">No hay gastos registrados en este periodo.</p>
    <ul v-else class="rows">
      <li v-for="e in items" :key="e._id" class="exp">
        <div class="exp__main">
          <strong>{{ e.description }}</strong>
          <span class="exp__meta">
            {{ shortDate(e.date) }} · {{ expenseCategory[e.category] }} · {{ paymentMethod[e.paymentMethod] }}
            <template v-if="e.supplier"> · {{ e.supplier }}</template>
            · {{ e.branch ? scope.branchName(e.branch) || 'Sucursal' : 'General' }}
          </span>
          <span class="exp__tags">
            <StatusBadge :tone="e.paidFrom === 'petty_cash' ? 'aqua' : 'navy'" :label="paidFrom[e.paidFrom]" />
            <a v-if="e.receiptUrl" :href="e.receiptUrl" target="_blank" rel="noopener" class="exp__receipt"><AppIcon name="file" :size="14" /> Recibo</a>
          </span>
        </div>
        <div class="exp__end">
          <strong class="money">{{ money(e.amount) }}</strong>
          <span class="exp__actions">
            <button type="button" class="btn btn--ghost btn--icon" aria-label="Editar gasto" @click="openForm(e)"><AppIcon name="edit" :size="18" /></button>
            <button type="button" class="btn btn--danger btn--icon" aria-label="Eliminar gasto" @click="remove(e)"><AppIcon name="trash" :size="18" /></button>
          </span>
        </div>
      </li>
    </ul>
    <Pagination :page="page" :pages="pages" :total="total" @go="load" />

    <ExpenseForm :open="formOpen" :expense="editing" @close="formOpen = false" @saved="onSaved" />
  </section>
</template>

<style scoped lang="scss">
.top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;

  > .btn {
    flex: 1 1 100%;

    @include from('md') {
      flex: 0 0 auto;
    }
  }
}

.totals {
  display: flex;
  gap: 0.5rem;
  flex: 1 1 100%;

  @include from('md') {
    flex: 0 1 auto;
  }

  &__item {
    @include card(0.6rem 0.85rem);
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: $text-xs;
    color: $ink-muted;
    font-weight: 700;
    white-space: nowrap;

    // En escritorio el grupo se encoge al contenido: sin mínimo, "Caja menor" se partía en dos líneas.
    @include from('md') {
      min-width: 7.5rem;
    }

    strong {
      color: $ink;
      font-size: $text-base;
    }

    &--all {
      background: $navy;
      border-color: $navy;
      color: $on-dark-soft;

      strong {
        color: #fff;
      }
    }
  }
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.exp {
  @include card(0.8rem 0.9rem);
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;

  &__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    strong {
      font-size: $text-sm;
    }
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__tags {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__receipt {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: $text-xs;
    font-weight: 700;
    color: $navy;
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.4rem;
  }

  &__actions {
    display: flex;
    gap: 0.35rem;
  }
}
</style>
