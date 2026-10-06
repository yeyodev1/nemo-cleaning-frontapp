<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import HBar from '@/components/admin/finance/HBar.vue'
import DayChart from './DayChart.vue'
import { financeService } from '@/services/finance.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { money, monthISO, monthRange } from '@/utils/format'

const scope = useAdminScope()
const range = monthRange(monthISO())
const from = ref(range.from)
const to = ref(range.to)
const branch = toRef(scope, 'branch')
const { data, loading } = useReport(() => financeService.production({ from: from.value, to: to.value, branch: scope.query }), [from, to, branch])

const services = computed(() => [...(data.value?.byService || [])].sort((a, b) => b.amount - a.amount))
const operators = computed(() => [...(data.value?.byOperator || [])].sort((a, b) => b.amount - a.amount))
const days = computed(() => (data.value?.byDay || []).map((d) => ({ date: d.date, amount: d.amount })))
const maxS = computed(() => Math.max(0, ...services.value.map((s) => s.amount)))
const maxO = computed(() => Math.max(0, ...operators.value.map((s) => s.amount)))
const totals = computed(() => ({
  bookings: (data.value?.byDay || []).reduce((s, d) => s + d.bookings, 0),
  amount: (data.value?.byDay || []).reduce((s, d) => s + d.amount, 0),
}))
</script>

<template>
  <div>
    <div class="range">
      <label class="field"><span class="field__label">Desde</span><input v-model="from" type="date" /></label>
      <label class="field"><span class="field__label">Hasta</span><input v-model="to" type="date" /></label>
    </div>

    <div v-if="loading && !data" class="skeleton" style="height: 320px"></div>
    <template v-else-if="data">
      <article class="box">
        <div class="box__head">
          <h3>Producción por día</h3>
          <span class="muted">{{ totals.bookings }} pedidos · <strong class="money">{{ money(totals.amount) }}</strong></span>
        </div>
        <DayChart v-if="days.length" :days="days" />
        <p v-else class="muted">Sin datos en el rango.</p>
      </article>

      <div class="cols">
        <article class="box">
          <h3>Por servicio</h3>
          <div class="bars">
            <HBar v-for="s in services" :key="s.service || s.name" :label="s.name" :sub="`${s.quantity} u.`" :value="s.amount" :max="maxS" :display="money(s.amount)" />
            <p v-if="!services.length" class="muted">Sin datos.</p>
          </div>
        </article>
        <article class="box">
          <h3>Por operador</h3>
          <div class="bars">
            <HBar v-for="o in operators" :key="o.operator || o.name" tone="aqua" :label="o.name" :sub="`${o.bookings} pedidos`" :value="o.amount" :max="maxO" :display="money(o.amount)" />
            <p v-if="!operators.length" class="muted">Sin datos.</p>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.range {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  max-width: 420px;

  > * {
    flex: 1;
  }
}

.box {
  @include card(1rem 1.1rem);
  margin-bottom: 0.85rem;

  h3 {
    font-size: $text-base;
    margin-bottom: 0.6rem;
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    font-size: $text-sm;
  }
}

.cols {
  @include flex-cards(320px, 0.85rem);

  .box {
    margin-bottom: 0;
  }
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
</style>
