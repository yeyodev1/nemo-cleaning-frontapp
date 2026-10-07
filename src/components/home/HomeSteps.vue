<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { paymentMethods, steps } from '@/config/landing'
import { vMagnetic } from '@/directives/magnetic'
</script>

<template>
  <section id="como-funciona" class="how" aria-labelledby="how-title">
    <div class="how__inner">
      <SectionHead id="how-title" eyebrow="Reserva en línea" title="Cómo funciona" text="Tres pasos, todo desde tu celular." />
      <ol class="how__steps">
        <li v-for="(s, i) in steps" :key="s.title" v-reveal="i * 110" class="step">
          <span class="step__n" aria-hidden="true">0{{ i + 1 }}</span>
          <span class="step__icon"><AppIcon :name="s.icon" :size="24" /></span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
          <ul v-if="i === steps.length - 1" class="step__pay" aria-label="Formas de pago">
            <li v-for="m in paymentMethods" :key="m.title"><AppIcon :name="m.icon" :size="16" /> {{ m.title }}</li>
          </ul>
        </li>
      </ol>
      <RouterLink v-magnetic="0.15" to="/reservar" class="btn btn--primary btn--lg how__cta">Reservar ahora <AppIcon name="arrow-right" /></RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.how {
  background: $paper;
  padding: $space-section 0;

  &__inner {
    @include container(1240px);
  }

  &__steps {
    list-style: none;
    counter-reset: step;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include from('lg') {
      flex-direction: row;
      gap: 1.5rem;
    }
  }

  &__cta {
    margin-top: 2.25rem;
    transition: transform 0.35s $ease-out, background-color $dur-fast ease;
  }
}

.step {
  position: relative;
  flex: 1;
  overflow: hidden;
  padding: 1.5rem 1.4rem 1.6rem;
  border-radius: 24px;
  background: $surface;
  border: 1px solid $line;
  transition: transform $dur-slow $ease-out, box-shadow $dur-slow $ease-out, border-color $dur ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-6px);
      box-shadow: $shadow-md;
      border-color: rgba($orange, 0.5);

      .step__n {
        transform: translateY(-6px);
      }
    }
  }

  // Numeral gigante de fondo, como en las piezas editoriales.
  &__n {
    position: absolute;
    top: -0.6rem;
    right: 0.6rem;
    font-family: $font-display;
    font-size: 6.5rem;
    font-weight: 700;
    font-style: italic;
    line-height: 1;
    color: $navy-soft;
    transition: transform $dur-slow $ease-out;
    pointer-events: none;
  }

  &__icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: $navy;
    color: #fff;
    box-shadow: inset 0 -3px 0 $orange;
  }

  h3 {
    position: relative;
    margin-top: 1.1rem;
    font-family: $font-display;
    font-size: $text-xl;
    color: $navy;
  }

  p {
    position: relative;
    margin-top: 0.4rem;
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__pay {
    position: relative;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 1rem;

    li {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.7rem;
      border-radius: $radius-pill;
      background: $sky;
      border: 1px solid $line;
      font-size: $text-xs;
      font-weight: 600;
      color: $navy;

      svg {
        color: $orange-ink;
      }
    }
  }
}
</style>
