<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAdminNav } from './useAdminNav'

const emit = defineEmits<{ more: [] }>()
const { tabs, isActive } = useAdminNav()
</script>

<template>
  <nav class="tabs" aria-label="Navegación principal">
    <RouterLink
      v-for="t in tabs"
      :key="t.to"
      :to="t.to"
      class="tabs__item"
      :class="{ 'is-active': isActive(t.to) }"
      :aria-current="isActive(t.to) ? 'page' : undefined"
    >
      <AppIcon :name="t.icon" :size="22" />
      <span>{{ t.label }}</span>
    </RouterLink>
    <button type="button" class="tabs__item" @click="emit('more')">
      <AppIcon name="menu" :size="22" />
      <span>Más</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.tabs {
  position: fixed;
  inset: auto 0 0;
  z-index: 40;
  display: flex;
  background: rgba(#fff, 0.97);
  backdrop-filter: blur(12px);
  border-top: 1px solid $line;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -8px 24px rgba($navy-ink, 0.06);

  @include from('lg') {
    display: none;
  }

  &__item {
    flex: 1;
    min-height: 62px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 0.7rem;
    font-weight: 700;
    color: $ink-muted;
    position: relative;

    &.is-active {
      color: $navy;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        width: 28px;
        height: 3px;
        border-radius: 0 0 3px 3px;
        background: $aqua;
      }
    }
  }
}
</style>
