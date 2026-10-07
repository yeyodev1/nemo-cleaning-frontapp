<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import LinePanel from './LinePanel.vue'
import { lines } from '@/config/landing'
import { useCarousel } from '@/composables/home/useCarousel'

const track = ref<HTMLElement | null>(null)
const { canPrev, canNext, go } = useCarousel(track)
</script>

<template>
  <section id="lineas" class="lines" aria-labelledby="lines-title">
    <div class="lines__inner">
      <SectionHead
        id="lines-title"
        light
        eyebrow="Dos líneas de servicio"
        title="Del auto a la sala de tu casa"
        text="Servicio profesional a domicilio, con los precios del catálogo oficial."
      />
      <div ref="track" class="lines__track">
        <div v-for="(l, i) in lines" :key="l.id" v-reveal="i * 120" class="lines__item">
          <LinePanel :line="l" :index="i" />
        </div>
      </div>
      <div class="lines__nav">
        <button type="button" class="lines__arrow" :disabled="!canPrev" aria-label="Línea anterior" @click="go(-1)">
          <AppIcon name="arrow-left" :size="18" />
        </button>
        <button type="button" class="lines__arrow" :disabled="!canNext" aria-label="Línea siguiente" @click="go(1)">
          <AppIcon name="arrow-right" :size="18" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.lines {
  position: relative;
  padding: $space-section 0;
  background:
    radial-gradient(900px 500px at 10% 0%, rgba($sky-blue, 0.12), transparent 60%),
    linear-gradient(180deg, $navy-deep 0%, $navy 100%);
  color: $on-dark;

  &__inner {
    @include container(1240px);
  }

  // Móvil: carrusel con snap; desde lg: las dos líneas lado a lado.
  &__track {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    margin-inline: -1rem;
    padding: 0.5rem 1rem 1.5rem;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    @include from('lg') {
      overflow: visible;
      margin: 0;
      padding: 0;
      gap: 1.75rem;
    }
  }

  &__item {
    flex: 0 0 88%;
    scroll-snap-align: center;

    @include from('md') {
      flex-basis: 70%;
    }

    @include from('lg') {
      flex: 1 1 0;
    }
  }

  &__nav {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;

    @include from('lg') {
      display: none;
    }
  }

  &__arrow {
    width: $tap;
    height: $tap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(#fff, 0.25);
    color: #fff;
    transition: opacity $dur-fast ease, transform $dur-fast $ease-out;

    &:disabled {
      opacity: 0.3;
    }

    &:active:not(:disabled) {
      transform: scale(0.94);
    }
  }
}
</style>
