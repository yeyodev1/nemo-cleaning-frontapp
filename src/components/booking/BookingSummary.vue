<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCatalogStore } from '@/stores/catalog'
import { draft } from '@/composables/booking/useBookingDraft'
import { useQuote } from '@/composables/booking/useQuote'
import { cartItems } from '@/composables/booking/cart'
import { money, shortDate } from '@/utils/format'

/** Resumen lateral (escritorio) del pedido en curso. El botón lo pone el padre por slot. */
const catalog = useCatalogStore()
const { total, calculating, failed, server } = useQuote()

const lines = computed(() => {
  if (server.value && !calculating.value) return server.value.items
  return cartItems(draft.cart).map((i) => {
    const s = catalog.byId(i.service)
    const unitPrice = s?.price || 0
    return {
      service: i.service,
      name: s?.name || 'Servicio',
      unitPrice,
      quantity: i.quantity,
      subtotal: unitPrice * i.quantity,
    }
  })
})
const branch = computed(() => catalog.branchById(draft.branch))
</script>

<template>
  <aside class="summary" aria-label="Resumen del pedido">
    <h2 class="summary__title">Tu pedido</h2>
    <p v-if="branch" class="summary__meta"><AppIcon name="pin" :size="16" /> {{ branch.name }}</p>
    <p v-if="draft.date" class="summary__meta">
      <AppIcon name="calendar" :size="16" /> {{ shortDate(draft.date)
      }}<template v-if="draft.time"> · {{ draft.time }}</template>
    </p>

    <ul v-if="lines.length" class="summary__lines">
      <li v-for="l in lines" :key="l.service">
        <span>{{ l.quantity }} × {{ l.name }}</span>
        <span class="money">{{ money(l.subtotal) }}</span>
      </li>
    </ul>
    <p v-else class="summary__empty">Aún no agregas servicios.</p>

    <div class="summary__total" aria-live="polite">
      <span>Total</span>
      <strong class="money">{{ money(total) }}</strong>
    </div>
    <p v-if="calculating" class="summary__hint">Calculando…</p>
    <p v-else-if="failed" class="summary__hint">Total estimado; lo confirmamos al reservar.</p>
    <slot />
  </aside>
</template>

<style scoped lang="scss">
.summary {
  @include card(1.25rem);
  box-shadow: $shadow-md;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__title {
    font-size: $text-lg;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: $text-sm;
    color: $ink-soft;
    text-transform: capitalize;

    svg {
      color: $aqua-ink;
    }
  }

  &__lines {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding: 0.75rem 0;
    border-top: 1px dashed $line;
    border-bottom: 1px dashed $line;
    font-size: $text-sm;

    li {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }
  }

  &__empty {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-weight: 700;

    strong {
      font-size: $text-xl;
      color: $navy;
    }
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
