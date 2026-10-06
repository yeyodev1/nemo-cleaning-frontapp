<script setup lang="ts">
import { onMounted, toRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import Pagination from '@/components/admin/common/Pagination.vue'
import BookingRow from '@/components/admin/bookings/BookingRow.vue'
import BookingFilters from '@/components/admin/bookings/BookingFilters.vue'
import { bookingsService, type BookingFilters as Filters } from '@/services/bookings.service'
import { usePagedList } from '@/composables/admin/usePagedList'
import { useAdminScope } from '@/stores/adminScope'

const scope = useAdminScope()
const initial: Filters = { status: '', paymentStatus: '', from: '', to: '', q: '' }
const { filters, items, page, pages, total, loading, load } = usePagedList(
  (q) => bookingsService.list({ ...q, branch: scope.query }),
  initial,
  [toRef(scope, 'branch')],
)
onMounted(() => load(1))
</script>

<template>
  <div class="bookings">
    <div class="bookings__head">
      <p class="muted">{{ total }} pedido{{ total === 1 ? '' : 's' }}</p>
      <RouterLink to="/admin/pedidos/nuevo" class="btn btn--primary"><AppIcon name="plus" /> Nuevo pedido</RouterLink>
    </div>

    <BookingFilters v-model="filters" />

    <div v-if="loading && !items.length" class="bookings__list">
      <span v-for="n in 5" :key="n" class="skeleton" style="height: 92px"></span>
    </div>
    <div v-else-if="!items.length" class="card empty">
      <AppIcon name="inbox" :size="28" style="margin: 0 auto 0.5rem" />
      No hay pedidos con estos filtros.
    </div>
    <div v-else class="bookings__list" :class="{ 'is-loading': loading }">
      <BookingRow v-for="b in items" :key="b._id" :booking="b" />
    </div>

    <Pagination :page="page" :pages="pages" :total="total" @go="load" />
  </div>
</template>

<style scoped lang="scss">
.bookings {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: opacity 0.2s;

    &.is-loading {
      opacity: 0.6;
    }
  }
}
</style>
