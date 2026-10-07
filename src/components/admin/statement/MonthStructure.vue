<script setup lang="ts">
import { computed } from 'vue'
import HBar from '@/components/admin/finance/HBar.vue'
import { pct } from '@/config/financeLabels'
import { money, monthLabel } from '@/utils/format'
import type { StatementMonth } from '@/types/finance'

/** "Indicadores del mes" + "Estructura financiera" (% de ventas por rubro) del Resumen Anual. */
const props = defineProps<{ m: StatementMonth; month: string }>()
const parts = computed(() => [
  { label: 'Sueldos', value: props.m.salaries },
  { label: 'Gastos variables', value: props.m.variable },
  { label: 'Gastos fijos', value: props.m.fixed },
  { label: 'Comisiones', value: props.m.commissions },
  { label: 'Utilidad neta', value: props.m.net },
])
const share = (v: number) => (props.m.sales ? v / props.m.sales : 0)
</script>

<template>
  <div class="ms">
    <article class="ms__box">
      <h3>Indicadores de {{ monthLabel(month) }}</h3>
      <ul class="kv">
        <li><span>Ventas</span><strong class="money">{{ money(m.sales) }}</strong></li>
        <li><span>Total gastos</span><strong class="money">{{ money(m.totalExpenses) }}</strong></li>
        <li><span>Utilidad neta</span><strong class="money" :class="{ neg: m.net < 0 }">{{ money(m.net) }}</strong></li>
        <li><span>Margen neto</span><strong>{{ pct(m.margin) }}</strong></li>
        <li><span>Cobrado en el mes</span><strong class="money">{{ money(m.collected) }}</strong></li>
      </ul>
    </article>
    <article class="ms__box">
      <h3>Estructura financiera <small>% de ventas</small></h3>
      <p v-if="!m.sales" class="muted">Sin ventas en el mes: no hay porcentajes que mostrar.</p>
      <div v-else class="bars">
        <HBar
          v-for="p in parts"
          :key="p.label"
          :label="p.label"
          :value="Math.max(0, p.value)"
          :max="m.sales"
          :display="`${money(p.value)} · ${pct(share(p.value))}`"
          :tone="p.label === 'Utilidad neta' ? undefined : 'danger'"
        />
      </div>
    </article>
  </div>
</template>

<style scoped lang="scss">
.ms {
  @include flex-cards(300px, 0.85rem);
  margin-top: 1rem;

  &__box {
    @include card(1rem 1.1rem);

    h3 {
      font-size: $text-base;
      margin-bottom: 0.6rem;

      &::first-letter {
        text-transform: uppercase;
      }

      small {
        color: $ink-muted;
        font-weight: 500;
        font-size: $text-xs;
      }
    }
  }
}

.kv {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: $text-sm;

  li {
    display: flex;
    justify-content: space-between;
  }
}

.neg {
  color: $danger;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
</style>
