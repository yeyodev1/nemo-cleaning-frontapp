<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { monthlyPackages } from '@/config/landing'
import { site } from '@/config/site'
import { money, whatsappUrl } from '@/utils/format'

// Aún no se contratan en línea (fase 2 = suscripciones): se piden por WhatsApp.
const wa = (name: string) => whatsappUrl(site.whatsapp, `Hola Nemo, me interesa el paquete mensual "${name}"`)
</script>

<template>
  <section id="paquetes" class="pk" aria-labelledby="pk-title">
    <div class="pk__inner">
      <SectionHead id="pk-title" light eyebrow="NEMO CAR" title="Paquetes mensuales" text="Precio mensual según el tamaño de tu vehículo. Se coordinan por WhatsApp." />
      <div class="pk__grid">
        <article v-for="p in monthlyPackages" :key="p.name" v-reveal class="pk__card">
          <h3>{{ p.name }}</h3>
          <p class="pk__includes"><AppIcon name="check" :size="16" /> {{ p.includes }}</p>
          <dl>
            <div v-for="row in p.prices" :key="row.size">
              <dt>Vehículo {{ row.size }}</dt>
              <dd class="money">{{ money(row.price) }}</dd>
            </div>
          </dl>
          <a :href="wa(p.name)" target="_blank" rel="noopener" class="btn btn--accent btn--block">
            <AppIcon name="whatsapp" :size="18" /> Pedir por WhatsApp
          </a>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pk {
  @include dark-pattern($charcoal);
  color: $on-dark;
  padding: $space-section 0;

  &__inner {
    @include container;
  }

  &__grid {
    @include flex-cards(300px, 1.25rem);
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.4rem;
    border-radius: $radius-lg;
    border: 1px solid $dark-line;
    border-top: 3px solid $orange;
    background: rgba(#fff, 0.04);

    h3 {
      font-family: $font-display;
      color: #fff;
      font-size: $text-xl;
    }

    dl {
      display: flex;
      flex-direction: column;
      border-top: 1px solid $dark-line;
    }

    div {
      display: flex;
      justify-content: space-between;
      padding: 0.55rem 0;
      border-bottom: 1px solid $dark-line;
      font-size: $text-sm;
    }

    dt {
      color: $on-dark-soft;
    }

    dd {
      font-weight: 700;
      color: $orange;
    }
  }

  &__includes {
    display: flex;
    gap: 0.45rem;
    color: $on-dark;
    font-weight: 500;

    svg {
      flex-shrink: 0;
      margin-top: 4px;
      color: $sky-blue;
    }
  }
}
</style>
