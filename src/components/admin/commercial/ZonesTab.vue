<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import HBar from '@/components/admin/finance/HBar.vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { MONTHS_SHORT, pct } from '@/config/financeLabels'
import { money, monthISO } from '@/utils/format'

/** REP ZONA: % de servicios atendidos por zona, por mes. */
const scope = useAdminScope()
const year = ref(Number(monthISO().slice(0, 4)))
const branch = toRef(scope, 'branch')
const { data, loading } = useReport(() => ledgerService.zones(year.value, scope.query), [year, branch])
// Solo los meses con servicios: doce columnas vacías no dicen nada.
const activeMonths = computed(() => (data.value?.months ?? []).filter((m) => m.total))
const max = computed(() => Math.max(0, ...(data.value?.zones.map((z) => z.count) ?? [])))
const share = (m: { total: number; byZone: Record<string, number> }, z: string) => (m.total ? pct((m.byZone[z] || 0) / m.total, 0) : '')
</script>

<template>
  <div>
    <div class="year">
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Año anterior" @click="year--"><AppIcon name="chevron-left" /></button>
      <strong>{{ year }}</strong>
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Año siguiente" @click="year++"><AppIcon name="chevron-right" /></button>
    </div>
    <div v-if="loading && !data" class="skeleton" style="height: 200px"></div>
    <EmptyState v-else-if="data && !data.total" title="Sin servicios en este año" text="El reporte por zona se llena con la urbanización de cada servicio." icon="pin" />
    <template v-else-if="data">
      <article class="box">
        <h3>Servicios por zona en {{ year }} <small>{{ data.total }} servicios</small></h3>
        <div class="bars">
          <HBar v-for="z in data.zones" :key="z.zone" :label="z.zone" :sub="money(z.amount)" :value="z.count" :max="max" :display="`${z.count} · ${pct(z.share)}`" />
        </div>
      </article>
      <SheetTable caption="Porcentaje de servicios por zona y mes" compact>
        <thead>
          <tr><th>Zona</th><th v-for="m in activeMonths" :key="m.month" class="num">{{ MONTHS_SHORT[m.month - 1] }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="z in data.zones" :key="z.zone">
            <td>{{ z.zone }}</td>
            <td v-for="m in activeMonths" :key="m.month" class="num">{{ share(m, z.zone) || '—' }}</td>
          </tr>
          <tr class="is-total">
            <td>Servicios del mes</td>
            <td v-for="m in activeMonths" :key="m.month" class="num">{{ m.total }}</td>
          </tr>
        </tbody>
      </SheetTable>
    </template>
  </div>
</template>

<style scoped lang="scss">
.year {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.box {
  @include card(1rem 1.1rem);
  margin-bottom: 0.85rem;

  h3 {
    font-size: $text-base;
    margin-bottom: 0.7rem;

    small {
      color: $ink-muted;
      font-weight: 500;
      font-size: $text-xs;
    }
  }
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
</style>
