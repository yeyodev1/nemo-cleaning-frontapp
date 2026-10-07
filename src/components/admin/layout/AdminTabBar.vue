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
      <span class="tabs__icon" :class="{ 'tabs__icon--cta': t.to === '/admin/produccion/registrar' }">
        <AppIcon :name="t.icon" :size="22" />
      </span>
      <span>{{ t.short || t.label }}</span>
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

  // "Registrar servicio": la acción más usada, resaltada en naranja (a un toque).
  &__icon--cta {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $orange;
    color: $navy-ink;
    transition: transform $dur-fast $ease-out;
  }

  &__item:active &__icon--cta {
    transform: scale(0.92);
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

      .tabs__icon--cta {
        box-shadow: 0 0 0 3px rgba($orange, 0.35);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        width: 28px;
        height: 3px;
        border-radius: 0 0 3px 3px;
        background: $orange;
      }
    }
  }
}
</style>
