<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { financeService } from '@/services/finance.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { expenseCategory, paymentMethod } from '@/config/labels'
import { addDays, longDate, money, todayISO } from '@/utils/format'
import type { PaymentMethod } from '@/types/api'

const scope = useAdminScope()
const date = ref(todayISO())
const branch = toRef(scope, 'branch')
const { data, loading } = useReport(() => financeService.cash(date.value, scope.query), [date, branch])

const methods: PaymentMethod[] = ['cash', 'transfer', 'card']
const byMethod = (m: PaymentMethod) => data.value?.income?.byMethod?.[m] || 0
const isToday = computed(() => date.value === todayISO())
const print = () => window.print()
const branchLabel = computed(() => scope.branchName(scope.branch) || 'Todas las sucursales')
</script>

<template>
  <section class="cash">
    <div class="nav">
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Día anterior" @click="date = addDays(date, -1)">
        <AppIcon name="chevron-left" />
      </button>
      <label class="nav__date">
        <span class="sr-only">Fecha</span>
        <input v-model="date" type="date" />
      </label>
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Día siguiente" @click="date = addDays(date, 1)">
        <AppIcon name="chevron-right" />
      </button>
      <button v-if="!isToday" type="button" class="btn btn--soft btn--sm" @click="date = todayISO()">Hoy</button>
      <button type="button" class="btn btn--ghost btn--sm nav__print" @click="print"><AppIcon name="file" /> Imprimir</button>
    </div>

    <header class="head">
      <h2>Registro de caja</h2>
      <p>{{ longDate(date) }} · {{ branchLabel }}</p>
    </header>

    <div v-if="loading && !data" class="grid"><span v-for="i in 3" :key="i" class="skeleton" style="height: 110px"></span></div>
    <template v-else-if="data">
      <div class="grid">
        <article class="box">
          <h3>Cobros del día</h3>
          <ul class="lines">
            <li v-for="m in methods" :key="m"><span>{{ paymentMethod[m] }}</span><strong class="money">{{ money(byMethod(m)) }}</strong></li>
          </ul>
          <p class="box__total"><span>Total cobrado</span><strong class="money">{{ money(data.income?.total) }}</strong></p>
        </article>

        <article class="box">
          <h3>Gastos de caja menor</h3>
          <ul v-if="data.pettyCashExpenses?.items?.length" class="lines">
            <li v-for="e in data.pettyCashExpenses.items" :key="e._id">
              <span>{{ e.description }} <small>· {{ expenseCategory[e.category] || e.category }}</small></span>
              <strong class="money">− {{ money(e.amount) }}</strong>
            </li>
          </ul>
          <p v-else class="muted box__none">Sin gastos de caja menor.</p>
          <p class="box__total"><span>Total gastos</span><strong class="money">{{ money(data.pettyCashExpenses?.total) }}</strong></p>
        </article>
      </div>

      <article class="balance">
        <span>Efectivo cobrado − gastos de caja menor</span>
        <strong class="money">{{ money(data.balance) }}</strong>
        <small>Saldo del día</small>
      </article>
    </template>
    <p v-else class="empty">No se pudo cargar el registro de caja.</p>
  </section>
</template>

<style scoped lang="scss">
.nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;

  &__date {
    flex: 1 1 150px;
  }

  &__print {
    margin-left: auto;
  }
}

.head {
  margin-bottom: 1rem;

  h2 {
    font-size: $text-xl;
  }

  p {
    color: $ink-muted;
    font-size: $text-sm;

    &::first-letter {
      text-transform: uppercase;
    }
  }
}

.grid {
  @include flex-cards(300px, 0.85rem);
}

.box {
  @include card(1rem 1.1rem);

  h3 {
    font-size: $text-base;
    margin-bottom: 0.6rem;
  }

  &__none {
    font-size: $text-sm;
    padding: 0.5rem 0;
  }

  &__total {
    display: flex;
    justify-content: space-between;
    margin-top: 0.6rem;
    padding-top: 0.6rem;
    border-top: 1px dashed $line-strong;
    font-weight: 800;
  }
}

.lines {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  li {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: $text-sm;
  }

  small {
    color: $ink-muted;
  }
}

.balance {
  margin-top: 0.85rem;
  border-radius: $radius-md;
  padding: 1.2rem;
  background: linear-gradient(135deg, $navy-deep, $navy);
  color: $on-dark-soft;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: $text-sm;

  strong {
    color: #fff;
    font-size: $display-sm;
    letter-spacing: -0.02em;
  }
}

@media print {
  .nav {
    display: none;
  }

  .box,
  .balance {
    break-inside: avoid;
  }

  .balance {
    background: none;
    color: $ink;
    border: 2px solid $ink;

    strong {
      color: $ink;
    }
  }
}
</style>
