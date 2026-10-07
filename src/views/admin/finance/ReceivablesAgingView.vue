<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { useShowMore } from '@/composables/admin/useShowMore'
import { agingBucket } from '@/config/financeLabels'
import { money, shortDate, whatsappUrl } from '@/utils/format'
import type { AgingBucket } from '@/types/finance'

const scope = useAdminScope()
const branch = toRef(scope, 'branch')
const { data, loading } = useReport(() => ledgerService.receivables(scope.query), [branch])
const filter = ref<'' | AgingBucket>('')
const buckets = Object.keys(agingBucket) as AgingBucket[]
const tabs = computed(() => [
  { value: '', label: 'Todos' },
  ...buckets.map((b) => ({ value: b, label: agingBucket[b].label, count: data.value?.items.filter((i) => i.bucket === b).length || 0 })),
])
const items = computed(() => (data.value?.items ?? []).filter((i) => !filter.value || i.bucket === filter.value))
const { visible, remaining, more, step } = useShowMore(items)
const open = ref<string | null>(null)
const keyOf = (i: { customer: { _id: string | null; name: string } }) => i.customer._id || i.customer.name
function remind(i: (typeof items.value)[number]) {
  const lines = i.bookings.map((b) => `${b.code} del ${shortDate(b.date)}: ${money(b.balance)}`).join('\n')
  return whatsappUrl(i.customer.phone, `Hola ${i.customer.name}, te escribimos de Nemo Cleaning. Tienes un saldo pendiente:\n${lines}\nTotal: ${money(i.total)}. ¡Gracias!`)
}
</script>

<template>
  <section>
    <PageIntro text="Quién nos debe y desde hace cuánto (como la hoja CXC): servicios ya realizados con saldo pendiente, agrupados por cliente y por antigüedad." />

    <div v-if="loading && !data" class="skeleton" style="height: 260px"></div>
    <template v-else-if="data">
      <KpiRow>
        <KpiCard label="Total por cobrar" :value="money(data.total)" icon="wallet" tone="warning" :hint="`${data.customers} clientes · ${data.bookings} servicios`" />
        <KpiCard v-for="b in buckets" :key="b" :label="agingBucket[b].label" :value="money(data.buckets[b])" :tone="b === 'd60' ? 'danger' : b === 'd0_5' ? 'success' : 'warning'" icon="clock" />
      </KpiRow>
      <p v-if="data.toConfirm?.total" class="lost">
        Aparte, <strong class="money">{{ money(data.toConfirm.total) }}</strong> en {{ data.toConfirm.count }} transferencias por confirmar
        (no es deuda): <RouterLink to="/admin/pagos">revísalas en Pagos</RouterLink>.
      </p>
      <p v-if="data.lost.total" class="lost">Marcado como perdida (no se suma): {{ money(data.lost.total) }} en {{ data.lost.count }} {{ data.lost.count === 1 ? 'servicio' : 'servicios' }}.</p>

      <SegTabs v-model="filter" :tabs="tabs" />

      <EmptyState
        v-if="!data.items.length"
        title="Nadie tiene saldo pendiente"
        text="Cuando un servicio realizado quede sin pagar (o con abono parcial) aparecerá aquí con sus días de atraso."
        icon="check-circle"
      />
      <p v-else-if="!items.length" class="empty">No hay clientes en este rango.</p>
      <TransitionGroup v-else name="fade-up" tag="ul" class="list">
        <li v-for="i in visible" :key="keyOf(i)" class="cx">
          <button type="button" class="cx__head" :aria-expanded="open === keyOf(i)" @click="open = open === keyOf(i) ? null : keyOf(i)">
            <span class="cx__who">
              <strong>{{ i.customer.name }}</strong>
              <small>{{ i.bookings.length }} {{ i.bookings.length === 1 ? 'servicio' : 'servicios' }} · el más antiguo hace {{ i.oldestDays }} días</small>
            </span>
            <span class="cx__end">
              <strong class="money">{{ money(i.total) }}</strong>
              <StatusBadge :tone="agingBucket[i.bucket].tone" :label="agingBucket[i.bucket].label" />
            </span>
            <AppIcon name="chevron-down" class="cx__chev" :class="{ 'is-open': open === keyOf(i) }" />
          </button>
          <div v-if="open === keyOf(i)" class="cx__body">
            <ul class="cx__rows">
              <li v-for="b in i.bookings" :key="b._id">
                <RouterLink :to="`/admin/pedidos/${b._id}`">{{ b.code }}</RouterLink>
                <span>{{ shortDate(b.date) }} · {{ b.days }} días</span>
                <span class="money">Total {{ money(b.total) }} · pagó {{ money(b.amountPaid) }}</span>
                <strong class="money">{{ money(b.balance) }}</strong>
              </li>
            </ul>
            <a v-if="i.customer.phone" :href="remind(i)" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">
              <AppIcon name="whatsapp" :size="16" /> Recordar por WhatsApp
            </a>
          </div>
        </li>
      </TransitionGroup>
      <button v-if="remaining" type="button" class="btn btn--ghost more" @click="more">Ver {{ Math.min(remaining, step) }} más · quedan {{ remaining }}</button>
    </template>
  </section>
</template>

<style scoped lang="scss">
.more {
  display: flex;
  margin: 1rem auto 0;
}
.lost {
  font-size: $text-sm;
  color: $ink-muted;
  margin-bottom: 0.75rem;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cx {
  @include card(0);
  overflow: hidden;

  &__head {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 0.9rem;
    text-align: left;
    min-height: $tap;
  }

  &__who {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    small {
      color: $ink-muted;
      font-size: $text-xs;
    }
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  &__chev {
    color: $ink-muted;
    transition: transform $dur-fast $ease-out;

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__body {
    padding: 0 0.9rem 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    align-items: flex-start;
  }

  &__rows {
    list-style: none;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: $text-sm;

    li {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 0.75rem;
      padding: 0.5rem 0.6rem;
      border-radius: $radius-sm;
      background: $sky;

      strong {
        margin-left: auto;
      }

      a {
        font-weight: 700;
        color: $navy;
      }
    }
  }
}
</style>
