<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import AnnualTable from '@/components/admin/statement/AnnualTable.vue'
import MonthStructure from '@/components/admin/statement/MonthStructure.vue'
import MonthlyDetail from '@/components/admin/statement/MonthlyDetail.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { pct } from '@/config/financeLabels'
import { money, monthISO } from '@/utils/format'

const scope = useAdminScope()
const tab = ref('anual')
const year = ref(Number(monthISO().slice(0, 4)))
const current = ref(Number(monthISO().slice(5, 7)))
const branch = toRef(scope, 'branch')
const { data, loading } = useReport(() => ledgerService.annual(year.value, scope.query), [year, branch])
const monthStr = computed(() => `${year.value}-${String(current.value).padStart(2, '0')}`)
const selected = computed(() => data.value?.months[current.value - 1])
const missingPayroll = computed(() => data.value?.months.some((m) => m.sales && !m.payrollLoaded))
const branchLabel = computed(() => scope.branchName(scope.branch) || 'Consolidado')
function openDetail(m: number) {
  current.value = m
}
</script>

<template>
  <section :class="{ 'is-stale': loading && !!data }" :aria-busy="loading">
    <PageIntro text="Estado de resultados como el Resumen Anual: ventas = producción, menos sueldos, gastos variables, gastos fijos y comisiones. Por sucursal o consolidado (elige arriba)." />
    <SegTabs v-model="tab" :tabs="[{ value: 'anual', label: 'Resumen anual' }, { value: 'mes', label: 'Detalle mensual' }]" />

    <Transition name="fade" mode="out-in">
      <div v-if="tab === 'anual'" key="a">
        <div class="year">
          <button type="button" class="btn btn--ghost btn--icon" aria-label="Año anterior" @click="year--"><AppIcon name="chevron-left" /></button>
          <strong>{{ year }} · {{ branchLabel }}</strong>
          <button type="button" class="btn btn--ghost btn--icon" aria-label="Año siguiente" @click="year++"><AppIcon name="chevron-right" /></button>
        </div>
        <div v-if="loading && !data" class="skeleton" style="height: 340px"></div>
        <template v-else-if="data">
          <KpiRow>
            <KpiCard :label="`Ventas ${year}`" :value="money(data.total.sales)" icon="chart" />
            <KpiCard label="Total gastos" :value="money(data.total.totalExpenses)" icon="receipt" tone="warning" />
            <KpiCard label="Utilidad neta" :value="money(data.total.net)" icon="sparkles" :tone="data.total.net < 0 ? 'danger' : 'success'" />
            <KpiCard label="Margen neto" :value="pct(data.total.margin)" icon="chart" tone="aqua" :hint="`Gastos/ventas ${pct(data.total.expenseRatio)}`" />
          </KpiRow>
          <p class="hint">Toca un mes en el encabezado para ver sus indicadores abajo.</p>
          <AnnualTable :data="data" :current="current" @pick="openDetail" />
          <p v-if="missingPayroll" class="warn">* Mes con ventas pero sin nómina cargada: los sueldos aparecen en $0 hasta que abras ese mes en Nómina.</p>
          <MonthStructure v-if="selected" :m="selected" :month="monthStr" />
          <button type="button" class="btn btn--soft more" @click="tab = 'mes'">Ver el detalle de {{ monthStr }} <AppIcon name="arrow-right" /></button>
        </template>
      </div>
      <MonthlyDetail v-else key="m" :initial="monthStr" />
    </Transition>
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

.year {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.hint {
  font-size: $text-xs;
  color: $ink-muted;
  margin-bottom: 0.4rem;
}

.warn {
  margin-top: 0.6rem;
  font-size: $text-sm;
  color: $warning;
  font-weight: 600;
}

.more {
  margin-top: 1rem;
}
</style>
