<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import CartWhatsappLink from './CartWhatsappLink.vue'
import { useQuote } from '@/composables/booking/useQuote'
import { money } from '@/utils/format'

/** Barra fija inferior (móvil): cantidad, total en vivo y acción principal. */
defineProps<{ label: string; disabled?: boolean; busy?: boolean }>()
const emit = defineEmits<{ next: [] }>()
const { total, count, calculating } = useQuote()
</script>

<template>
  <div class="bar">
    <!-- El resumen aparece al agregar el primer servicio; el total "rebota" cada vez que cambia. -->
    <Transition name="fade-up" mode="out-in">
      <div v-if="count > 0" key="info" class="bar__info" aria-live="polite">
        <span class="bar__count">{{ count }} {{ count === 1 ? 'servicio' : 'servicios' }}</span>
        <strong :key="total" class="bar__total money bump">{{ money(total) }}</strong>
        <span v-if="calculating" class="bar__calc">calculando…</span>
        <CartWhatsappLink v-else compact />
      </div>
      <p v-else key="empty" class="bar__empty">Arma tu pedido</p>
    </Transition>
    <button
      type="button"
      class="btn btn--primary btn--lg bar__btn"
      :disabled="disabled || busy"
      @click="emit('next')"
    >
      {{ busy ? 'Enviando…' : label }} <AppIcon v-if="!busy" name="arrow-right" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.bar__empty {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink-muted;
}

.bar {
  position: fixed;
  inset: auto 0 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
  background: rgba(#fff, 0.97);
  backdrop-filter: blur(12px);
  border-top: 1px solid $line;
  box-shadow: 0 -10px 30px rgba($navy-ink, 0.08);

  @include from('lg') {
    display: none;
  }

  &__info {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
    min-width: 0;
  }

  &__count {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
  }

  &__total {
    font-size: $text-xl;
    color: $navy;
  }

  &__calc {
    font-size: 0.68rem;
    color: $ink-muted;
  }

  &__btn {
    flex-shrink: 0;
  }
}
</style>
