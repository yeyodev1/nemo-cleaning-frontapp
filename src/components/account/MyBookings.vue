<script setup lang="ts">
import { onMounted } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import { useMyBookings } from '@/composables/account/useMyBookings'
import { money, shortDate } from '@/utils/format'
import type { CustomerBooking } from '@/types/api'

const { items, total, page, pages, loading, error, load } = useMyBookings()
onMounted(() => load())

const summary = (b: CustomerBooking) =>
  b.items.map((i) => (i.quantity > 1 ? `${i.name} ×${i.quantity}` : i.name)).join(', ')
</script>

<template>
  <section class="mine">
    <header class="mine__head">
      <h2>Mis pedidos</h2>
      <span v-if="total" class="muted">{{ total }}</span>
    </header>

    <div v-if="loading && !items.length" class="mine__list" aria-busy="true">
      <div v-for="n in 2" :key="n" class="skeleton mine__skeleton"></div>
    </div>

    <p v-else-if="error" class="mine__error" role="alert">
      {{ error }} <button type="button" class="btn btn--ghost btn--sm" @click="load()">Reintentar</button>
    </p>

    <div v-else-if="!items.length" class="card mine__empty">
      <AppIcon name="inbox" :size="28" />
      <p>Aún no tienes pedidos con este correo.</p>
      <RouterLink to="/reservar" class="btn btn--primary">Reservar una limpieza</RouterLink>
    </div>

    <ul v-else class="mine__list">
      <li v-for="b in items" :key="b._id">
        <RouterLink :to="{ path: `/pedido/${b.code}`, query: { token: b.accessToken } }" class="card mine__item">
          <div class="mine__top">
            <strong class="mine__code">{{ b.code }}</strong>
            <span class="money mine__total">{{ money(b.total) }}</span>
          </div>
          <p class="mine__when">
            <AppIcon name="calendar" :size="16" /> {{ shortDate(b.date) }} · {{ b.time }}
            <template v-if="b.branchName"> · {{ b.branchName }}</template>
          </p>
          <p class="mine__items">{{ summary(b) }}</p>
          <div class="mine__foot">
            <BookingBadges :status="b.status" :payment="b.paymentStatus" />
            <span class="mine__go">Ver seguimiento <AppIcon name="chevron-right" :size="16" /></span>
          </div>
          <p v-if="b.balance > 0 && b.status !== 'cancelled'" class="mine__balance">
            Saldo por pagar: <span class="money">{{ money(b.balance) }}</span>
          </p>
        </RouterLink>
      </li>
    </ul>

    <button v-if="page < pages" type="button" class="btn btn--ghost btn--block" :disabled="loading" @click="load(true)">
      {{ loading ? 'Cargando…' : 'Ver más pedidos' }}
    </button>
  </section>
</template>

<style scoped lang="scss">
.mine {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__head {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;

    h2 {
      font-size: $text-lg;
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__skeleton {
    height: 132px;
    border-radius: $radius-md;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: inherit;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      border-color: $navy;
      box-shadow: $shadow-sm;
    }
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }

  &__code {
    letter-spacing: 0.05em;
    color: $navy;
  }

  &__total {
    font-weight: 800;
  }

  &__when {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
    font-size: $text-sm;
    color: $ink-soft;
    text-transform: capitalize;
  }

  &__items {
    font-size: $text-sm;
    color: $ink-muted;
    @include truncate;
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  &__go {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
  }

  &__balance {
    font-size: $text-xs;
    font-weight: 700;
    color: $warning;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
    color: $ink-soft;

    svg {
      color: $ink-muted;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    color: $danger;
    font-weight: 600;
    font-size: $text-sm;
  }
}
</style>
