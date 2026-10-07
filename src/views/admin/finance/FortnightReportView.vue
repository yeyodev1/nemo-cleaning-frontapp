<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import SectionHead from '@/components/admin/fortnight/SectionHead.vue'
import ReconciliationTable from '@/components/admin/fortnight/ReconciliationTable.vue'
import CollectedTable from '@/components/admin/fortnight/CollectedTable.vue'
import ExpensesTable from '@/components/admin/fortnight/ExpensesTable.vue'
import ToPayTable from '@/components/admin/fortnight/ToPayTable.vue'
import ProfitTable from '@/components/admin/fortnight/ProfitTable.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { useQColumns } from '@/composables/finance/useQColumns'
import { pct } from '@/config/financeLabels'
import { money, monthISO } from '@/utils/format'

const scope = useAdminScope()
const month = ref(monthISO())
const branch = toRef(scope, 'branch')
const cols = useQColumns(month)
const { data, loading } = useReport(() => ledgerService.fortnight(month.value, scope.query), [month, branch])
const branchLabel = computed(() => scope.branchName(scope.branch) || 'Consolidado (todas las sucursales)')
const diff = computed(() => data.value?.reconciliation.difference.total ?? 0)
const empty = computed(
  () => data.value && !data.value.bookings && !data.value.expenses.byCategory.length && !data.value.toPay.total.total,
)
</script>

<template>
  <section class="fr" :class="{ 'is-stale': loading && !!data }" :aria-busy="loading">
    <PageIntro text="Reporte de pagos y utilidad por quincena, igual que las hojas AGOSTO y SEPTIEMBRE: producción, lo cobrado por cuenta, gastos, pagos por realizar y si todo cuadra.">
      <RouterLink to="/admin/gastos" class="btn btn--ghost btn--sm"><AppIcon name="receipt" /> Gastos</RouterLink>
      <RouterLink to="/admin/finanzas/pagos" class="btn btn--ghost btn--sm"><AppIcon name="list" /> Pagos por realizar</RouterLink>
    </PageIntro>

    <div class="fr__filters">
      <MonthNav v-model="month" />
      <p class="fr__branch"><AppIcon name="store" :size="16" /> {{ branchLabel }} <small>· cámbiala arriba</small></p>
    </div>

    <div v-if="loading && !data" class="fr__skel"><span v-for="i in 4" :key="i" class="skeleton" style="height: 120px"></span></div>
    <template v-else-if="data">
      <KpiRow>
        <KpiCard label="Producción" :value="money(data.reconciliation.production.total)" icon="chart" :hint="`${data.bookings} servicios`" />
        <KpiCard label="Cobrado" :value="money(data.collected.total.total)" icon="wallet" tone="success" hint="Dinero que entró en el mes" />
        <KpiCard label="Gastos + pagos" :value="money(data.profit.totalCosts.total)" icon="receipt" tone="warning" />
        <KpiCard
          label="Utilidad"
          :value="money(data.profit.profit.total)"
          icon="sparkles"
          :tone="data.profit.profit.total < 0 ? 'danger' : 'aqua'"
          :hint="`Margen ${pct(data.profit.margin.total)}`"
        />
        <KpiCard
          label="Conciliación"
          :value="diff === 0 ? 'Cuadra' : money(diff)"
          icon="check-circle"
          :tone="diff === 0 ? 'success' : 'danger'"
          :hint="diff === 0 ? 'Diferencia $0.00' : 'Revisa la diferencia'"
        />
      </KpiRow>

      <p v-if="empty" class="fr__empty">
        Este mes aún no tiene servicios, gastos ni pagos cargados. Cuando registres la producción y los gastos, el reporte se arma solo.
      </p>

      <SectionHead :n="1" title="Resumen de producción / ingresos" text="Sobre los servicios realizados en cada quincena: cómo se pagó lo producido." />
      <ReconciliationTable :report="data" :cols="cols" />

      <SectionHead title="Cobrado por cuenta" text="Lo que entró en cada cuenta según la fecha del pago (puede incluir servicios de otros meses)." />
      <CollectedTable :report="data" :cols="cols" />

      <SectionHead :n="2" title="Gastos" text="Todo lo registrado en Gastos este mes, por categoría." />
      <ExpensesTable :report="data" :cols="cols" />

      <SectionHead :n="3" title="Pagos por realizar" text="Nómina de la quincena (ya con anticipos descontados) y los pagos programados." />
      <ToPayTable :report="data" :cols="cols" />

      <SectionHead title="Utilidad y liquidez" />
      <ProfitTable :report="data" :cols="cols" />
    </template>
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

.fr {
  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.75rem;
    margin-bottom: 1rem;

    > :first-child {
      flex: 1 1 260px;
      max-width: 360px;
    }
  }

  &__branch {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
    min-height: $tap;

    small {
      color: $ink-muted;
      font-weight: 500;
    }
  }

  &__skel {
    display: grid;
    gap: 0.75rem;
  }

  &__empty {
    @include card(0.9rem 1rem);
    background: $info-bg;
    border-color: transparent;
    color: $info;
    font-size: $text-sm;
    font-weight: 600;
  }
}
</style>
