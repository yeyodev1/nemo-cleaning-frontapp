<script setup lang="ts">
import { itemLabel } from '@/utils/pricing'
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import { money, shortDate, settledLabel } from '@/utils/format'
import { useAdminScope } from '@/stores/adminScope'
import type { Booking } from '@/types/api'

defineProps<{ booking: Booking }>()
const scope = useAdminScope()

function branchName(b: Booking) {
  return typeof b.branch === 'string' ? scope.branchName(b.branch) : b.branch?.name || ''
}
</script>

<template>
  <RouterLink :to="`/admin/pedidos/${booking._id}`" class="row">
    <span class="row__when">
      <strong>{{ booking.time }}</strong>
      <small>{{ shortDate(booking.date) }}</small>
    </span>
    <span class="row__main">
      <span class="row__top">
        <strong class="row__name">{{ booking.customer?.name || 'Cliente' }}</strong>
        <span class="row__code">{{ booking.code }}</span>
      </span>
      <span class="row__items">{{ booking.items.map(itemLabel).join(', ') }}</span>
      <span class="row__meta">
        <BookingBadges :status="booking.status" :payment="booking.paymentStatus" :settled="settledLabel(booking)" />
        <span v-if="branchName(booking)" class="row__branch"><AppIcon name="store" :size="14" /> {{ branchName(booking) }}</span>
        <span v-for="o in booking.operators" :key="o._id" class="row__op">
          <span class="row__dot" :style="{ background: o.color || '#1E2D3A' }"></span>{{ o.name }}
        </span>
      </span>
    </span>
    <span class="row__money">
      <strong class="money">{{ money(booking.total) }}</strong>
      <small v-if="booking.balance > 0 && !settledLabel(booking)" class="money">Saldo {{ money(booking.balance) }}</small>
    </span>
  </RouterLink>
</template>

<style scoped lang="scss">
.row {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.9rem;
  background: $surface;
  border: 1px solid $line;
  border-radius: $radius-md;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: $line-strong;
    box-shadow: $shadow-sm;
  }

  &__when {
    display: flex;
    flex-direction: column;
    min-width: 54px;
    line-height: 1.25;

    strong {
      font-size: $text-base;
      color: $navy;
      font-variant-numeric: tabular-nums;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  &__top {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__name {
    font-size: $text-sm;
  }

  &__code {
    font-size: $text-xs;
    color: $ink-muted;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  &__items {
    font-size: $text-xs;
    color: $ink-soft;
    @include truncate;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem 0.7rem;
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__branch,
  &__op {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 600;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &__money {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.3;

    strong {
      font-size: $text-sm;
    }

    small {
      font-size: $text-xs;
      color: $warning;
      font-weight: 700;
    }
  }
}
</style>
