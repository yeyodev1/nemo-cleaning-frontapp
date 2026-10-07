<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'

defineProps<{ label: string; value: string | number; icon?: IconName; hint?: string; tone?: 'navy' | 'aqua' | 'warning' | 'danger' | 'success' }>()
</script>

<template>
  <article class="kpi" :class="tone ? `kpi--${tone}` : ''">
    <span v-if="icon" class="kpi__icon"><AppIcon :name="icon" :size="20" /></span>
    <span class="kpi__label">{{ label }}</span>
    <strong class="kpi__value">{{ value }}</strong>
    <span v-if="hint" class="kpi__hint">{{ hint }}</span>
  </article>
</template>

<style scoped lang="scss">
.kpi {
  @include card(1rem);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  position: relative;

  &__icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy-soft;
    color: $navy;
    margin-bottom: 0.4rem;
  }

  &--aqua &__icon {
    background: $orange-soft;
    color: $orange-ink;
  }
  &--warning &__icon {
    background: $warning-bg;
    color: $warning;
  }
  &--danger &__icon {
    background: $danger-bg;
    color: $danger;
  }
  &--success &__icon {
    background: $success-bg;
    color: $success;
  }

  &__label {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__value {
    font-size: $text-xl;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
