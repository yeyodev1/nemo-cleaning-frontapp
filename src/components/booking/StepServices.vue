<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ServicePicker from './ServicePicker.vue'
import { useCatalogStore } from '@/stores/catalog'
import { draft } from '@/composables/booking/useBookingDraft'
import { serviceCategory } from '@/config/labels'
import type { ServiceCategory } from '@/types/api'

const route = useRoute()
const catalog = useCatalogStore()

// /reservar?categoria=colchones abre el selector en esa categoría.
const initial = computed<ServiceCategory | ''>(() => {
  const c = String(route.query.categoria || '')
  return c in serviceCategory ? (c as ServiceCategory) : ''
})
// Las oficinas se cotizan aparte; no se reservan como servicio suelto.
const services = computed(() => catalog.services.filter((s) => s.category !== 'oficinas'))
</script>

<template>
  <div class="services">
    <div v-if="catalog.loading && !catalog.services.length" class="services__loading">
      <span v-for="n in 4" :key="n" class="skeleton"></span>
    </div>
    <ServicePicker v-else v-model="draft.cart" :services="services" :initial-category="initial" />
    <RouterLink to="/cotizar-oficina" class="services__office">
      ¿Es una oficina? <strong>Cotízala aquí en 1 minuto</strong>
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
.services {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__loading {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    .skeleton {
      height: 78px;
    }
  }

  &__office {
    align-self: flex-start;
    min-height: $tap;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: $text-sm;
    color: $ink-soft;

    strong {
      color: $navy;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
}
</style>
