<script setup lang="ts">
import { ref } from 'vue'

/**
 * Comparador ANTES / DESPUÉS con fotos reales del catálogo. Accesible: el control es un
 * <input type="range"> (teclado y lector de pantalla); arrastrar en táctil mueve el mismo valor.
 */
defineProps<{ before: string; after: string; title: string; ratio: string }>()
const pos = ref(50)
</script>

<template>
  <figure class="ba" :style="{ aspectRatio: ratio, '--pos': `${pos}%` }">
    <img class="ba__img" :src="after" :alt="`${title} después de la limpieza`" loading="lazy" />
    <img class="ba__img ba__img--before" :src="before" :alt="`${title} antes de la limpieza`" loading="lazy" />
    <span class="ba__tag ba__tag--before" aria-hidden="true">Antes</span>
    <span class="ba__tag ba__tag--after" aria-hidden="true">Después</span>
    <span class="ba__handle" aria-hidden="true"><span></span></span>
    <input
      v-model.number="pos"
      class="ba__range"
      type="range"
      min="0"
      max="100"
      step="1"
      :aria-label="`Comparar ${title}: antes y después`"
      :aria-valuetext="`${pos}% antes`"
    />
    <figcaption class="sr-only">{{ title }}: antes y después</figcaption>
  </figure>
</template>

<style scoped lang="scss">
.ba {
  position: relative;
  width: 100%;
  @include photo-frame($radius-lg);
  user-select: none;
  touch-action: pan-y;

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;

    &--before {
      clip-path: inset(0 calc(100% - var(--pos)) 0 0);
    }
  }

  &__tag {
    position: absolute;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    pointer-events: none;

    &--before {
      top: 0.6rem;
      left: 0.6rem;
      background: rgba($charcoal, 0.82);
      color: #fff;
    }

    // Abajo a la derecha: en las fotos verticales angostas no se pisa con "Antes".
    &--after {
      bottom: 0.6rem;
      right: 0.6rem;
      background: $orange;
      color: $navy;
    }
  }

  &__handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--pos);
    width: 3px;
    margin-left: -1.5px;
    background: #fff;
    pointer-events: none;
    box-shadow: 0 0 12px rgba(#000, 0.35);

    span {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 44px;
      height: 44px;
      margin: -22px 0 0 -22px;
      border-radius: 50%;
      background: #fff;
      border: 3px solid $orange;
      box-shadow: $shadow-md;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 0;
        height: 0;
        margin-top: -5px;
        border: 5px solid transparent;
      }

      &::before {
        left: 6px;
        border-right-color: $navy;
      }

      &::after {
        right: 6px;
        border-left-color: $navy;
      }
    }
  }

  &__range {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    opacity: 0;
    cursor: ew-resize;
    min-height: 0;

    &:focus-visible + * {
      outline: none;
    }
  }

  &:focus-within {
    outline: 3px solid $navy;
    outline-offset: 3px;
  }
}
</style>
