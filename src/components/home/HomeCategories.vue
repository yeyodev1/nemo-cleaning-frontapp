<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { landingCategories } from '@/config/landing'
import { useCatalogStore } from '@/stores/catalog'
import { money } from '@/utils/format'
import type { ServiceCategory } from '@/types/api'

const catalog = useCatalogStore()

/** Precio mínimo y servicios por categoría, solo con datos reales del catálogo. */
const byCategory = computed(() => {
  const map = new Map<ServiceCategory, { min: number; names: string[] }>()
  for (const s of catalog.mainServices) {
    const cur = map.get(s.category) || { min: Infinity, names: [] }
    cur.min = Math.min(cur.min, s.price)
    cur.names.push(s.name)
    map.set(s.category, cur)
  }
  return map
})

function linkFor(slug: ServiceCategory) {
  return slug === 'oficinas' ? '/cotizar-oficina' : { path: '/reservar', query: { categoria: slug } }
}
</script>

<template>
  <section id="servicios" class="cats" aria-labelledby="cats-title">
    <div class="cats__inner">
      <SectionHead
        id="cats-title"
        eyebrow="Servicios"
        title="Todo lo que necesitas limpiar, en un solo lugar"
        text="Elige una categoría y arma tu pedido con las cantidades exactas. Ves el precio antes de confirmar."
      />
      <ul class="cats__grid">
        <li v-for="(c, i) in landingCategories" :key="c.slug" v-reveal="i * 60">
          <RouterLink :to="linkFor(c.slug)" class="cat">
            <span class="cat__icon"><AppIcon :name="c.icon" :size="26" /></span>
            <h3 class="cat__title">{{ c.title }}</h3>
            <p class="cat__blurb">{{ c.blurb }}</p>
            <p v-if="byCategory.get(c.slug)?.names.length" class="cat__names">
              {{ byCategory.get(c.slug)!.names.slice(0, 3).join(' · ') }}
            </p>
            <span class="cat__foot">
              <span v-if="c.slug === 'oficinas'" class="cat__price">Cotización al instante</span>
              <span v-else-if="byCategory.get(c.slug)" class="cat__price money">
                desde {{ money(byCategory.get(c.slug)!.min) }}
              </span>
              <span v-else class="cat__price">Ver servicios</span>
              <span class="cat__go" aria-hidden="true"><AppIcon name="arrow-right" :size="18" /></span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cats {
  padding: $space-section 0;

  &__inner {
    @include container;
  }

  &__grid {
    list-style: none;
    @include flex-cards(300px, 1rem);
  }
}

.cat {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.35rem;
  border-radius: $radius-lg;
  background: #fff;
  border: 1px solid $line;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition:
    transform 0.25s $ease,
    box-shadow 0.25s $ease,
    border-color 0.25s;

  &::after {
    content: '';
    position: absolute;
    width: 160px;
    height: 160px;
    right: -60px;
    top: -60px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($aqua, 0.14), transparent 70%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
    border-color: rgba($aqua, 0.5);
  }

  &__icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $aqua, $navy);
    color: #fff;
    box-shadow: $shadow-aqua;
    margin-bottom: 0.4rem;
  }

  &__title {
    font-size: $text-xl;
  }

  &__blurb {
    color: $ink-soft;
    font-size: $text-sm;
  }

  &__names {
    font-size: $text-xs;
    color: $ink-muted;
    font-weight: 600;
  }

  &__foot {
    margin-top: auto;
    padding-top: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__price {
    font-weight: 800;
    color: $navy;
    font-size: $text-sm;
  }

  &__go {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy-soft;
    color: $navy;
    transition: background 0.2s, color 0.2s, transform 0.25s $ease;
  }

  &:hover &__go {
    background: $navy;
    color: #fff;
    transform: translateX(3px);
  }
}
</style>
