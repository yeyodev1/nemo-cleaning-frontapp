<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import CashTable from '@/components/admin/cash/CashTable.vue'
import MovementForm from '@/components/admin/cash/MovementForm.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useReport } from '@/composables/admin/useReport'
import { addDays, errorMessage, longDate, money, monthISO, monthRange, todayISO } from '@/utils/format'
import type { CashRow } from '@/types/finance'

const scope = useAdminScope()
const toast = useToastStore()
const mode = ref('day')
const date = ref(todayISO())
const month = ref(monthISO())
const branch = toRef(scope, 'branch')
const range = computed(() => (mode.value === 'day' ? { from: date.value, to: date.value } : monthRange(month.value)))
const { data, loading, load } = useReport(() => ledgerService.cash(range.value.from, range.value.to, scope.query), [range, branch])
const branchLabel = computed(() => scope.branchName(scope.branch) || 'Todas las sucursales (suma de cajas)')

const formOpen = ref(false)
function onSaved() {
  formOpen.value = false
  load()
}
const toDelete = ref<CashRow | null>(null)
const deleting = ref(false)
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await ledgerService.deleteMovement(toDelete.value.id)
    toast.success('Movimiento eliminado')
    toDelete.value = null
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    deleting.value = false
  }
}
const print = () => window.print()
</script>

<template>
  <section class="cash" :class="{ 'is-stale': loading && !!data }" :aria-busy="loading">
    <PageIntro text="Registro de caja como en el Excel: saldo inicial, ingresos, egresos y saldo acumulado. Los cobros en efectivo y los gastos de caja menor entran solos.">
      <button type="button" class="btn btn--ghost" @click="print"><AppIcon name="file" /> Imprimir</button>
      <button type="button" class="btn btn--primary" @click="formOpen = true"><AppIcon name="plus" /> Movimiento</button>
    </PageIntro>

    <SegTabs v-model="mode" :tabs="[{ value: 'day', label: 'Por día' }, { value: 'month', label: 'Mes completo' }]" />
    <div class="nav">
      <template v-if="mode === 'day'">
        <button type="button" class="btn btn--ghost btn--icon" aria-label="Día anterior" @click="date = addDays(date, -1)"><AppIcon name="chevron-left" /></button>
        <label class="nav__date"><span class="sr-only">Fecha</span><input v-model="date" type="date" /></label>
        <button type="button" class="btn btn--ghost btn--icon" aria-label="Día siguiente" @click="date = addDays(date, 1)"><AppIcon name="chevron-right" /></button>
        <button v-if="date !== todayISO()" type="button" class="btn btn--soft btn--sm" @click="date = todayISO()">Hoy</button>
      </template>
      <MonthNav v-else v-model="month" class="nav__month" />
    </div>
    <p class="head">{{ mode === 'day' ? longDate(date) : 'Mes completo' }} · {{ branchLabel }}</p>

    <div v-if="loading && !data" class="skeleton" style="height: 280px"></div>
    <template v-else-if="data">
      <KpiRow>
        <KpiCard label="Saldo inicial" :value="money(data.opening)" icon="wallet" />
        <KpiCard label="Ingresos" :value="money(data.totalIn)" icon="arrow-right" tone="success" :hint="`Producción en efectivo ${money(data.production)}`" />
        <KpiCard label="Egresos" :value="money(data.totalOut)" icon="arrow-left" tone="danger" :hint="`Caja menor ${money(data.pettyCash)}`" />
        <KpiCard label="Saldo en caja" :value="money(data.closing)" icon="cash" :tone="data.closing < 0 ? 'danger' : 'aqua'" hint="Debe coincidir con lo que hay físicamente" />
      </KpiRow>
      <CashTable :data="data" :show-date="mode === 'month'" @remove="toDelete = $event" />
    </template>

    <MovementForm :open="formOpen" :date="mode === 'day' ? date : todayISO()" @close="formOpen = false" @saved="onSaved" />
    <ConfirmSheet
      :open="!!toDelete"
      title="Eliminar movimiento"
      :message="toDelete ? `Se quitará el movimiento «${toDelete.detail || 'sin detalle'}» y el saldo se recalcula.` : ''"
      confirm-label="Eliminar"
      danger
      :busy="deleting"
      @close="toDelete = null"
      @confirm="confirmDelete"
    />
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

.nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;

  &__date {
    flex: 1 1 150px;
    max-width: 240px;
  }

  &__month {
    flex: 1 1 260px;
    max-width: 360px;
  }
}

.head {
  color: $ink-muted;
  font-size: $text-sm;
  margin-bottom: 1rem;

  &::first-letter {
    text-transform: uppercase;
  }
}

@media print {
  .nav,
  :deep(.intro__actions),
  :deep(.seg) {
    display: none;
  }
}
</style>
