<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { site } from '@/config/site'
import { lines } from '@/config/landing'
import { whatsappUrl } from '@/utils/format'

const wa = whatsappUrl(site.whatsapp, 'Hola Nemo, quiero información de sus servicios')
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__inner">
      <div class="hero__copy">
        <p class="hero__eyebrow">{{ site.bio }}</p>
        <h1 id="hero-title" class="hero__title">Más que limpieza, restauramos valor</h1>
        <p class="hero__lead">Autos · Muebles · Colchones · Oficinas · Alfombras</p>
        <div class="hero__ctas">
          <RouterLink to="/reservar" class="btn btn--accent btn--lg">Reservar <AppIcon name="arrow-right" /></RouterLink>
          <a :href="wa" target="_blank" rel="noopener" class="btn btn--outline-light btn--lg">
            <AppIcon name="whatsapp" /> WhatsApp
          </a>
        </div>
        <nav class="hero__lines" aria-label="Líneas de servicio">
          <a v-for="l in lines" :key="l.id" :href="`#nemo-${l.id}`" class="hero__line">
            {{ l.title }} <AppIcon name="arrow-right" :size="18" />
          </a>
        </nav>
      </div>

      <div v-reveal="120" class="hero__photos">
        <figure class="hero__photo hero__photo--main">
          <img src="/fotos/auto-detailing-pro.webp" alt="Detailing de una camioneta negra" width="735" height="1102" fetchpriority="high" />
        </figure>
        <figure class="hero__photo hero__photo--side">
          <img src="/fotos/auto-interior.webp" alt="Limpieza al detalle del panel de un vehículo" width="736" height="736" />
        </figure>
        <figure class="hero__photo hero__photo--small">
          <img src="/fotos/antes-despues/sofa-despues.webp" alt="Sofá después de la limpieza" width="972" height="484" />
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  @include dark-pattern;
  color: $on-dark;
  padding: calc(var(--header-h) + 2rem) 0 3rem;
  margin-top: calc(-1 * var(--header-h));

  @include from('lg') {
    padding: calc(var(--header-h) + 4.5rem) 0 5rem;
  }

  &__inner {
    @include container;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;

    @include from('lg') {
      flex-direction: row;
      align-items: center;
      gap: 4rem;
    }
  }

  &__copy {
    flex: 1 1 52%;
  }

  &__eyebrow {
    @include eyebrow;
    color: $sky-blue;
    margin-bottom: 1rem;
    @include orange-underline(36px);
  }

  &__title {
    @include display($display-lg);
    color: #fff;
  }

  &__lead {
    margin-top: 1rem;
    font-size: $text-lg;
    font-weight: 500;
    color: $on-dark-soft;
  }

  &__ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.75rem;

    .btn {
      flex: 1 1 160px;

      @include from('sm') {
        flex: 0 0 auto;
      }
    }
  }

  &__lines {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 2rem;
  }

  // Como el "Desliza →" de los posts: texto blanco con flecha naranja.
  &__line {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: $tap;
    padding-right: 1rem;
    font-size: $text-sm;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #fff;

    svg {
      color: $orange;
      transition: transform 0.2s $ease;
    }

    &:hover svg {
      transform: translateX(3px);
    }
  }

  &__photos {
    flex: 1 1 48%;
    position: relative;
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    grid-template-rows: auto auto;
    gap: 0.75rem;
  }

  &__photo {
    @include photo-frame;
    box-shadow: $shadow-lg;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--main {
      grid-row: 1 / span 2;
      aspect-ratio: 3 / 4;
    }

    &--side {
      aspect-ratio: 1;
    }

    &--small {
      aspect-ratio: 972 / 484;
      align-self: start;
    }
  }
}
</style>
