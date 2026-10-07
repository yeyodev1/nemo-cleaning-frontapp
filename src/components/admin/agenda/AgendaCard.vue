<script setup lang="ts">
import { settledLabel } from '@/utils/format'
import { itemLabel } from '@/utils/pricing'
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import type { Booking } from '@/types/api'

const props = defineProps<{ booking: Booking; showTime?: boolean }>()
defineEmits<{ open: [b: Booking] }>()
const color = computed(() => props.booking.operators[0]?.color || '#C8CDD4')
</script>

<template>
  <button type="button" class="acard" :style="{ '--op': color }" @click="$emit('open', booking)">
    <span class="acard__top">
      <strong v-if="showTime" class="acard__time">{{ booking.time }}</strong>
      <span class="acard__name">{{ booking.customer?.name }}</span>
    </span>
    <span class="acard__items">{{ booking.items.map(itemLabel).join(', ') }}</span>
    <span class="acard__addr"><AppIcon name="pin" :size="14" /> {{ booking.address }}</span>
    <span class="acard__foot">
      <BookingBadges :status="booking.status" :payment="booking.paymentStatus" :settled="settledLabel(booking)" :source="booking.source" />
      <span v-if="booking.operators.length" class="acard__ops">{{ booking.operators.map((o) => o.name).join(', ') }}</span>
    </span>
  </button>
</template>

<style scoped lang="scss">
.acard {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.75rem 0.85rem 0.75rem 1rem;
  border-radius: $radius-sm;
  background: $surface;
  border: 1px solid $line;
  border-left: 4px solid var(--op);
  box-shadow: $shadow-sm;
  transition: transform 0.15s $ease, box-shadow 0.2s;

  &:hover {
    box-shadow: $shadow-md;
  }

  &:active {
    transform: scale(0.99);
  }

  &__top {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
  }

  &__time {
    color: $navy;
    font-variant-numeric: tabular-nums;
  }

  &__name {
    font-weight: 700;
    font-size: $text-sm;
    @include truncate;
  }

  &__items,
  &__addr {
    font-size: $text-xs;
    color: $ink-soft;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
  }

  &__addr {
    color: $ink-muted;
  }

  &__foot {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.6rem;
    align-items: center;
    margin-top: 0.15rem;
  }

  &__ops {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
  }
}
</style>
