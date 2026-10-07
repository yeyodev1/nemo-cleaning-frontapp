<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import LineServiceCard from './LineServiceCard.vue'
import LineExtras from './LineExtras.vue'
import VehicleSizeHelp from '@/components/booking/VehicleSizeHelp.vue'
import type { LineCopy } from '@/config/landing'
import type { Service } from '@/types/api'
import { money } from '@/utils/format'
import { useLineServices } from '@/composables/home/useLineServices'
import { useCarousel } from '@/composables/home/useCarousel'

/** Catálogo de una línea (NEMO CAR o NEMO HOME & OFFICE) con sus servicios reales del API, en carrusel. */
const props = defineProps<{ line: LineCopy }>()
const { catalog, services, extras, fromPrice } = useLineServices(() => props.line)
const isCar = computed(() => props.line.id === 'car')
const track = ref<HTMLElement | null>(null)
const { canPrev, canNext, progress, go, refresh } = useCarousel(track)
watch(services, () => nextTick(refresh))

function cta(s: Service) {
  if (s.category === 'oficinas') return { to: '/cotizar-oficina', label: 'Cotizar' }
  return { to: `/reservar?categoria=${s.category}`, label: 'Reservar' }
}
</script>

<template>
  <section :id="`nemo-${line.id}`" class="line" :class="`line--${line.id}`" :aria-labelledby="`line-${line.id}`">
    <div class="line__inner">
      <header v-reveal class="line__head">
        <figure class="line__photo">
          <img :src="line.detailPhoto" :alt="line.detailAlt" loading="lazy" decoding="async" />
        </figure>
        <div class="line__copy">
          <p class="line__eyebrow">Catálogo</p>
          <h2 :id="`line-${line.id}`" class="line__title">{{ line.title }}</h2>
          <p class="line__tagline">{{ line.tagline }}</p>
          <p v-if="fromPrice !== null" class="line__from">
            {{ services.length }} servicios · desde <strong class="money">{{ money(fromPrice) }}</strong>
          </p>
        </div>
      </header>

      <VehicleSizeHelp v-if="isCar" dark class="line__sizes" />

      <div v-if="catalog.loading && !services.length" class="line__track">
        <span v-for="n in 3" :key="n" class="skeleton line__skeleton"></span>
      </div>
      <p v-else-if="catalog.error && !services.length" class="line__error">
        <AppIcon name="alert" :size="18" /> No pudimos cargar los servicios. Recarga la página.
      </p>
      <template v-else>
        <div ref="track" class="line__track" tabindex="0" :aria-label="`Servicios de ${line.title}`">
          <LineServiceCard v-for="s in services" :key="s._id" :service="s" :cta="cta(s)" />
        </div>
        <div v-if="services.length > 1" class="line__nav">
          <span class="line__bar" aria-hidden="true"><span :style="{ transform: `scaleX(${Math.max(0.08, progress)})` }"></span></span>
          <button type="button" class="line__arrow" :disabled="!canPrev" aria-label="Servicio anterior" @click="go(-1)">
            <AppIcon name="arrow-left" :size="18" />
          </button>
          <button type="button" class="line__arrow" :disabled="!canNext" aria-label="Servicio siguiente" @click="go(1)">
            <AppIcon name="arrow-right" :size="18" />
          </button>
        </div>
      </template>

      <LineExtras v-if="extras.length" :extras="extras" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.line {
  @include dark-pattern;
  color: $on-dark;
  padding: $space-section 0;
  overflow: hidden;

  &--home {
    @include dark-pattern($navy-deep);
  }

  &__inner {
    @include container(1240px);
  }

  &__head {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 2rem;

    @include from('md') {
      flex-direction: row;
      align-items: center;
      gap: 2.5rem;
    }
  }

  &__photo {
    @include photo-frame(24px);
    aspect-ratio: 16 / 9;
    box-shadow: $shadow-lg, 0 0 0 1px rgba(#fff, 0.1);

    @include from('md') {
      flex: 0 0 38%;
      aspect-ratio: 4 / 3;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &--car &__photo img {
    object-position: 50% 35%;
  }

  &__eyebrow {
    @include eyebrow;
    color: $sky-blue;
  }

  &__title {
    @include display(clamp(2.3rem, 1.4rem + 4vw, 4.4rem), 700);
    margin-top: 0.35rem;
    letter-spacing: -0.03em;
    color: #fff;
    @include orange-underline(56px);
  }

  &__tagline {
    margin-top: 0.9rem;
    max-width: 520px;
    color: $on-dark-soft;
  }

  &__from {
    margin-top: 0.75rem;
    font-size: $text-sm;
    color: $on-dark-soft;

    strong {
      font-family: $font-display;
      font-size: $text-xl;
      color: $orange;
    }
  }

  &__sizes {
    margin-bottom: 1.5rem;
    max-width: 560px;
  }

  // Carrusel con snap en todos los anchos: 8 tarjetas en grilla eran una pared.
  &__track {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1rem;
    margin-inline: -1rem;
    padding: 0.25rem 1rem 1.25rem;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    > * {
      flex: 0 0 86%;
      scroll-snap-align: start;
    }

    @include from('md') {
      margin-inline: -2rem;
      padding-inline: 2rem;
      scroll-padding-inline: 2rem;
      gap: 1.25rem;

      > * {
        flex-basis: calc((100% - 1.25rem) / 2.15);
      }
    }

    @include from('lg') {
      > * {
        flex-basis: calc((100% - 2.5rem) / 3.1);
      }
    }

    &:focus-visible {
      outline: 2px solid $orange;
      outline-offset: 4px;
    }
  }

  &__skeleton {
    height: 420px;
    opacity: 0.12;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__bar {
    flex: 1;
    height: 2px;
    margin-right: 0.75rem;
    border-radius: 2px;
    background: rgba(#fff, 0.14);
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: $orange;
      transform-origin: left;
      transition: transform 0.2s linear;
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
    transition: opacity $dur-fast ease, transform $dur-fast $ease-out, background-color $dur-fast ease, border-color $dur-fast ease;

    &:hover:not(:disabled) {
      background: $orange;
      border-color: $orange;
      color: $navy;
    }

    &:active:not(:disabled) {
      transform: scale(0.94);
    }

    &:disabled {
      opacity: 0.3;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $on-dark-soft;
  }
}
</style>
