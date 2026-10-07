<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import { paymentMethod } from '@/config/labels'
import { useAdminScope } from '@/stores/adminScope'
import { longDate, mapsUrl, money, whatsappUrl, settledLabel } from '@/utils/format'
import type { BookingDetail } from '@/types/api'

const props = defineProps<{ booking: BookingDetail }>()
const scope = useAdminScope()
const branch = () => (typeof props.booking.branch === 'string' ? scope.branchName(props.booking.branch) : props.booking.branch?.name)
</script>

<template>
  <header class="dh card">
    <div class="dh__top">
      <div>
        <p class="dh__code">{{ booking.code }} <span v-if="booking.source === 'web'" class="badge badge--aqua">Web</span><span v-else-if="booking.source === 'import'" class="badge">Histórico</span></p>
        <h2 class="dh__when">{{ longDate(booking.date) }} · {{ booking.time }}</h2>
        <p class="muted dh__branch"><AppIcon name="store" :size="14" /> {{ branch() }} · {{ booking.durationMinutes }} min</p>
      </div>
      <BookingBadges :status="booking.status" :payment="booking.paymentStatus" :settled="settledLabel(booking)" :source="booking.source" />
    </div>

    <div class="dh__money">
      <div><small>Total</small><strong class="money">{{ money(booking.total) }}</strong></div>
      <div><small>Pagado</small><strong class="money">{{ money(booking.amountPaid) }}</strong></div>
      <div v-if="settledLabel(booking)"><small>Saldo</small><strong>{{ settledLabel(booking) }}</strong></div>
      <div v-else :class="{ 'is-due': booking.balance > 0 }"><small>Saldo</small><strong class="money">{{ money(booking.balance) }}</strong></div>
      <div><small>Método</small><strong>{{ paymentMethod[booking.paymentMethod] }}</strong></div>
    </div>

    <div class="dh__customer">
      <div class="dh__who">
        <strong>{{ booking.customer?.name }}</strong>
        <span class="muted">{{ booking.customer?.phone }}<template v-if="booking.customer?.email"> · {{ booking.customer.email }}</template></span>
        <span class="dh__addr"><AppIcon name="pin" :size="14" /> {{ booking.address }}<template v-if="booking.reference"> · {{ booking.reference }}</template></span>
      </div>
      <div class="dh__links">
        <a v-if="booking.customer?.phone" :href="`tel:${booking.customer.phone}`" class="btn btn--ghost btn--sm"><AppIcon name="phone" /> Llamar</a>
        <a v-if="booking.customer?.phone" :href="whatsappUrl(booking.customer.phone, `Hola ${booking.customer.name}, te escribimos de Nemo Cleaning por tu pedido ${booking.code}.`)" target="_blank" rel="noopener" class="btn btn--ghost btn--sm"><AppIcon name="whatsapp" /> WhatsApp</a>
        <a :href="mapsUrl(booking.address)" target="_blank" rel="noopener" class="btn btn--ghost btn--sm"><AppIcon name="pin" /> Mapa</a>
        <RouterLink v-if="booking.customer?._id" :to="`/admin/clientes/${booking.customer._id}`" class="btn btn--ghost btn--sm"><AppIcon name="user" /> Ficha</RouterLink>
      </div>
    </div>

    <p v-if="booking.notes" class="dh__notes"><AppIcon name="info" :size="16" /> {{ booking.notes }}</p>

    <div v-if="booking.invoice?.required" class="dh__invoice">
      <strong>Factura</strong>
      <span>{{ booking.invoice.name }} · {{ booking.invoice.documentId }}</span>
      <span class="muted">{{ booking.invoice.email }} · {{ booking.invoice.address }}</span>
    </div>
  </header>
</template>

<style scoped lang="scss">
.dh {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__top {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__code {
    font-size: $text-xs;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: $ink-muted;
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }

  &__when {
    font-size: $text-lg;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  &__branch {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: $text-sm;
  }

  &__money {
    @include flex-cards(110px, 0.5rem);

    > div {
      display: flex;
      flex-direction: column;
      padding: 0.6rem 0.75rem;
      border-radius: $radius-sm;
      background: $sky;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
      font-weight: 700;
    }

    strong {
      font-size: $text-base;
    }

    .is-due {
      background: $warning-bg;
      color: $warning;
    }
  }

  &__customer {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__who {
    display: flex;
    flex-direction: column;
    font-size: $text-sm;
  }

  &__addr {
    display: flex;
    gap: 0.3rem;
    align-items: flex-start;
    margin-top: 0.2rem;

    svg {
      margin-top: 0.2rem;
    }
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__notes {
    display: flex;
    gap: 0.5rem;
    padding: 0.7rem 0.85rem;
    border-radius: $radius-sm;
    background: $warning-bg;
    font-size: $text-sm;
  }

  &__invoice {
    display: flex;
    flex-direction: column;
    font-size: $text-sm;
    padding-top: 0.75rem;
    border-top: 1px dashed $line;
  }
}
</style>
