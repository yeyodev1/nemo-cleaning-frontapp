<script setup lang="ts">
import SectionHead from './SectionHead.vue'
import BeforeAfterSlider from './BeforeAfterSlider.vue'
import { beforeAfter } from '@/config/landing'

// Las horizontales (sofá, alfombra) van anchas; las verticales (colchón, auto) lado a lado.
const wide = beforeAfter.filter((p) => p.id === 'sofa' || p.id === 'alfombra')
const tall = beforeAfter.filter((p) => p.id === 'colchon' || p.id === 'auto')
</script>

<template>
  <section id="antes-despues" class="ba-sec" aria-labelledby="ba-title">
    <div class="ba-sec__inner">
      <SectionHead id="ba-title" eyebrow="Comparativas del catálogo" title="Antes / Después" text="Desliza para comparar." />
      <div class="ba-sec__grid">
        <div class="ba-sec__col">
          <div v-for="p in wide" :key="p.id" v-reveal class="ba-sec__item">
            <BeforeAfterSlider :before="p.before" :after="p.after" :title="p.title" :ratio="p.ratio" />
            <p class="ba-sec__label">{{ p.title }}</p>
          </div>
        </div>
        <div class="ba-sec__col ba-sec__col--tall">
          <div v-for="p in tall" :key="p.id" v-reveal class="ba-sec__item">
            <BeforeAfterSlider :before="p.before" :after="p.after" :title="p.title" :ratio="p.ratio" />
            <p class="ba-sec__label">{{ p.title }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ba-sec {
  background: $surface;
  padding: $space-section 0;

  &__inner {
    @include container;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__col {
    flex: 1.3;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    &--tall {
      flex: 1;
      flex-direction: row;

      .ba-sec__item {
        flex: 1;
        min-width: 0;
      }
    }
  }

  &__label {
    margin-top: 0.5rem;
    font-weight: 600;
    font-size: $text-sm;
    color: $navy;
  }
}
</style>
