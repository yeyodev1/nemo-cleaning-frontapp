<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { paymentMethod, paymentStatus } from '@/config/labels'
import { money } from '@/utils/format'
import type { Booking } from '@/types/api'

defineProps<{ booking: Booking }>()
</script>

<template>
  <section class="items card" aria-labelledby="items-title">
    <h2 id="items-title" class="items__title">Detalle</h2>
    <ul class="items__list">
      <li v-for="i in booking.items" :key="i.service + i.name">
        <span>{{ i.quantity }} × {{ i.name }}</span>
        <span class="money">{{ money(i.subtotal) }}</span>
      </li>
    </ul>
    <dl class="items__totals">
      <div v-if="booking.discount">
        <dt>Descuento</dt>
        <dd class="money">− {{ money(booking.discount) }}</dd>
      </div>
      <div class="items__total">
        <dt>Total</dt>
        <dd class="money">{{ money(booking.total) }}</dd>
      </div>
      <div v-if="booking.amountPaid">
        <dt>Pagado</dt>
        <dd class="money">{{ money(booking.amountPaid) }}</dd>
      </div>
      <div v-if="booking.balance > 0">
        <dt>Saldo pendiente</dt>
        <dd class="money">{{ money(booking.balance) }}</dd>
      </div>
    </dl>
    <p class="items__pay">
      {{ paymentMethod[booking.paymentMethod] }}
      <StatusBadge
        :tone="paymentStatus[booking.paymentStatus].tone"
        :label="paymentStatus[booking.paymentStatus].label"
      />
    </p>
  </section>
</template>

<style scoped lang="scss">
.items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__title {
    font-size: $text-lg;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: $text-sm;

    li {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }
  }

  &__totals {
    border-top: 1px dashed $line;
    padding-top: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: $text-sm;

    div {
      display: flex;
      justify-content: space-between;
    }
  }

  &__total {
    font-weight: 800;
    font-size: $text-lg;
    color: $navy;
  }

  &__pay {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: $text-sm;
    font-weight: 700;
  }
}
</style>
