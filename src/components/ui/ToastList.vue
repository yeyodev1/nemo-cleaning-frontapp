<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import AppIcon from './AppIcon.vue'

const toast = useToastStore()
const iconOf = { success: 'check-circle', error: 'alert', info: 'info' } as const
</script>

<template>
  <div class="toasts" aria-live="polite" role="status">
    <TransitionGroup name="toast">
      <button
        v-for="t in toast.toasts"
        :key="t.id"
        type="button"
        class="toast"
        :class="`toast--${t.type}`"
        @click="toast.dismiss(t.id)"
      >
        <AppIcon :name="iconOf[t.type]" :size="20" />
        <span>{{ t.message }}</span>
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.toasts {
  position: fixed;
  z-index: 200;
  top: calc(0.75rem + env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  width: min(440px, calc(100% - 2rem));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  border-radius: $radius-md;
  background: $navy-ink;
  color: #fff;
  font-size: $text-sm;
  font-weight: 600;
  text-align: left;
  box-shadow: $shadow-lg;

  &--success svg {
    color: $orange;
  }

  &--error {
    background: #7d1d29;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity $dur $ease-out,
    transform $dur $ease-out;
}

// Los que quedan se reacomodan con suavidad cuando uno se va.
.toast-move {
  transition: transform $dur $ease-out;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}
</style>
