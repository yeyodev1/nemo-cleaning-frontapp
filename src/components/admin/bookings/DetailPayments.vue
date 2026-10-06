<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { paymentMethod, paymentRecordStatus } from '@/config/labels'
import { dateTime, money } from '@/utils/format'
import type { BookingDetail } from '@/types/api'

defineProps<{ booking: BookingDetail; saving: boolean }>()
const emit = defineEmits<{ add: []; review: [id: string, approved: boolean] }>()
const isPdf = (url?: string) => /\.pdf($|\?)/i.test(url || '')
</script>

<template>
  <section class="card pays">
    <div class="pays__head">
      <h3>Pagos</h3>
      <button type="button" class="btn btn--soft btn--sm" @click="emit('add')"><AppIcon name="plus" :size="16" /> Registrar pago</button>
    </div>

    <div v-if="booking.transferProofUrl" class="pays__proof">
      <strong>Comprobante de transferencia</strong>
      <a :href="booking.transferProofUrl" target="_blank" rel="noopener" class="pays__thumb">
        <img v-if="!isPdf(booking.transferProofUrl)" :src="booking.transferProofUrl" alt="Comprobante de transferencia" loading="lazy" />
        <span v-else><AppIcon name="file" /> Abrir PDF</span>
      </a>
    </div>

    <ul v-if="booking.payments?.length" class="pays__list">
      <li v-for="p in booking.payments" :key="p._id" class="pays__item">
        <div class="pays__row">
          <strong class="money">{{ money(p.amount) }}</strong>
          <StatusBadge :tone="paymentRecordStatus[p.status].tone" :label="paymentRecordStatus[p.status].label" />
        </div>
        <span class="muted pays__meta">
          {{ paymentMethod[p.method] }}<template v-if="p.provider === 'payphone'"> · Payphone</template> · {{ dateTime(p.createdAt) }}
          <template v-if="p.reference"> · Ref. {{ p.reference }}</template>
          <template v-if="p.registeredBy?.name"> · {{ p.registeredBy.name }}</template>
        </span>
        <span v-if="p.note" class="pays__note">{{ p.note }}</span>
        <a v-if="p.proofUrl" :href="p.proofUrl" target="_blank" rel="noopener" class="pays__link"><AppIcon name="eye" :size="16" /> Ver comprobante</a>
        <div v-if="p.status === 'review'" class="pays__review">
          <button type="button" class="btn btn--danger btn--sm" :disabled="saving" @click="emit('review', p._id, false)">Rechazar</button>
          <button type="button" class="btn btn--primary btn--sm" :disabled="saving" @click="emit('review', p._id, true)">Aprobar</button>
        </div>
      </li>
    </ul>
    <p v-else class="muted pays__empty">Sin pagos registrados.</p>
  </section>
</template>

<style scoped lang="scss">
.pays {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: $text-base;
    }
  }

  &__proof {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: $text-sm;
  }

  &__thumb {
    align-self: flex-start;
    border-radius: $radius-sm;
    border: 1px solid $line;
    overflow: hidden;

    img {
      max-height: 220px;
      width: auto;
    }

    span {
      display: inline-flex;
      gap: 0.4rem;
      padding: 0.7rem 1rem;
      font-weight: 700;
      color: $navy;
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.75rem;
    border-radius: $radius-sm;
    background: $sky;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__meta,
  &__note {
    font-size: $text-xs;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: $text-xs;
    font-weight: 700;
    color: $navy;
    min-height: 32px;
  }

  &__review {
    display: flex;
    gap: 0.4rem;
    justify-content: flex-end;
  }

  &__empty {
    font-size: $text-sm;
  }
}
</style>
