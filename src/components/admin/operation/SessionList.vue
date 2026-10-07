<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { paymentConfirmation } from '@/config/operationLabels'
import { money } from '@/utils/format'
import type { Booking } from '@/types/api'

/** Lo registrado en esta sesión: confirma de un vistazo que cada fila quedó guardada. */
const props = defineProps<{ items: Booking[] }>()
const sum = computed(() => props.items.reduce((s, b) => s + b.total, 0))
</script>

<template>
  <section v-if="items.length" class="sl" aria-live="polite">
    <header class="sl__head">
      <h2>Registrados ahora</h2>
      <span>{{ items.length }} · <strong class="money">{{ money(sum) }}</strong></span>
    </header>
    <TransitionGroup name="fade-up" tag="ul" class="sl__list">
      <li v-for="b in items" :key="b._id" class="sl__item">
        <RouterLink :to="`/admin/pedidos/${b._id}`" class="sl__link">
          <span class="sl__main">
            <strong>{{ b.customer?.name }}</strong>
            <small>{{ b.code }} · {{ b.operators.map((o) => o.name).join(', ') }}<template v-if="b.zone"> · {{ b.zone }}</template></small>
          </span>
          <span class="sl__end">
            <strong class="money">{{ money(b.total) }}</strong>
            <StatusBadge
              v-if="b.paymentConfirmation"
              :tone="paymentConfirmation[b.paymentConfirmation].tone"
              :label="paymentConfirmation[b.paymentConfirmation].label"
            />
          </span>
        </RouterLink>
      </li>
    </TransitionGroup>
  </section>
</template>

<style scoped lang="scss">
.sl {
  @include card(1rem);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.6rem;
    font-size: $text-sm;

    h2 {
      font-size: $text-base;
      color: $navy;
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  &__item + &__item {
    border-top: 1px solid $line;
  }

  &__link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.2rem;
    min-height: $tap;
    color: inherit;
    text-decoration: none;
  }

  &__main {
    display: flex;
    flex-direction: column;
    min-width: 0;

    small {
      color: $ink-muted;
      font-size: $text-xs;
      @include truncate;
    }
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.2rem;
    flex-shrink: 0;
  }
}
</style>
