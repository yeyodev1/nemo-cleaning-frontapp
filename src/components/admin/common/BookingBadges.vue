<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'
import WaTag from './WaTag.vue'
import { bookingStatus, paymentStatus } from '@/config/labels'
import type { BookingStatus, PaymentStatus } from '@/types/api'

// `settled`: "Plan mensual" / "Canje" / "Cortesía" reemplaza al estado de pago (no es deuda).
// `source: 'whatsapp'` agrega la marca de WhatsApp.
defineProps<{ status?: BookingStatus; payment?: PaymentStatus; settled?: string; source?: string }>()
</script>

<template>
  <span class="badges">
    <WaTag v-if="source === 'whatsapp'" />
    <StatusBadge v-if="status" dot :tone="bookingStatus[status].tone" :label="bookingStatus[status].label" />
    <StatusBadge v-if="settled" tone="success" :label="settled" />
    <StatusBadge v-else-if="payment" :tone="paymentStatus[payment].tone" :label="paymentStatus[payment].label" />
  </span>
</template>

<style scoped lang="scss">
.badges {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
</style>
