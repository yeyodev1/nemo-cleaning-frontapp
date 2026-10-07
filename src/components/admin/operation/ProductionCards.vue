<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { paymentConfirmation } from '@/config/operationLabels'
import { money, shortDate } from '@/utils/format'
import type { ProductionRow } from '@/types/operation'

/** La Base en el celular: una tarjeta por fila, lo importante a la vista. */
defineProps<{ items: ProductionRow[]; multiDay: boolean }>()
const emit = defineEmits<{ select: [row: ProductionRow] }>()
</script>

<template>
  <ul class="pc">
    <li v-for="r in items" :key="r._id">
      <button type="button" class="pc__card" @click="emit('select', r)">
        <span class="pc__top">
          <strong>{{ r.customer?.name || '—' }}</strong>
          <strong class="money">{{ money(r.total) }}</strong>
        </span>
        <span class="pc__meta">
          <template v-if="multiDay">{{ shortDate(r.date) }} · </template>{{ r.operators.map((o) => o.name).join(', ') }}<template v-if="r.zone"> · {{ r.zone }}</template>
        </span>
        <span class="pc__svc">{{ r.items.map((i) => (i.variant ? `${i.name} (${i.variant})` : i.name)).join(' + ') }}</span>
        <span class="pc__tags">
          <StatusBadge :tone="paymentConfirmation[r.paymentConfirmation].tone" :label="paymentConfirmation[r.paymentConfirmation].label" />
          <span class="pc__acc">{{ r.paymentAccount }}</span>
          <span v-if="r.tip" class="pc__acc">Propina {{ money(r.tip) }}</span>
          <span v-if="r.novedades" class="pc__nov"><AppIcon name="alert" :size="13" /> {{ r.novedades }}</span>
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.pc {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__card {
    @include card(0.8rem 0.9rem);
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    text-align: left;

    &:active {
      border-color: $navy;
    }
  }

  &__top {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__meta,
  &__svc {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__svc {
    color: $ink-soft;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.15rem;
  }

  &__acc {
    font-size: $text-xs;
    color: $ink-soft;
  }

  &__nov {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    font-size: $text-xs;
    font-weight: 700;
    color: $warning;
  }
}
</style>
