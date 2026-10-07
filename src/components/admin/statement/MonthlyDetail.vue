<script setup lang="ts">
import { ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import SectionHead from '@/components/admin/fortnight/SectionHead.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { expenseCategory } from '@/config/labels'
import { pct } from '@/config/financeLabels'
import { money, shortDate } from '@/utils/format'

/** "Detalle Mensual": elegir el mes → resumen y detalle de sueldos, gastos variables y fijos. */
const props = defineProps<{ initial: string }>()
const scope = useAdminScope()
const month = ref(props.initial)
const branch = toRef(scope, 'branch')
const { data, loading } = useReport(() => ledgerService.monthly(month.value, scope.query), [month, branch])
const open = ref<string | null>(null)
const toggle = (k: string) => (open.value = open.value === k ? null : k)
</script>

<template>
  <div :class="{ 'is-stale': loading && !!data }" :aria-busy="loading">
    <div class="filters"><MonthNav v-model="month" label="Mes a visualizar" /></div>
    <div v-if="loading && !data" class="skeleton" style="height: 300px"></div>
    <template v-else-if="data">
      <KpiRow>
        <KpiCard label="Ventas" :value="money(data.summary.sales)" icon="chart" />
        <KpiCard label="Total gastos" :value="money(data.summary.totalExpenses)" icon="receipt" tone="warning" />
        <KpiCard label="Utilidad neta" :value="money(data.summary.net)" icon="sparkles" :tone="data.summary.net < 0 ? 'danger' : 'success'" />
        <KpiCard label="Margen neto" :value="pct(data.summary.margin)" icon="chart" tone="aqua" />
      </KpiRow>

      <SheetTable caption="Resumen financiero" compact>
        <thead><tr><th>Resumen financiero</th><th class="num">Valor</th><th class="num">% de ventas</th></tr></thead>
        <tbody>
          <tr class="is-key"><td>Ventas</td><td class="num">{{ money(data.summary.sales) }}</td><td class="num">100%</td></tr>
          <tr v-for="r in [['Sueldos', data.summary.salaries], ['Gastos variables', data.summary.variable], ['Gastos fijos', data.summary.fixed], ['Comisiones', data.summary.commissions]]" :key="r[0]">
            <td>{{ r[0] }}</td>
            <td class="num">{{ money(Number(r[1])) }}</td>
            <td class="num">{{ data.summary.sales ? pct(Number(r[1]) / data.summary.sales) : '—' }}</td>
          </tr>
          <tr class="is-total"><td>Total gastos</td><td class="num">{{ money(data.summary.totalExpenses) }}</td><td class="num">{{ pct(data.summary.expenseRatio) }}</td></tr>
          <tr class="is-key"><td>Utilidad neta</td><td class="num" :class="{ neg: data.summary.net < 0 }">{{ money(data.summary.net) }}</td><td class="num">{{ pct(data.summary.margin) }}</td></tr>
        </tbody>
      </SheetTable>

      <SectionHead title="Detalle de sueldos" />
      <SheetTable caption="Detalle de sueldos" compact>
        <thead><tr><th>Colaborador</th><th class="num">Valor</th><th class="num">% de nómina</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in data.salaries.rows" :key="i">
            <td>{{ r.name }}<small v-if="r.position" class="muted pos"> {{ r.position }}</small></td>
            <td class="num">{{ money(r.amount) }}</td><td class="num">{{ pct(r.share) }}</td>
          </tr>
          <tr v-if="!data.salaries.rows.length"><td colspan="3" class="muted">Sin nómina cargada para este mes (se abre en Nómina).</td></tr>
          <tr class="is-total"><td>Total nómina</td><td class="num">{{ money(data.salaries.total) }}</td><td class="num">100%</td></tr>
        </tbody>
      </SheetTable>

      <template v-for="g in [{ key: 'variable', title: 'Detalle de gastos variables', block: data.variable }, { key: 'fixed', title: 'Detalle de gastos fijos', block: data.fixed }]" :key="g.key">
        <SectionHead :title="g.title" text="Toca una categoría para ver cada gasto." />
        <SheetTable :caption="g.title" compact>
          <thead><tr><th>Concepto</th><th class="num">Valor</th><th class="num">% del rubro</th></tr></thead>
          <tbody>
            <template v-for="c in g.block.categories" :key="c.category">
              <tr class="cat" @click="toggle(g.key + c.category)">
                <td><button type="button" class="cat__btn" :aria-expanded="open === g.key + c.category">{{ expenseCategory[c.category] || c.category }} <small class="muted">({{ c.items.length }})</small></button></td>
                <td class="num">{{ money(c.amount) }}</td><td class="num">{{ pct(c.share) }}</td>
              </tr>
              <template v-if="open === g.key + c.category">
                <tr v-for="it in c.items" :key="it._id" class="is-sub">
                  <td>{{ shortDate(it.date) }} · {{ it.description }}<small v-if="it.installment" class="muted"> · diferido</small><small v-if="it.recurring" class="muted"> · se repite</small></td>
                  <td class="num">{{ money(it.amount) }}</td><td></td>
                </tr>
              </template>
            </template>
            <tr v-if="!g.block.categories.length"><td colspan="3" class="muted">Sin gastos de este tipo en el mes.</td></tr>
            <tr class="is-total"><td>Subtotal</td><td class="num">{{ money(g.block.total) }}</td><td class="num">{{ g.block.total ? '100%' : '—' }}</td></tr>
          </tbody>
        </SheetTable>
      </template>

      <p v-if="data.excluded.anticipos || data.excluded.propinas" class="note">
        No suman como gasto:
        <template v-if="data.excluded.anticipos">anticipos {{ money(data.excluded.anticipos) }} (ya están dentro de los sueldos)</template>
        <template v-if="data.excluded.anticipos && data.excluded.propinas"> y </template>
        <template v-if="data.excluded.propinas">propinas {{ money(data.excluded.propinas) }} (entraron por cuenta y se entregaron al operador)</template>.
      </p>
    </template>
  </div>
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

.pos {
  display: block;
  font-size: 0.72rem;
}

.cat {
  cursor: pointer;

  &__btn {
    font: inherit;
    font-weight: 700;
    color: $navy;
    text-align: left;
  }
}

.note {
  margin-top: 1rem;
  font-size: $text-sm;
  color: $ink-muted;
}
</style>
