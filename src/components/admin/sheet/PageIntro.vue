<script setup lang="ts">
import { useRoute } from 'vue-router'

/**
 * Acciones principales de la pantalla (visibles, no escondidas). La línea de "para qué sirve"
 * la pinta el layout desde `meta.purpose`; `text` queda solo para pantallas sin ella.
 */
defineProps<{ text?: string }>()
const route = useRoute()
</script>

<template>
  <div v-if="$slots.default || (text && !route.meta.purpose)" class="intro">
    <p v-if="text && !route.meta.purpose" class="intro__text">{{ text }}</p>
    <div v-if="$slots.default" class="intro__actions"><slot /></div>
  </div>
</template>

<style scoped lang="scss">
.intro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;

  &__text {
    flex: 1 1 280px;
    color: $ink-muted;
    font-size: $text-sm;
    max-width: 62ch;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    flex: 1 1 100%;

    > :deep(.btn) {
      flex: 1 1 auto;
    }

    @include from('md') {
      flex: 0 0 auto;

      > :deep(.btn) {
        flex: 0 0 auto;
      }
    }
  }
}
</style>
