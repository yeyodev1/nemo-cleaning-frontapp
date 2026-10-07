<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { money } from '@/utils/format'
import { priceSummary, tierRanges, unitSuffix, variantLabel } from '@/utils/pricing'
import type { Service } from '@/types/api'

/**
 * Tarjeta de servicio al estilo del catálogo: foto con marco naranja, título naranja en mayúsculas,
 * "Incluye" y la lista de opciones con el precio naranja alineado a la derecha. Todo viene del API.
 */
const props = defineProps<{ service: Service; cta: { to: string; label: string } }>()
const s = computed(() => props.service)
const open = ref(false)
const FEATURES_PREVIEW = 4
const features = computed(() => (open.value ? s.value.features : s.value.features.slice(0, FEATURES_PREVIEW)))
const hasRange = computed(() => s.value.variants.some((v) => v.priceMax > v.price))
</script>

<template>
  <article class="card" :class="{ 'card--photo': s.imageUrl }">
    <figure v-if="s.imageUrl" class="card__photo">
      <img :src="s.imageUrl" :alt="s.name" loading="lazy" width="480" height="360" />
    </figure>
    <div class="card__body">
      <header class="card__head">
        <h3 class="card__title">{{ s.name }}</h3>
        <p class="card__from money">{{ priceSummary(s) }} <small v-if="unitSuffix(s)">{{ unitSuffix(s) }}</small></p>
      </header>
      <p v-if="s.description" class="card__desc">{{ s.description }}</p>

      <ul v-if="s.features.length" class="card__features" aria-label="Incluye">
        <li v-for="f in features" :key="f"><AppIcon name="check" :size="14" /> {{ f }}</li>
      </ul>
      <button v-if="s.features.length > FEATURES_PREVIEW" type="button" class="card__more" :aria-expanded="open" @click="open = !open">
        {{ open ? 'Ver menos' : `Ver los ${s.features.length} puntos` }}
      </button>

      <dl v-if="s.variants.length" class="card__prices">
        <div v-for="v in s.variants" :key="v.label">
          <dt>{{ v.label }}</dt>
          <dd class="money">{{ variantLabel(v) }}<small v-if="s.unit === 'm2'"> / m²</small></dd>
        </div>
      </dl>
      <dl v-else-if="s.priceTiers.length" class="card__prices">
        <div v-for="t in tierRanges(s.priceTiers)" :key="t.label">
          <dt>{{ t.label }}</dt>
          <dd class="money">{{ money(t.price) }} c/u</dd>
        </div>
      </dl>
      <p v-if="hasRange && s.priceNote" class="card__note">{{ s.priceNote }}</p>

      <p v-if="s.durationLabel || s.deliveryNote" class="card__time">
        <AppIcon name="clock" :size="14" /> {{ s.durationLabel || s.deliveryNote }}
      </p>
      <RouterLink :to="cta.to" class="btn btn--accent card__cta">{{ cta.label }} <AppIcon name="arrow-right" :size="16" /></RouterLink>
    </div>
  </article>
</template>

<style scoped lang="scss">
.card {
  display: flex;
  flex-direction: column;
  border-radius: $radius-lg;
  background: rgba(#fff, 0.05);
  border: 1px solid $dark-line;
  overflow: hidden;
  color: $on-dark-soft;
  transition: border-color $dur $ease-out, background-color $dur $ease-out;

  // Micro-interacción: la foto se acerca apenas y el borde toma el celeste del logo.
  @media (hover: hover) {
    &:hover {
      border-color: rgba($sky-blue, 0.45);
      background-color: rgba(#fff, 0.07);

      .card__photo img {
        transform: scale(1.04);
      }
    }
  }

  &__photo {
    @include photo-frame($radius-md);
    margin: 0.75rem 0.75rem 0;
    aspect-ratio: 4 / 3;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $dur-slow $ease-out;
    }
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.1rem 1.1rem 1.25rem;
  }

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__title {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
  }

  &__from {
    flex-shrink: 0;
    text-align: right;
    font-weight: 700;
    color: $orange;
    font-size: $text-sm;

    small {
      display: block;
      font-weight: 500;
      color: $on-dark-soft;
      font-size: $text-xs;
    }
  }

  &__desc,
  &__note {
    font-size: $text-sm;
  }

  &__note {
    font-size: $text-xs;
    font-style: italic;
  }

  &__features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: $text-sm;

    li {
      display: flex;
      gap: 0.45rem;
    }

    svg {
      flex-shrink: 0;
      margin-top: 4px;
      color: $sky-blue;
    }
  }

  &__more {
    align-self: flex-start;
    min-height: 36px;
    font-size: $text-xs;
    font-weight: 600;
    color: #fff;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &__prices {
    display: flex;
    flex-direction: column;
    border-top: 1px solid $dark-line;
    padding-top: 0.5rem;

    div {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.35rem 0;
      font-size: $text-sm;
    }

    dt {
      color: $on-dark;
    }

    dd {
      font-weight: 700;
      color: $orange;
      text-align: right;

      small {
        font-weight: 500;
        color: $on-dark-soft;
      }
    }
  }

  &__time {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: $text-xs;
    font-weight: 600;
    color: $sky-blue;
  }

  &__cta {
    margin-top: auto;
    align-self: stretch;
  }
}
</style>
