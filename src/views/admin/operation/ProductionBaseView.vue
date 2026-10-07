<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import Pagination from '@/components/admin/common/Pagination.vue'
import FilterBar from '@/components/admin/finance/FilterBar.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import ProductionTable from '@/components/admin/operation/ProductionTable.vue'
import ProductionCards from '@/components/admin/operation/ProductionCards.vue'
import RowSheet from '@/components/admin/operation/RowSheet.vue'
import { useProductionBase, type RangePreset } from '@/composables/operation/useProductionBase'
import { paymentConfirmation } from '@/config/operationLabels'
import { money } from '@/utils/format'
import type { ProductionRow } from '@/types/operation'

const b = useProductionBase()
const { filters } = b
const presets = [
  { value: 'today', label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: 'fortnight', label: 'Esta quincena' },
  { value: 'month', label: 'Este mes' },
]
const presetModel = computed({
  get: () => b.preset.value,
  set: (v: string | string[]) => b.setPreset(v as RangePreset),
})
const totals = computed(() => b.data.value?.totals)
const pendingConf = computed(() => totals.value?.byConfirmation.pending_confirmation)
const multiDay = computed(() => filters.from !== filters.to)
const selected = ref<ProductionRow | null>(null)

async function onConfirm(row: ProductionRow, confirmation: string, account: string) {
  if (await b.changeConfirmation(row, confirmation, account)) selected.value = null
}
function onChanged() {
  selected.value = null
  b.load()
}
</script>

<template>
  <section>
    <PageIntro text="La Base: cada servicio producido con su operador, urbanización, pago y confirmación, igual que la hoja del Excel. Toca una fila para confirmar el pago o anotar una novedad.">
      <RouterLink to="/admin/produccion/registrar" class="btn btn--primary"><AppIcon name="plus" /> Registrar servicio</RouterLink>
      <button type="button" class="btn btn--ghost" :disabled="b.exporting.value || !totals?.count" @click="b.exportCsv()">
        <AppIcon name="file" /> {{ b.exporting.value ? 'Exportando…' : 'Exportar CSV' }}
      </button>
    </PageIntro>

    <div class="range">
      <ChoiceChips v-model="presetModel" :options="presets" label="Periodo" small />
      <div class="range__dates">
        <label class="field"><span class="field__label">Desde</span><input v-model="filters.from" type="date" @change="b.preset.value = 'custom'" /></label>
        <label class="field"><span class="field__label">Hasta</span><input v-model="filters.to" type="date" @change="b.preset.value = 'custom'" /></label>
      </div>
    </div>

    <KpiRow v-if="totals">
      <KpiCard label="Producción" :value="money(totals.production)" icon="chart" :hint="`${totals.count} servicios`" />
      <KpiCard label="Por cobrar" :value="money(totals.receivable)" icon="wallet" tone="warning" hint="Sin plan mensual, canje, cortesía ni perdidas" />
      <KpiCard label="Por confirmar" :value="money(totals.toConfirm ?? pendingConf?.total ?? 0)" icon="bank" tone="aqua" hint="Transferencias por verificar: no es deuda" />
      <KpiCard label="Propinas" :value="money(totals.tip)" icon="cash" tone="success" />
    </KpiRow>

    <FilterBar>
      <label class="field">
        <span class="field__label">Operador</span>
        <select v-model="filters.operator">
          <option value="">Todos</option>
          <option v-for="o in b.options.value?.operators || []" :key="o._id" :value="o._id">{{ o.name }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Urbanización</span>
        <select v-model="filters.zone">
          <option value="">Todas</option>
          <option v-for="z in b.zones.value" :key="z" :value="z">{{ z }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Forma de pago</span>
        <select v-model="filters.account">
          <option value="">Todas</option>
          <option v-for="a in b.options.value?.accounts || []" :key="a.label" :value="a.label">{{ a.label }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Confirmación</span>
        <select v-model="filters.confirmation">
          <option value="">Todas</option>
          <option v-for="(c, k) in paymentConfirmation" :key="k" :value="k">{{ c.label }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Buscar</span>
        <input v-model="filters.q" type="search" placeholder="Cliente o código" />
      </label>
    </FilterBar>

    <div v-if="b.loading.value && !b.data.value" class="skel"><span v-for="i in 4" :key="i" class="skeleton" style="height: 84px"></span></div>
    <EmptyState
      v-else-if="!b.data.value?.items.length"
      title="No hay servicios en este periodo"
      text="Registra los servicios que ya se hicieron o mira otro periodo."
      icon="list"
    >
      <RouterLink to="/admin/produccion/registrar" class="btn btn--primary"><AppIcon name="plus" /> Registrar servicio</RouterLink>
      <button v-if="b.preset.value !== 'month'" type="button" class="btn btn--ghost" @click="b.setPreset('month')">Ver este mes</button>
    </EmptyState>
    <template v-else-if="b.data.value">
      <div class="only-mobile">
        <ProductionCards :items="b.data.value.items" :multi-day="multiDay" @select="selected = $event" />
        <p class="foot">
          <span>{{ totals?.count }} servicios</span>
          <strong class="money">{{ money(totals?.production) }}</strong>
        </p>
      </div>
      <div class="only-desktop"><ProductionTable :data="b.data.value" @select="selected = $event" /></div>
      <Pagination :page="b.page.value" :pages="b.data.value.pages" :total="b.data.value.total" @go="b.load" />
    </template>

    <RowSheet :row="selected" :accounts="b.options.value?.accounts || []" @close="selected = null" @confirm="onConfirm" @changed="onChanged" />
  </section>
</template>

<style scoped lang="scss">
.range {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1rem;

  &__dates {
    display: flex;
    gap: 0.6rem;
    max-width: 420px;

    > * {
      flex: 1;
      min-width: 0;
    }
  }

  @include from('lg') {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.skel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.only-desktop {
  display: none;
}

@include from('lg') {
  .only-mobile {
    display: none;
  }

  .only-desktop {
    display: block;
  }
}

.foot {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0.9rem;
  margin-top: 0.5rem;
  border-radius: $radius-md;
  background: $navy-soft;
  font-weight: 700;
  font-size: $text-sm;
}
</style>
