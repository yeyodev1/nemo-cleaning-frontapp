<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { useCatalogStore } from '@/stores/catalog'
import { intlPhone, mapsUrl, whatsappUrl } from '@/utils/format'

const catalog = useCatalogStore()

interface BranchCard {
  key: string
  name: string
  address?: string
  phone?: string
  whatsapp?: string
  hours?: string
}

// Sin API se muestran los nombres de las sucursales, sin datos de contacto inventados.
const fallback: BranchCard[] = [
  { key: 'samborondon', name: 'Samborondón' },
  { key: 'via-a-la-costa', name: 'Vía a la Costa' },
]

const branches = computed<BranchCard[]>(() =>
  catalog.branches.length
    ? catalog.branches.map((b) => ({
        key: b._id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        whatsapp: b.whatsapp,
        hours: b.openingTime && b.closingTime ? `${b.openingTime} a ${b.closingTime}` : undefined,
      }))
    : fallback,
)
</script>

<template>
  <section id="sucursales" class="branches" aria-labelledby="branches-title">
    <div class="branches__inner">
      <SectionHead
        id="branches-title"
        eyebrow="Sucursales"
        title="Dos sucursales para llegar más rápido a ti"
        text="Cubrimos Guayaquil, Samborondón y Vía a la Costa. Elige la más cercana al reservar."
      />
      <ul class="branches__list">
        <li v-for="(b, i) in branches" :key="b.key" v-reveal="i * 80" class="branch">
          <span class="branch__pin"><AppIcon name="pin" :size="22" /></span>
          <div class="branch__body">
            <h3>{{ b.name }}</h3>
            <p v-if="b.address">{{ b.address }}</p>
            <p v-if="b.hours" class="branch__hours"><AppIcon name="clock" :size="15" /> {{ b.hours }}</p>
            <div class="branch__actions">
              <a v-if="b.whatsapp" :href="whatsappUrl(b.whatsapp, 'Hola Nemo, quiero información')" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">
                <AppIcon name="whatsapp" /> WhatsApp
              </a>
              <a v-if="b.phone" :href="`tel:+${intlPhone(b.phone)}`" class="btn btn--ghost btn--sm">
                <AppIcon name="phone" /> Llamar
              </a>
              <a v-if="b.address" :href="mapsUrl(b.address)" target="_blank" rel="noopener" class="btn btn--soft btn--sm">
                <AppIcon name="external" /> Mapa
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.branches {
  padding: $space-section 0;
  background: $sky;

  &__inner {
    @include container;
  }

  &__list {
    list-style: none;
    @include flex-cards(300px, 1rem);
  }
}

.branch {
  display: flex;
  gap: 1rem;
  padding: 1.35rem;
  border-radius: $radius-lg;
  background: #fff;
  border: 1px solid $line;
  box-shadow: $shadow-sm;

  &__pin {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $aqua-soft;
    color: $aqua-ink;
  }

  &__body {
    min-width: 0;

    h3 {
      font-size: $text-xl;
    }

    p {
      color: $ink-soft;
      font-size: $text-sm;
      margin-top: 0.25rem;
    }
  }

  &__hours {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  &__actions {
    margin-top: 0.9rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .btn--sm {
      min-height: $tap;
    }
  }
}
</style>
