<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import PayableForm from '@/components/admin/payables/PayableForm.vue'
import PayableItem from '@/components/admin/payables/PayableItem.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useReport } from '@/composables/admin/useReport'
import { pct } from '@/config/financeLabels'
import { errorMessage, fortnightLabel, money, monthISO } from '@/utils/format'
import type { Payable } from '@/types/finance'

const scope = useAdminScope()
const toast = useToastStore()
const month = ref(monthISO())
const branch = toRef(scope, 'branch')
const q = ref('all')
const { data, loading, load } = useReport(() => ledgerService.payables(month.value, scope.query), [month, branch])

const items = computed(() => data.value?.items ?? [])
const groups = computed(() =>
  ([1, 2] as const)
    .filter((f) => q.value === 'all' || q.value === String(f))
    .map((f) => {
      const list = items.value.filter((p) => p.fortnight === f)
      return { f, list, total: list.reduce((s, p) => s + p.amount, 0) }
    }),
)
const tabs = computed(() => [
  { value: 'all', label: 'Mes completo' },
  { value: '1', label: 'Q1 (1–15)', count: items.value.filter((p) => p.fortnight === 1 && p.status !== 'paid').length },
  { value: '2', label: 'Q2 (16–fin)', count: items.value.filter((p) => p.fortnight === 2 && p.status !== 'paid').length },
])
const branchName = (id: string | null) => (id ? scope.branchName(id) || 'Sucursal' : 'General')

const formOpen = ref(false)
const editing = ref<Payable | null>(null)
function openForm(p: Payable | null) {
  editing.value = p
  formOpen.value = true
}
function onSaved() {
  formOpen.value = false
  load()
}

const busyId = ref('')
async function markPaid(p: Payable) {
  busyId.value = p._id
  try {
    await ledgerService.updatePayable(p._id, { status: 'paid' })
    toast.success(`${p.beneficiary}: marcado como pagado`)
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busyId.value = ''
  }
}

const toDelete = ref<Payable | null>(null)
const deleting = ref(false)
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await ledgerService.deletePayable(toDelete.value._id)
    toast.success('Pago eliminado de la lista')
    toDelete.value = null
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    deleting.value = false
  }
}

const copying = ref(false)
async function copyPrevious() {
  copying.value = true
  try {
    const r = await ledgerService.copyPayables(month.value, scope.query)
    if (r.created) toast.success(`Se copiaron ${r.created} pagos del mes anterior como pendientes`)
    else toast.info(r.skipped ? 'Los pagos del mes anterior ya estaban en este mes' : 'El mes anterior no tiene pagos para copiar')
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    copying.value = false
  }
}
</script>

<template>
  <section :class="{ 'is-stale': loading && !!data }" :aria-busy="loading">
    <PageIntro text="Checklist de lo que hay que pagar en cada quincena (alquiler, créditos, servicios, proveedores, comisiones). Los sueldos se controlan en Nómina.">
      <button type="button" class="btn btn--ghost" :disabled="copying" @click="copyPrevious">
        <AppIcon name="copy" /> {{ copying ? 'Copiando…' : 'Copiar del mes anterior' }}
      </button>
      <button type="button" class="btn btn--primary" @click="openForm(null)"><AppIcon name="plus" /> Nuevo pago</button>
    </PageIntro>

    <div class="filters">
      <MonthNav v-model="month" />
    </div>

    <p class="note">
      <AppIcon name="info" :size="18" />
      <span>
        Lo pagado aparece solo en Gastos (con la fecha de pago). Los de categoría <strong>Nómina</strong> no se suman
        como gasto: los sueldos se cuentan desde Nómina.
      </span>
    </p>

    <KpiRow v-if="data">
      <KpiCard label="Total listado" :value="money(data.totals.total)" icon="list" :hint="`${data.totals.count} pagos`" />
      <KpiCard label="Pagado" :value="money(data.totals.paid)" icon="check-circle" tone="success" />
      <KpiCard label="Pendiente" :value="money(data.totals.pending)" icon="clock" tone="warning" :hint="`${data.totals.pendingCount} por pagar`" />
      <KpiCard label="% pagado" :value="pct(data.totals.paidRatio)" icon="chart" tone="aqua" />
    </KpiRow>

    <SegTabs v-model="q" :tabs="tabs" />

    <div v-if="loading && !data" class="rows"><span v-for="i in 4" :key="i" class="skeleton" style="height: 76px"></span></div>
    <EmptyState
      v-else-if="!items.length"
      title="No hay pagos programados este mes"
      text="Agrega lo que toca pagar o copia la lista del mes anterior (alquiler, créditos y servicios se repiten)."
      icon="list"
    >
      <button type="button" class="btn btn--primary" @click="openForm(null)"><AppIcon name="plus" /> Agregar el primero</button>
    </EmptyState>
    <template v-else>
      <div v-for="g in groups" :key="g.f" class="group">
        <h3 class="group__title">
          {{ fortnightLabel(month, g.f as 1 | 2) }}
          <span class="money">{{ money(g.total) }}</span>
        </h3>
        <TransitionGroup v-if="g.list.length" name="fade-up" tag="ul" class="rows">
          <PayableItem
            v-for="p in g.list"
            :key="p._id"
            :p="p"
            :branch-name="branchName(p.branch)"
            :busy="busyId === p._id"
            @pay="markPaid(p)"
            @edit="openForm(p)"
            @remove="toDelete = p"
          />
        </TransitionGroup>
        <p v-else class="group__none">Nada programado en esta quincena.</p>
      </div>
    </template>

    <PayableForm :open="formOpen" :payable="editing" :month="month" @close="formOpen = false" @saved="onSaved" />
    <ConfirmSheet
      :open="!!toDelete"
      title="Eliminar pago"
      :message="toDelete ? `Se quitará «${toDelete.beneficiary}» por ${money(toDelete.amount)} de la lista de este mes.` : ''"
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

.filters {
  max-width: 360px;
  margin-bottom: 1rem;
}

.note {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.75rem 0.9rem;
  margin-bottom: 1rem;
  border-radius: $radius-md;
  background: $info-bg;
  color: $info;
  font-size: $text-sm;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group {
  margin-bottom: 1.25rem;

  &__title {
    display: flex;
    justify-content: space-between;
    font-size: $text-base;
    margin-bottom: 0.5rem;
  }

  &__none {
    font-size: $text-sm;
    color: $ink-muted;
    padding: 0.5rem 0;
  }
}
</style>
