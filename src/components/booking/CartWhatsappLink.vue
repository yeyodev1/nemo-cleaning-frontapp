<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { draft } from '@/composables/booking/useBookingDraft'
import { cartWhatsapp } from '@/composables/booking/whatsappOrder'

/** Atajo discreto: manda el carrito actual por WhatsApp sin crear el pedido. */
defineProps<{ compact?: boolean }>()
const href = computed(
  () => cartWhatsapp({ cart: draft.cart, branch: draft.branch, date: draft.date, time: draft.time }).url,
)
</script>

<template>
  <a :href="href" target="_blank" rel="noopener" class="cwa" :class="{ 'cwa--compact': compact }">
    <AppIcon name="whatsapp" :size="compact ? 13 : 15" />
    <span>¿Prefieres pedir por WhatsApp?</span>
  </a>
</template>

<style scoped lang="scss">
.cwa {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: center;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-muted;
  text-decoration: underline;
  text-decoration-color: rgba($whatsapp-ink, 0.35);
  text-underline-offset: 3px;
  transition: color $dur-fast ease;

  svg {
    color: $whatsapp-ink;
  }

  &:hover {
    color: $whatsapp-ink;
  }

  // En la barra inferior: una línea pequeña bajo el total, con área táctil cómoda.
  &--compact {
    align-self: flex-start;
    font-size: 0.68rem;
    padding: 0.3rem 0;
    margin: -0.2rem 0 -0.3rem;
  }
}
</style>
