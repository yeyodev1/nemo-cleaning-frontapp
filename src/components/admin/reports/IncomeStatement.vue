<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import HBar from '@/components/admin/finance/HBar.vue'
import { financeService } from '@/services/finance.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { expenseCategory, paymentMethod } from '@/config/labels'
import { money, monthISO, monthLabel } from '@/utils/format'
import type { PaymentMethod } from '@/types/api'

const scope = useAdminScope()
const month = ref(monthISO())
const branch = toRef(scope, 'branch')
const { data, loading } = useReport(() => financeService.incomeStatement(month.value, scope.query), [month, branch])

const methods = computed(() =>
  (Object.entries(data.value?.income?.byMethod || {}) as [PaymentMethod, number][]).filter(([, v]) => v > 0),
)
const services = computed(() => [...(data.value?.income?.byService || [])].sort((a, b) => b.amount - a.amount))
const categories = computed(() => [...(data.value?.expenses?.byCategory || [])].sort((a, b) => b.amount - a.amount))
const maxService = computed(() => Math.max(0, ...services.value.map((s) => s.amount)))
const maxCategory = computed(() => Math.max(0, ...categories.value.map((s) => s.amount)))
const margin = computed(() => {
  const inc = data.value?.income?.total || 0
  return inc > 0 ? Math.round(((data.value?.net || 0) / inc) * 100) : 0
})
</script>

<template>
  <div>
    <label class="field month">
      <span class="field__label">Mes</span>
      <input v-model="month" type="month" />
    </label>

    <div v-if="loading && !data" class="skeleton" style="height: 320px"></div>
    <template v-else-if="data">
      <div class="pl">
        <div class="pl__row"><span>Ingresos</span><strong class="money">{{ money(data.income?.total) }}</strong></div>
        <div class="pl__row pl__row--neg"><span>Gastos</span><strong class="money">− {{ money(data.expenses?.total) }}</strong></div>
        <div class="pl__net" :class="{ 'is-neg': (data.net || 0) < 0 }">
          <span>Resultado neto · <small>{{ monthLabel(month) }}</small></span>
          <strong class="money">{{ money(data.net) }}</strong>
          <small>Margen {{ margin }}%</small>
        </div>
      </div>

      <div class="cols">
        <article class="box">
          <h3>Ingresos por método</h3>
          <ul class="kv">
            <li v-for="[m, v] in methods" :key="m"><span>{{ paymentMethod[m] || m }}</span><strong class="money">{{ money(v) }}</strong></li>
            <li v-if="!methods.length" class="muted">Sin ingresos en el mes.</li>
          </ul>
          <h3 class="box__sub">Ingresos por servicio</h3>
          <div class="bars">
            <HBar v-for="s in services" :key="s.name" :label="s.name" :sub="s.quantity ? `${s.quantity} u.` : undefined" :value="s.amount" :max="maxService" :display="money(s.amount)" />
            <p v-if="!services.length" class="muted">Sin datos.</p>
          </div>
        </article>

        <article class="box">
          <h3>Gastos por origen</h3>
          <ul class="kv">
            <li><span>Caja menor</span><strong class="money">{{ money(data.expenses?.pettyCash) }}</strong></li>
            <li><span>Gerencia</span><strong class="money">{{ money(data.expenses?.management) }}</strong></li>
          </ul>
          <h3 class="box__sub">Gastos por categoría</h3>
          <div class="bars">
            <HBar v-for="c in categories" :key="c.category" tone="danger" :label="expenseCategory[c.category] || c.category" :value="c.amount" :max="maxCategory" :display="money(c.amount)" />
            <p v-if="!categories.length" class="muted">Sin gastos.</p>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.month {
  max-width: 220px;
  margin-bottom: 1rem;
}

.pl {
  @include card(1rem 1.1rem);
  margin-bottom: 0.85rem;

  &__row {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    font-weight: 600;

    &--neg strong {
      color: $danger;
    }
  }

  &__net {
    margin-top: 0.5rem;
    padding: 1rem;
    border-radius: $radius-sm;
    background: $success-bg;
    color: $success;
    display: flex;
    flex-direction: column;
    font-weight: 700;

    strong {
      font-size: $display-sm;
      letter-spacing: -0.02em;
    }

    small {
      display: inline-block;
      font-weight: 600;

      &::first-letter {
        text-transform: uppercase;
      }
    }

    &.is-neg {
      background: $danger-bg;
      color: $danger;
    }
  }
}

.cols {
  @include flex-cards(320px, 0.85rem);
}

.box {
  @include card(1rem 1.1rem);

  h3 {
    font-size: $text-base;
    margin-bottom: 0.6rem;
  }

  &__sub {
    margin-top: 1.1rem;
  }
}

.kv {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: $text-sm;

  li {
    display: flex;
    justify-content: space-between;
  }
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
</style>
