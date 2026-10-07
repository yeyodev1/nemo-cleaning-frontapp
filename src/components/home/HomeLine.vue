<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import LineServiceCard from './LineServiceCard.vue'
import VehicleSizeHelp from '@/components/booking/VehicleSizeHelp.vue'
import { useCatalogStore } from '@/stores/catalog'
import type { LineCopy } from '@/config/landing'
import { priceSummary } from '@/utils/pricing'
import type { Service } from '@/types/api'

/** Una línea del catálogo (NEMO CAR o NEMO HOME & OFFICE) con sus servicios reales del API. */
const props = defineProps<{ line: LineCopy }>()
const catalog = useCatalogStore()

const services = computed(() =>
  catalog.services.filter((s) => !s.isExtra && props.line.categories.includes(s.category)),
)
const extras = computed(() => catalog.services.filter((s) => s.isExtra && props.line.categories.includes(s.category)))
const isCar = computed(() => props.line.id === 'car')

function cta(s: Service) {
  if (s.category === 'oficinas') return { to: '/cotizar-oficina', label: 'Cotizar' }
  return { to: `/reservar?categoria=${s.category}`, label: 'Reservar' }
}
</script>

<template>
  <section :id="`nemo-${line.id}`" class="line" :class="`line--${line.id}`" :aria-labelledby="`line-${line.id}`">
    <div class="line__inner">
      <SectionHead :id="`line-${line.id}`" light eyebrow="Catálogo" :title="line.title" :text="line.tagline" />

      <VehicleSizeHelp v-if="isCar" dark class="line__sizes" />

      <div v-if="catalog.loading && !services.length" class="line__grid">
        <span v-for="n in 3" :key="n" class="skeleton line__skeleton"></span>
      </div>
      <p v-else-if="catalog.error && !services.length" class="line__error">
        <AppIcon name="alert" :size="18" /> No pudimos cargar los servicios. Recarga la página.
      </p>
      <template v-else>
        <p v-if="services.length > 1" class="line__swipe" aria-hidden="true">
        <AppIcon name="arrow-right" :size="14" /> Desliza para ver los {{ services.length }} servicios
      </p>
      <div class="line__grid">
        <LineServiceCard v-for="s in services" :key="s._id" v-reveal :service="s" :cta="cta(s)" />
      </div>
      </template>

      <div v-if="extras.length" class="line__extras">
        <h3>Servicios adicionales</h3>
        <ul>
          <li v-for="e in extras" :key="e._id">
            <span>
              {{ e.name }}
              <small v-if="e.variants.length">{{ e.variants.map((v) => v.label).join(' · ') }}</small>
              <small v-else-if="e.description">{{ e.description }}</small>
            </span>
            <strong class="money">{{ priceSummary(e) }}</strong>
          </li>
        </ul>
      </div>

    </div>
  </section>
</template>

<style scoped lang="scss">
.line {
  @include dark-pattern;
  color: $on-dark;
  padding: $space-section 0;

  &--home {
    @include dark-pattern($navy-deep);
  }

  &--car {
    border-bottom: 1px solid $dark-line;
  }

  &__inner {
    @include container;
  }

  &__sizes {
    margin-bottom: 1.5rem;
    max-width: 560px;
  }

  // Móvil: carrusel horizontal con snap (8 servicios uno debajo de otro serían eternos).
  // Desde md: grilla de tarjetas.
  &__grid {
    display: flex;
    gap: 0.9rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    margin-inline: -1rem;
    padding: 0.25rem 1rem 1rem;
    scrollbar-width: thin;
    scrollbar-color: rgba($orange, 0.6) transparent;

    > * {
      flex: 0 0 86%;
      scroll-snap-align: center;
    }

    @include from('md') {
      overflow: visible;
      margin-inline: 0;
      padding: 0;
      flex-wrap: wrap;
      gap: 1.25rem;

      > * {
        flex: 1 1 300px;
        min-width: 0;
      }
    }
  }

  &__swipe {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
    font-size: $text-xs;
    color: $on-dark-soft;

    @include from('md') {
      display: none;
    }
  }

  &__skeleton {
    height: 420px;
    opacity: 0.12;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $on-dark-soft;
  }

  &__extras {
    margin-top: 2.5rem;

    h3 {
      font-family: $font-display;
      color: #fff;
      font-size: $text-xl;
      margin-bottom: 1rem;
      @include orange-underline(36px);
    }

    ul {
      list-style: none;
      border-top: 1px solid $dark-line;

      @include from('lg') {
        columns: 2;
        column-gap: 3rem;
      }
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
      padding: 0.7rem 0;
      border-bottom: 1px solid $dark-line;
      font-size: $text-sm;
      break-inside: avoid;

      span {
        display: flex;
        flex-direction: column;
      }

      small {
        color: $on-dark-soft;
        font-size: $text-xs;
      }

      strong {
        color: $orange;
        white-space: nowrap;
      }
    }
  }

}
</style>
