<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import AccountCard from '@/components/admin/bank/AccountCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useReport } from '@/composables/admin/useReport'
import { usePeriod } from '@/composables/finance/usePeriod'
import { errorMessage, money } from '@/utils/format'
import type { BankAccountRec, BankPayment } from '@/types/finance'

const scope = useAdminScope()
const toast = useToastStore()
const branch = toRef(scope, 'branch')
const { mode, range, label, shift } = usePeriod()
const { data, loading, load } = useReport(() => ledgerService.bank(range.value.from, range.value.to, scope.query), [range, branch])
const busyId = ref('')
const plural = (n: number) => `${n} ${n === 1 ? 'pago' : 'pagos'}`
const hasPayments = computed(() => (data.value?.totals.count ?? 0) > 0)

async function verify(p: BankPayment) {
  busyId.value = p._id
  try {
    await ledgerService.verifyPayment(p._id, !p.verified)
    toast.success(p.verified ? 'Marcado como no verificado' : 'Transferencia verificada')
    await load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busyId.value = ''
  }
}

async function saveBank(acc: BankAccountRec, amount: number | null) {
  try {
    await ledgerService.saveStatement({ account: acc.account, from: range.value.from, to: range.value.to, branch: scope.query, amount })
    toast.success(amount === null ? 'Monto del banco borrado' : `Monto de ${acc.account} guardado`)
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  }
}
</script>

<template>
  <section :class="{ 'is-stale': loading && !!data }" :aria-busy="loading">
    <PageIntro text="Compara lo que dice cada banco con los pagos registrados con esa cuenta. Marca cada transferencia cuando la veas en el estado de cuenta." />

    <SegTabs v-model="mode" :tabs="[{ value: 'week', label: 'Por semana' }, { value: 'fortnight', label: 'Por quincena' }]" />
    <div class="period">
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Periodo anterior" @click="shift(-1)"><AppIcon name="chevron-left" /></button>
      <strong>{{ label }}</strong>
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Periodo siguiente" @click="shift(1)"><AppIcon name="chevron-right" /></button>
    </div>

    <div v-if="loading && !data" class="skeleton" style="height: 220px"></div>
    <template v-else-if="data">
      <KpiRow>
        <KpiCard label="Registrado" :value="money(data.totals.registered)" icon="bank" :hint="plural(data.totals.count)" />
        <KpiCard label="Verificado" :value="money(data.totals.verified)" icon="check-circle" tone="success" />
        <KpiCard label="Por verificar" :value="money(data.totals.pendingVerification)" icon="clock" tone="warning" :hint="plural(data.totals.unverifiedCount)" />
      </KpiRow>
      <p v-if="!hasPayments" class="note">No hay transferencias ni pagos con tarjeta registrados en este periodo. Igual puedes anotar lo que dice el banco.</p>
      <EmptyState v-if="!data.items.length" title="No hay cuentas para conciliar" text="Agrega las cuentas bancarias en Configuración." icon="bank" />
      <div v-else class="grid">
        <AccountCard v-for="a in data.items" :key="a.account" :acc="a" :busy-id="busyId" @verify="verify" @bank="saveBank(a, $event)" />
      </div>
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

.period {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  strong::first-letter {
    text-transform: uppercase;
  }
}

.note {
  font-size: $text-sm;
  color: $ink-muted;
  margin-bottom: 0.75rem;
}

.grid {
  @include flex-cards(300px, 0.85rem);
  align-items: flex-start;
}
</style>
