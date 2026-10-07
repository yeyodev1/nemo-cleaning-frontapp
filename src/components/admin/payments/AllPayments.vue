<script setup lang="ts">
import { onMounted, toRef } from 'vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Pagination from '@/components/admin/common/Pagination.vue'
import FilterBar from '@/components/admin/finance/FilterBar.vue'
import ProofLink from './ProofLink.vue'
import { usePagedList } from '@/composables/admin/usePagedList'
import { bookingsService, type PaymentFilters } from '@/services/bookings.service'
import { useAdminScope } from '@/stores/adminScope'
import { moneyMethods, options, paymentMethod, paymentRecordStatus } from '@/config/labels'
import { dateTime, money } from '@/utils/format'

const scope = useAdminScope()
const branch = toRef(scope, 'branch')
const initial: PaymentFilters = { status: '', method: '', from: '', to: '' }
const { filters, items, page, pages, total, loading, load } = usePagedList(
  (q) => bookingsService.payments({ ...q, branch: scope.query }),
  initial,
  [branch],
)
onMounted(() => load(1))
</script>

<template>
  <div>
    <FilterBar>
      <label class="field">
        <span class="field__label">Estado</span>
        <select v-model="filters.status">
          <option value="">Todos</option>
          <option v-for="o in options(paymentRecordStatus)" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Método</span>
        <select v-model="filters.method">
          <option value="">Todos</option>
          <option v-for="o in moneyMethods" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>
      <label class="field"><span class="field__label">Desde</span><input v-model="filters.from" type="date" /></label>
      <label class="field"><span class="field__label">Hasta</span><input v-model="filters.to" type="date" /></label>
    </FilterBar>

    <div v-if="loading && !items.length" class="rows">
      <span v-for="i in 5" :key="i" class="skeleton" style="height: 64px"></span>
    </div>
    <p v-else-if="!items.length" class="empty">No hay pagos con esos filtros.</p>
    <ul v-else class="rows">
      <li v-for="p in items" :key="p._id" class="row">
        <ProofLink v-if="p.proofUrl" :url="p.proofUrl" class="row__proof" />
        <div class="row__main">
          <RouterLink :to="`/admin/pedidos/${p.booking}`" class="row__code">{{ p.bookingCode }}</RouterLink>
          <span class="row__meta">
            {{ paymentMethod[p.method] }}{{ p.provider === 'payphone' ? ' · Payphone' : '' }} · {{ dateTime(p.createdAt) }}
            <template v-if="p.registeredBy?.name"> · {{ p.registeredBy.name }}</template>
          </span>
          <span v-if="p.note" class="row__meta">{{ p.note }}</span>
        </div>
        <div class="row__end">
          <strong class="money">{{ money(p.amount) }}</strong>
          <StatusBadge :tone="paymentRecordStatus[p.status].tone" :label="paymentRecordStatus[p.status].label" />
        </div>
      </li>
    </ul>
    <Pagination :page="page" :pages="pages" :total="total" @go="load" />
  </div>
</template>

<style scoped lang="scss">
.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.row {
  @include card(0.75rem 0.9rem);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &__proof {
    width: 48px !important;
    height: 48px !important;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__code {
    font-weight: 800;
    color: $navy;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }
}
</style>
