<script setup lang="ts">
import { computed } from 'vue'

/**
 * Logo oficial ACTUAL de Nemo (identidad de Instagram: círculo celeste, destellos y arco naranja),
 * vector de `recursos/logo/` servido desde `public/brand/`. Nunca se redibuja ni recolorea:
 * solo se elige la variante según el fondo.
 * - `dark`: "nemo" blanco → fondos azul marino / oscuros (uso principal)
 * - `light`: "nemo" azul marino → fondos blancos / claros
 */
const props = withDefaults(defineProps<{ variant?: 'dark' | 'light'; height?: number }>(), {
  variant: 'dark',
  height: 44,
})

// Proporción del viewBox del logo (1800 × 1652).
const width = computed(() => Math.round((props.height * 1800) / 1652))
const src = computed(() => `/brand/nemo-logo-sobre-${props.variant === 'dark' ? 'oscuro' : 'claro'}.svg`)
</script>

<template>
  <img class="nemo-logo" :src="src" :width="width" :height="height" alt="Nemo Cleaning Services" decoding="async" />
</template>

<style scoped lang="scss">
.nemo-logo {
  display: block;
  height: auto;
  max-width: none;
  flex-shrink: 0;
}
</style>
