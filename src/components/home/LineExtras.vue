<script setup lang="ts">
import { priceSummary } from '@/utils/pricing'
import type { Service } from '@/types/api'

/** Servicios adicionales de una línea, como la lista de precios del catálogo. */
defineProps<{ extras: Service[] }>()
</script>

<template>
  <div class="extras">
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
</template>

<style scoped lang="scss">
.extras {
  margin-top: 2.5rem;
  padding: 1.25rem;
  border-radius: $radius-lg;
  background: rgba(#fff, 0.04);
  border: 1px solid $dark-line;

  @include from('md') {
    padding: 1.75rem 2rem;
  }

  h3 {
    font-family: $font-display;
    color: #fff;
    font-size: $text-xl;
    margin-bottom: 1rem;
    @include orange-underline(36px);
  }

  ul {
    list-style: none;

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
</style>
