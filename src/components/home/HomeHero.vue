<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { site } from '@/config/site'
import { lines } from '@/config/landing'
import { whatsappUrl } from '@/utils/format'
import { useParallax } from '@/composables/home/useParallax'
import { vMagnetic } from '@/directives/magnetic'

const wa = whatsappUrl(site.whatsapp, 'Hola Nemo, quiero información de sus servicios')
const media = ref<HTMLElement | null>(null)
useParallax(media, 0.16)
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__stage" aria-hidden="true">
      <div ref="media" class="hero__media">
        <img
          src="/fotos/hero/detailing-736.webp"
          srcset="/fotos/hero/detailing-480.webp 480w, /fotos/hero/detailing-736.webp 736w"
          sizes="(min-width: 1024px) 58vw, 100vw"
          alt=""
          width="736"
          height="915"
          fetchpriority="high"
          decoding="async"
        />
      </div>
      <span class="hero__shine"></span>
      <span class="hero__shade"></span>
    </div>

    <div class="hero__inner">
      <div class="hero__copy">
        <p class="hero__eyebrow"><span class="hero__dot"></span>{{ site.bio }}</p>
        <h1 id="hero-title" class="hero__title">
          <span class="hero__l1">Más que limpieza,</span>
          <span class="hero__l2">restauramos <em>valor</em></span>
        </h1>
        <p class="hero__lead">Autos · Muebles · Colchones · Oficinas · Alfombras</p>
        <div class="hero__ctas">
          <RouterLink v-magnetic to="/reservar" class="btn btn--accent btn--lg hero__cta">
            Reservar <AppIcon name="arrow-right" />
          </RouterLink>
          <a v-magnetic :href="wa" target="_blank" rel="noopener" class="btn btn--outline-light btn--lg hero__cta hero__cta--glass">
            <AppIcon name="whatsapp" /> WhatsApp
          </a>
        </div>
        <nav class="hero__lines" aria-label="Líneas de servicio">
          <a v-for="l in lines" :key="l.id" :href="`#nemo-${l.id}`" class="hero__line">
            {{ l.title }} <AppIcon name="arrow-right" :size="16" />
          </a>
        </nav>
      </div>

      <a href="#antes-despues" class="hero__teaser" aria-label="Ver comparativas antes y después">
        <span class="hero__teaser-img">
          <img src="/fotos/antes-despues/sofa-despues.webp" alt="" width="972" height="484" loading="lazy" />
        </span>
        <span class="hero__teaser-txt">
          <strong>Antes / Después</strong>
          <small>Trabajos reales del catálogo</small>
        </span>
        <AppIcon name="arrow-right" :size="18" class="hero__teaser-arrow" />
      </a>
    </div>

    <a href="#lineas" class="hero__cue" aria-label="Bajar a los servicios"><span></span></a>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  min-height: min(100svh, 880px);
  margin-top: calc(-1 * var(--header-h));
  padding: calc(var(--header-h) + 2rem) 0 3.25rem;
  background: $navy-deep;
  color: $on-dark;

  @include from('lg') {
    min-height: min(100svh, 920px);
    padding: calc(var(--header-h) + 3rem) 0 4.5rem;
  }

  &__stage {
    position: absolute;
    inset: 0;
    z-index: -1;
  }

  // Móvil: foto a sangre arriba. Escritorio: ocupa ~58% a la derecha (la foto es de 736 px, no se estira de más).
  &__media {
    position: absolute;
    inset: -6% 0 auto;
    height: 82%;
    will-change: transform;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 50% 30%;
      animation: hero-zoom 2.4s $ease-out both;
    }

    @include from('lg') {
      inset: -8% 0 -8% auto;
      width: 58%;
      height: auto;
      // Funde el borde izquierdo de la foto con el marino (sin costura visible).
      mask-image: linear-gradient(90deg, transparent 0%, #000 35%);
      -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 35%);

      img {
        object-position: 50% 40%;
      }
    }
  }

  // Degradado marino: abajo en móvil (el texto vive sobre él); de izquierda a derecha en escritorio.
  &__shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba($navy-deep, 0.55) 0%, rgba($navy-deep, 0.1) 22%, rgba($navy-deep, 0.55) 45%, $navy-deep 72%),
      radial-gradient(120% 60% at 80% 0%, rgba($sky-blue, 0.18), transparent 60%);

    @include from('lg') {
      background:
        linear-gradient(90deg, $navy-deep 0%, $navy-deep 40%, rgba($navy-deep, 0.75) 52%, rgba($navy-deep, 0.15) 75%, rgba($navy-deep, 0.35) 100%),
        linear-gradient(0deg, $navy-deep 0%, transparent 30%),
        radial-gradient(60% 70% at 85% 10%, rgba($sky-blue, 0.2), transparent 60%);
    }
  }

  // Destello que barre la pintura, como el brillo del encerado. Solo transform/opacity.
  &__shine {
    position: absolute;
    top: -20%;
    bottom: -20%;
    left: 0;
    width: 38%;
    background: linear-gradient(100deg, transparent 0%, rgba(#fff, 0.18) 45%, rgba($sky-blue, 0.22) 50%, transparent 60%);
    transform: translateX(-120%) skewX(-12deg);
    opacity: 0;
    animation: hero-shine 7s 1.1s $ease-in-out infinite;
    mix-blend-mode: screen;
    pointer-events: none;

    @include from('lg') {
      left: 42%;
      width: 24%;
    }
  }

  &__inner {
    @include container(1240px);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 2rem;

    @include from('lg') {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__copy {
    max-width: 720px;
    animation: hero-rise 0.9s 0.1s $ease-out both;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0.85rem 0.4rem 0.6rem;
    border-radius: $radius-pill;
    background: rgba(#fff, 0.08);
    border: 1px solid rgba(#fff, 0.14);
    backdrop-filter: blur(8px);
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #fff;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $orange;
    box-shadow: 0 0 0 4px rgba($orange, 0.25);
  }

  &__title {
    @include display(clamp(2.3rem, 0.9rem + 6.6vw, 5.6rem), 700);
    margin-top: 1.1rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: #fff;

    span {
      display: block;
    }

    em {
      position: relative;
      display: inline-block;
      font-style: italic;
      font-weight: 600;
      color: $orange;

      // Subrayado naranja que se dibuja al cargar (scaleX).
      &::after {
        content: '';
        position: absolute;
        left: 2%;
        right: 2%;
        bottom: 0.02em;
        height: 0.08em;
        border-radius: 99px;
        background: currentColor;
        transform-origin: left;
        animation: hero-draw 0.9s 0.75s $ease-out both;
      }
    }
  }

  &__l2 {
    animation: hero-rise 0.9s 0.22s $ease-out both;
  }

  &__lead {
    margin-top: 1.1rem;
    font-size: $text-lg;
    font-weight: 500;
    color: $on-dark-soft;
  }

  &__ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.75rem;
  }

  &__cta {
    flex: 1 1 150px;
    transition:
      transform 0.35s $ease-out,
      background-color $dur-fast ease,
      border-color $dur-fast ease,
      color $dur-fast ease;

    @include from('sm') {
      flex: 0 0 auto;
      min-width: 190px;
    }

    &--glass {
      background: rgba(#fff, 0.06);
      backdrop-filter: blur(8px);
    }
  }

  &__lines {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1.5rem;
    margin-top: 1.5rem;
  }

  &__line {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: $tap;
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: #fff;

    svg {
      color: $orange;
      transition: transform $dur $ease-out;
    }

    // Subrayado naranja animado (scaleX desde la izquierda).
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 22px;
      bottom: 8px;
      height: 2px;
      background: $orange;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform $dur $ease-out;
    }

    &:hover::after,
    &:focus-visible::after {
      transform: scaleX(1);
    }

    &:hover svg {
      transform: translateX(4px);
    }
  }

  &__teaser {
    display: none;

    @include from('lg') {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      align-self: flex-end;
      padding: 0.6rem 1rem 0.6rem 0.6rem;
      border-radius: $radius-lg;
      background: rgba($navy-deep, 0.55);
      border: 1px solid rgba(#fff, 0.16);
      backdrop-filter: blur(14px);
      box-shadow: $shadow-lg;
      color: #fff;
      animation: hero-rise 0.9s 0.6s $ease-out both;
      transition: transform $dur $ease-out, border-color $dur ease;

      &:hover {
        transform: translateY(-4px);
        border-color: rgba($orange, 0.7);
      }
    }
  }

  &__teaser-img {
    width: 112px;
    aspect-ratio: 972 / 484;
    border-radius: 12px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__teaser-txt {
    display: flex;
    flex-direction: column;

    strong {
      font-family: $font-display;
      font-size: $text-lg;
    }

    small {
      font-size: $text-xs;
      color: $on-dark-soft;
    }
  }

  &__teaser-arrow {
    color: $orange;
  }

  &__cue {
    display: none;

    @include from('lg') {
      position: absolute;
      left: 50%;
      bottom: 1.25rem;
      display: flex;
      justify-content: center;
      width: 44px;
      height: 44px;
      margin-left: -22px;

      span {
        position: relative;
        width: 2px;
        height: 36px;
        overflow: hidden;
        border-radius: 2px;
        background: rgba(#fff, 0.18);

        &::after {
          content: '';
          position: absolute;
          inset: 0;
          background: $orange;
          animation: hero-cue 2.2s $ease-in-out infinite;
        }
      }
    }
  }
}

@keyframes hero-zoom {
  from {
    transform: scale(1.12);
    opacity: 0.4;
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(26px);
  }
}

@keyframes hero-draw {
  from {
    transform: scaleX(0);
  }
}

@keyframes hero-shine {
  0% {
    transform: translateX(-120%) skewX(-12deg);
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  30%,
  100% {
    transform: translateX(320%) skewX(-12deg);
    opacity: 0;
  }
}

@keyframes hero-cue {
  0% {
    transform: translateY(-100%);
  }
  60%,
  100% {
    transform: translateY(100%);
  }
}

@include reduced-motion {
  .hero__shine,
  .hero__cue span::after {
    display: none;
  }
}
</style>
