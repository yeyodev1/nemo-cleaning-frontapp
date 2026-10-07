<script setup lang="ts">
/** Título numerado de cada bloque del reporte ("1. Resumen de producción / ingresos"). */
defineProps<{ n?: number; title: string; text?: string }>()
</script>

<template>
  <header class="shead">
    <h2><span v-if="n" class="shead__n">{{ n }}</span>{{ title }}</h2>
    <p v-if="text">{{ text }}</p>
    <slot />
  </header>
</template>

<style scoped lang="scss">
.shead {
  margin: 1.6rem 0 0.6rem;

  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: $text-lg;
  }

  &__n {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    border-radius: 8px;
    background: $navy;
    color: #fff;
    font-size: $text-xs;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  p {
    color: $ink-muted;
    font-size: $text-sm;
    margin-top: 0.2rem;
  }
}
</style>
