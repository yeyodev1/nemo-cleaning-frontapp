<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import type { LineCopy } from '@/config/landing'
import { useLineServices } from '@/composables/home/useLineServices'
import { money } from '@/utils/format'

/** Panel grande de una línea (NEMO CAR / NEMO HOME & OFFICE): foto real, "desde" y servicios del API. */
const props = defineProps<{ line: LineCopy; index: number }>()
const { catalog, services, fromPrice, highlights } = useLineServices(() => props.line)
const MAX_CHIPS = 5
</script>

<template>
  <article class="panel" :class="`panel--${line.id}`">
    <figure class="panel__photo">
      <img :src="line.photo" :alt="line.photoAlt" loading="lazy" decoding="async" />
      <figcaption class="panel__over">
        <span class="panel__index">0{{ index + 1 }}</span>
        <span class="panel__icons" aria-hidden="true">
          <AppIcon v-for="i in line.icons" :key="i" :name="i" :size="18" />
        </span>
      </figcaption>
    </figure>

    <div class="panel__body">
      <h3 class="panel__title">{{ line.title }}</h3>
      <p class="panel__tagline">{{ line.tagline }}</p>

      <p class="panel__from" aria-live="polite">
        <template v-if="fromPrice !== null">
          <small>desde</small> <strong class="money">{{ money(fromPrice) }}</strong>
        </template>
        <span v-else-if="catalog.loading" class="skeleton panel__sk"></span>
      </p>

      <ul v-if="highlights.length" class="panel__inc" aria-label="Qué incluye">
        <li v-for="h in highlights" :key="h.feature">
          <AppIcon name="check" :size="16" />
          <span>{{ h.feature }} <small>· {{ h.service }}</small></span>
        </li>
      </ul>

      <ul v-if="services.length" class="panel__chips" aria-label="Servicios">
        <li v-for="s in services.slice(0, MAX_CHIPS)" :key="s._id">{{ s.name.split(' · ')[0] }}</li>
        <li v-if="services.length > MAX_CHIPS" class="panel__chips-more">+{{ services.length - MAX_CHIPS }}</li>
      </ul>

      <div class="panel__ctas">
        <a :href="`#nemo-${line.id}`" class="btn btn--accent">Ver servicios y precios <AppIcon name="arrow-right" :size="16" /></a>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(180deg, $navy-2 0%, $navy 60%);
  border: 1px solid rgba(#fff, 0.1);
  box-shadow: $shadow-lg;
  color: $on-dark;
  transition: transform $dur-slow $ease-out, border-color $dur ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-6px);
      border-color: rgba($orange, 0.55);

      .panel__photo img {
        transform: scale(1.06);
      }
    }
  }

  &__photo {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: $navy-deep;

    @include from('lg') {
      aspect-ratio: 16 / 10;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.9s $ease-out;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba($navy-deep, 0.35) 0%, transparent 35%, transparent 55%, $navy-2 100%);
    }
  }

  &--home &__photo img {
    object-position: 70% 50%;
  }

  &__over {
    position: absolute;
    inset: 1rem 1rem auto;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__index {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 600;
    font-style: italic;
    color: #fff;
  }

  &__icons {
    display: inline-flex;
    gap: 0.45rem;
    padding: 0.45rem 0.65rem;
    border-radius: $radius-pill;
    background: rgba($navy-deep, 0.55);
    backdrop-filter: blur(8px);
    color: $sky-blue;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 0 1.25rem 1.4rem;
    margin-top: -2.25rem;
    position: relative;

    @include from('md') {
      padding: 0 1.75rem 1.75rem;
    }
  }

  &__title {
    @include display(clamp(1.9rem, 1.3rem + 2.6vw, 3rem), 700);
    letter-spacing: -0.02em;
    color: #fff;
  }

  &__tagline {
    color: $on-dark-soft;
    font-size: $text-sm;
  }

  &__from {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    min-height: 2.5rem;

    small {
      font-size: $text-xs;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: $on-dark-soft;
    }

    strong {
      font-family: $font-display;
      font-size: clamp(2rem, 1.6rem + 1.6vw, 2.6rem);
      line-height: 1;
      color: $orange;
    }
  }

  &__sk {
    width: 140px;
    height: 34px;
    opacity: 0.15;
  }

  &__inc {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    font-size: $text-sm;

    li {
      display: flex;
      gap: 0.5rem;
    }

    svg {
      flex-shrink: 0;
      margin-top: 3px;
      color: $sky-blue;
    }

    small {
      color: $on-dark-soft;
    }
  }

  &__chips {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    li {
      padding: 0.3rem 0.7rem;
      border-radius: $radius-pill;
      border: 1px solid rgba(#fff, 0.16);
      font-size: $text-xs;
      font-weight: 500;
      color: $on-dark;
    }
  }

  &__chips-more {
    background: rgba($orange, 0.16);
    border-color: rgba($orange, 0.5) !important;
  }

  &__ctas {
    margin-top: auto;
    padding-top: 0.4rem;

    .btn {
      width: 100%;

      @include from('sm') {
        width: auto;
      }
    }
  }
}
</style>
