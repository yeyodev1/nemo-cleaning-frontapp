<script setup lang="ts">
import { computed } from 'vue'

/** Fila con barra horizontal proporcional al máximo del grupo. */
const props = defineProps<{ label: string; value: number; max: number; display: string; sub?: string; tone?: 'navy' | 'aqua' | 'danger' }>()
const pct = computed(() => (props.max > 0 ? Math.max(2, Math.round((props.value / props.max) * 100)) : 0))
</script>

<template>
  <div class="hbar">
    <div class="hbar__top">
      <span class="hbar__label">{{ label }}<small v-if="sub"> · {{ sub }}</small></span>
      <strong class="money">{{ display }}</strong>
    </div>
    <div class="hbar__track"><span class="hbar__fill" :class="tone ? `hbar__fill--${tone}` : ''" :style="{ width: `${pct}%` }"></span></div>
  </div>
</template>

<style scoped lang="scss">
.hbar {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &__top {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: $text-sm;
  }

  &__label {
    min-width: 0;
    @include truncate;
    font-weight: 600;

    small {
      color: $ink-muted;
      font-weight: 500;
    }
  }

  &__track {
    height: 8px;
    border-radius: $radius-pill;
    background: $sky-2;
    overflow: hidden;
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: $navy;
    transition: width 0.5s $ease;

    &--aqua {
      background: $orange;
    }
    &--danger {
      background: $danger;
    }
  }
}
</style>
