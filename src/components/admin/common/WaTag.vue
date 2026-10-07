<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

/** Marca de pedido que llegó o terminó por WhatsApp (listas, agenda y Base). */
defineProps<{ compact?: boolean }>()
</script>

<template>
  <span class="wa-tag" :class="{ 'wa-tag--compact': compact }" title="Pedido por WhatsApp">
    <AppIcon name="whatsapp" :size="compact ? 12 : 13" />
    <span :class="{ 'sr-only': compact }">WhatsApp</span>
  </span>
</template>

<style scoped lang="scss">
.wa-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: $radius-pill;
  background: $whatsapp-soft;
  color: $whatsapp-ink;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  vertical-align: middle;

  &--compact {
    padding: 0.2rem;
  }
}
</style>
