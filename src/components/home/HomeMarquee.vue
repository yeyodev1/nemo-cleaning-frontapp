<script setup lang="ts">
import { site } from '@/config/site'

/** Cinta en movimiento con lo que limpiamos (bio de Instagram) y el eslogan. Decorativa. */
const items = ['Autos', 'Muebles', 'Colchones', 'Oficinas', 'Alfombras', site.slogan]
</script>

<template>
  <div class="mq" role="presentation">
    <p class="sr-only">Autos, muebles, colchones, oficinas y alfombras.</p>
    <div class="mq__track" aria-hidden="true">
      <!-- Dos copias idénticas: al llegar al 50% el bucle es invisible. -->
      <ul v-for="n in 2" :key="n" class="mq__group">
        <li v-for="t in items" :key="t" :class="{ 'mq__slogan': t === site.slogan }">{{ t }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mq {
  overflow: hidden;
  background: $orange;
  color: $navy;
  border-block: 1px solid rgba($navy, 0.15);

  &__track {
    display: flex;
    width: max-content;
    animation: mq 38s linear infinite;
  }

  &__group {
    list-style: none;
    display: flex;
    flex-shrink: 0;

    li {
      display: flex;
      align-items: center;
      padding: 0.8rem 0;
      font-family: $font-display;
      font-size: clamp(1.15rem, 1rem + 0.8vw, 1.6rem);
      font-weight: 700;
      white-space: nowrap;

      &::after {
        content: '';
        width: 8px;
        height: 8px;
        margin-inline: 1.5rem;
        border-radius: 50%;
        background: $navy;
      }
    }
  }

  &__slogan {
    font-style: italic;
    font-weight: 600 !important;
  }

  @include reduced-motion {
    &__track {
      animation: none;
    }
  }
}

@keyframes mq {
  to {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
