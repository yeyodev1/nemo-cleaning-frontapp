<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'

/** Estado vacío que dice qué pasa y qué hacer (la acción va en el slot). */
defineProps<{ title: string; text?: string; icon?: IconName }>()
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon"><AppIcon :name="icon || 'inbox'" :size="26" /></span>
    <strong>{{ title }}</strong>
    <p v-if="text">{{ text }}</p>
    <div v-if="$slots.default" class="empty-state__action"><slot /></div>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  @include card(2rem 1.25rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.4rem;

  &__icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy-soft;
    color: $navy;
    margin-bottom: 0.4rem;
  }

  p {
    color: $ink-muted;
    font-size: $text-sm;
    max-width: 46ch;
  }

  &__action {
    margin-top: 0.6rem;
  }
}
</style>
