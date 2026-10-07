<script setup lang="ts">
import { itemLabel } from '@/utils/pricing'
import { ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import { bookingsService } from '@/services/bookings.service'
import { useToastStore } from '@/stores/toast'
import { bookingStatus, options, paymentMethod } from '@/config/labels'
import { errorMessage, longDate, mapsUrl, money, whatsappUrl, settledLabel } from '@/utils/format'
import type { Booking, BookingStatus } from '@/types/api'

const props = defineProps<{ booking: Booking | null }>()
const emit = defineEmits<{ close: []; updated: [b: Booking] }>()
const toast = useToastStore()
const status = ref<BookingStatus>('pending')
const busy = ref(false)
const statuses = options(bookingStatus)

watch(() => props.booking, (b) => b && (status.value = b.status), { immediate: true })

async function save() {
  if (!props.booking || status.value === props.booking.status) return
  busy.value = true
  try {
    const b = await bookingsService.setStatus(props.booking._id, status.value)
    emit('updated', b)
    toast.success('Estado actualizado')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <BaseSheet :open="Boolean(booking)" side :title="booking ? `${booking.code} · ${booking.time}` : ''" @close="emit('close')">
    <div v-if="booking" class="quick">
      <BookingBadges :status="booking.status" :payment="booking.paymentStatus" :settled="settledLabel(booking)" :source="booking.source" />
      <p class="quick__when">{{ longDate(booking.date) }}, {{ booking.time }}</p>

      <div class="quick__block">
        <strong>{{ booking.customer?.name }}</strong>
        <div class="quick__links">
          <a v-if="booking.customer?.phone" :href="`tel:${booking.customer.phone}`" class="btn btn--ghost btn--sm"><AppIcon name="phone" /> Llamar</a>
          <a v-if="booking.customer?.phone" :href="whatsappUrl(booking.customer.phone)" target="_blank" rel="noopener" class="btn btn--ghost btn--sm"><AppIcon name="whatsapp" /> WhatsApp</a>
          <a :href="mapsUrl(booking.address)" target="_blank" rel="noopener" class="btn btn--ghost btn--sm"><AppIcon name="pin" /> Mapa</a>
        </div>
        <p class="muted">{{ booking.address }}<template v-if="booking.reference"> · {{ booking.reference }}</template></p>
      </div>

      <ul class="quick__items">
        <li v-for="(i, n) in booking.items" :key="n"><span>{{ itemLabel(i) }}</span><span class="money">{{ money(i.subtotal) }}</span></li>
        <li class="quick__total"><span>Total · {{ paymentMethod[booking.paymentMethod] }}</span><span class="money">{{ money(booking.total) }}</span></li>
      </ul>
      <p v-if="booking.notes" class="quick__notes">{{ booking.notes }}</p>

      <label class="field">
        <span class="field__label">Cambiar estado</span>
        <select v-model="status">
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </label>
    </div>
    <template #footer>
      <RouterLink v-if="booking" :to="`/admin/pedidos/${booking._id}`" class="btn btn--ghost">Ver detalle</RouterLink>
      <button type="button" class="btn btn--primary" :disabled="busy || status === booking?.status" @click="save">Guardar estado</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.quick {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__when {
    font-weight: 700;
    margin-top: -0.4rem;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: $text-sm;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__items {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: $text-sm;

    li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
  }

  &__total {
    padding-top: 0.5rem;
    border-top: 1px dashed $line;
    font-weight: 800;
  }

  &__notes {
    padding: 0.7rem 0.85rem;
    border-radius: $radius-sm;
    background: $warning-bg;
    font-size: $text-sm;
  }
}
</style>
