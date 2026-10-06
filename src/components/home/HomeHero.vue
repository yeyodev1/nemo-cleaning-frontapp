<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import HeroArt from './HeroArt.vue'
import { heroChips } from '@/config/landing'
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__glow" aria-hidden="true"></div>
    <div class="hero__inner">
      <div class="hero__copy">
        <p class="hero__eyebrow"><AppIcon name="sparkles" :size="16" /> Guayaquil · Samborondón · Vía a la Costa</p>
        <h1 id="hero-title" class="hero__title">
          Tu hogar, tu auto y tu oficina, <span>impecables</span> sin moverte de casa.
        </h1>
        <p class="hero__lead">
          Limpieza profesional de tapicería, colchones, muebles, alfombras, hogares y oficinas. Arma tu pedido, ve el
          precio al instante y elige tu horario.
        </p>
        <div class="hero__ctas">
          <RouterLink to="/reservar" class="btn btn--primary btn--lg">
            Reserva tu limpieza <AppIcon name="arrow-right" />
          </RouterLink>
          <RouterLink to="/cotizar-oficina" class="btn btn--ghost btn--lg">
            <AppIcon name="building" /> Cotizar oficina
          </RouterLink>
        </div>
        <ul class="hero__chips">
          <li v-for="c in heroChips" :key="c.label"><AppIcon :name="c.icon" :size="16" /> {{ c.label }}</li>
        </ul>
      </div>
      <div class="hero__art"><HeroArt /></div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, $sky 0%, #fff 100%);
  padding: 2rem 0 3rem;

  @include from('lg') {
    padding: 4rem 0 5rem;
  }

  &__glow {
    position: absolute;
    width: 520px;
    height: 520px;
    right: -180px;
    top: -160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($aqua, 0.22), transparent 65%);
    pointer-events: none;
  }

  &__inner {
    @include container;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    @include from('lg') {
      flex-direction: row;
      align-items: center;
      gap: 3rem;
    }
  }

  &__copy {
    flex: 1.1;
    animation: rise 0.7s $ease both;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.8rem;
    border-radius: $radius-pill;
    background: $aqua-soft;
    color: $aqua-ink;
    font-size: $text-xs;
    font-weight: 700;
    margin-bottom: 1.1rem;
  }

  &__title {
    @include display($display-lg);

    span {
      background: linear-gradient(90deg, $navy, $aqua-deep);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  }

  &__lead {
    margin-top: 1rem;
    color: $ink-soft;
    font-size: $text-lg;
    max-width: 52ch;
  }

  &__ctas {
    margin-top: 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;

    @include from('sm') {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  &__chips {
    list-style: none;
    margin-top: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    li {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.75rem;
      border-radius: $radius-pill;
      background: #fff;
      border: 1px solid $line;
      font-size: $text-xs;
      font-weight: 600;
      color: $ink-soft;

      svg {
        color: $aqua-ink;
      }
    }
  }

  &__art {
    flex: 0.9;
    max-width: 480px;
    width: 100%;
    margin-inline: auto;
    animation: rise 0.9s 0.1s $ease both;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}
</style>
