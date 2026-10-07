<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { coverage } from '@/config/site'
import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
</script>

<template>
  <section id="cobertura" class="cov" aria-labelledby="cov-title">
    <div class="cov__inner">
      <SectionHead id="cov-title" eyebrow="Servicio a domicilio" title="Cobertura" />
      <div class="cov__grid">
        <ul v-reveal class="cov__zones">
          <li v-for="z in coverage.catalog" :key="z"><AppIcon name="pin" :size="20" /> {{ z }}</li>
        </ul>
        <div v-reveal="120" class="cov__side">
          <p>También atendemos: <strong>{{ coverage.linktree }}</strong>.</p>
          <p v-if="catalog.branches.length">
            Sucursales: <strong>{{ catalog.branches.map((b) => b.name).join(' y ') }}</strong>.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cov {
  background: $surface;
  padding: $space-section 0;

  &__inner {
    @include container;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    @include from('md') {
      flex-direction: row;
      align-items: center;
      gap: 2.5rem;
    }
  }

  &__zones {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;

    li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.2rem;
      border-radius: $radius-md;
      background: $navy;
      color: #fff;
      font-weight: 600;
      font-size: $text-lg;

      svg {
        color: $orange;
      }
    }
  }

  &__side {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    color: $ink-soft;

    strong {
      color: $navy;
    }
  }
}
</style>
