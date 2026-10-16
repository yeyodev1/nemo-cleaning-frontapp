<script setup lang="ts">
import BaseSheet from '@/components/ui/BaseSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAppUpdate } from '@/composables/app/useAppUpdate'

const { available, reload, dismiss } = useAppUpdate()
</script>

<template>
  <BaseSheet :open="available" title="Hay una actualización" @close="dismiss">
    <div class="update">
      <span class="update__icon"><AppIcon name="refresh" :size="28" /></span>
      <p>Publicamos una versión nueva de Nemo Cleaning con mejoras. Actualiza para usarla; lo que ya guardaste no se pierde.</p>
    </div>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="dismiss">Más tarde</button>
      <button type="button" class="btn btn--primary" @click="reload"><AppIcon name="refresh" /> Actualizar ahora</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.update {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  color: $ink-soft;

  &__icon {
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: $orange-soft;
    color: $orange-ink;
  }
}
</style>
