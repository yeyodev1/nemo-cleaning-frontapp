<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { paymentMethods, steps } from '@/config/landing'
</script>

<template>
  <section id="como-funciona" class="how" aria-labelledby="how-title">
    <div class="how__inner">
      <SectionHead id="how-title" eyebrow="Reserva en línea" title="Cómo funciona" />
      <ol class="how__steps">
        <li v-for="(s, i) in steps" :key="s.title" v-reveal="i * 80" class="step">
          <span class="step__n">{{ i + 1 }}</span>
          <div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </div>
        </li>
      </ol>

      <h3 class="how__sub">Formas de pago</h3>
      <ul class="how__pay">
        <li v-for="m in paymentMethods" :key="m.title" class="pay">
          <span class="pay__icon"><AppIcon :name="m.icon" :size="22" /></span>
          <div>
            <strong>{{ m.title }}</strong>
            <p>{{ m.text }}</p>
          </div>
        </li>
      </ul>
      <RouterLink to="/reservar" class="btn btn--primary btn--lg how__cta">Reservar ahora <AppIcon name="arrow-right" /></RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.how {
  background: $paper;
  padding: $space-section 0;

  &__inner {
    @include container;
  }

  &__steps {
    list-style: none;
    @include flex-cards(240px, 1rem);
  }

  &__sub {
    margin: 2.5rem 0 1rem;
    font-family: $font-display;
    font-size: $text-xl;
    color: $navy;
  }

  &__pay {
    list-style: none;
    @include flex-cards(240px, 1rem);
  }

  &__cta {
    margin-top: 2rem;
  }
}

.step {
  transition: border-color $dur $ease-out, box-shadow $dur $ease-out;
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: $radius-md;
  background: $surface;
  border: 1px solid $line;

  &__n {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy;
    color: #fff;
    font-family: $font-display;
    font-weight: 700;
    font-size: $text-lg;
    box-shadow: inset 0 -3px 0 $orange;
  }

  h3 {
    font-size: $text-base;
    color: $navy;
  }

  p {
    margin-top: 0.25rem;
    font-size: $text-sm;
    color: $ink-soft;
  }
}

.pay {
  transition: transform $dur $ease-out, box-shadow $dur $ease-out;
  display: flex;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-3px);
      box-shadow: $shadow-md;
    }
  }

  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-radius: $radius-md;
  background: $surface;
  border: 1px solid $line;

  &__icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy;
    color: #fff;
  }

  strong {
    color: $navy;
  }

  p {
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
