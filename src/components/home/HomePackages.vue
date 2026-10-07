<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { monthlyPackages } from '@/config/landing'
import { site } from '@/config/site'
import { money, whatsappUrl } from '@/utils/format'

// Aún no se contratan en línea (fase 2 = suscripciones): se piden por WhatsApp.
const sizes = monthlyPackages[0]?.prices.map((p) => p.size) ?? []
const size = ref(sizes[1] ?? sizes[0] ?? '')
const priceFor = (p: (typeof monthlyPackages)[number]) => p.prices.find((r) => r.size === size.value)?.price ?? 0
const wa = (name: string) =>
  whatsappUrl(site.whatsapp, `Hola Nemo, me interesa el paquete mensual "${name}" para vehículo ${size.value.toLowerCase()}`)
</script>

<template>
  <section id="paquetes" class="pk" aria-labelledby="pk-title">
    <div class="pk__inner">
      <SectionHead id="pk-title" light eyebrow="NEMO CAR" title="Paquetes mensuales" text="Precio mensual según el tamaño de tu vehículo. Se coordinan por WhatsApp." />

      <fieldset class="pk__sizes">
        <legend class="sr-only">Tamaño de tu vehículo</legend>
        <label v-for="s in sizes" :key="s" class="pk__size" :class="{ 'is-on': s === size }">
          <input v-model="size" type="radio" name="pk-size" :value="s" class="sr-only" />
          {{ s }}
        </label>
      </fieldset>

      <div class="pk__grid">
        <article v-for="(p, i) in monthlyPackages" :key="p.name" v-reveal="i * 120" class="pk__card" :class="{ 'pk__card--premium': i === 1 }">
          <p class="pk__kicker">Paquete {{ i + 1 }}</p>
          <h3>{{ p.name }}</h3>
          <p class="pk__price" aria-live="polite">
            <Transition name="pk-num" mode="out-in">
              <strong :key="size" class="money">{{ money(priceFor(p)) }}</strong>
            </Transition>
            <small>al mes · vehículo {{ size.toLowerCase() }}</small>
          </p>
          <p class="pk__includes"><AppIcon name="check" :size="18" /> {{ p.includes }}</p>
          <dl class="pk__all">
            <div v-for="row in p.prices" :key="row.size" :class="{ 'is-on': row.size === size }">
              <dt>{{ row.size }}</dt>
              <dd class="money">{{ money(row.price) }}</dd>
            </div>
          </dl>
          <a :href="wa(p.name)" target="_blank" rel="noopener" class="btn btn--accent btn--lg btn--block">
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
    @include container(1040px);
  }

  &__sizes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0 0 1.5rem;
    padding: 0.35rem;
    border: 1px solid $dark-line;
    border-radius: $radius-pill;
    width: fit-content;
    max-width: 100%;
    background: rgba(#fff, 0.04);
  }

  &__size {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 1rem;
    border-radius: $radius-pill;
    font-size: $text-sm;
    font-weight: 600;
    color: $on-dark-soft;
    cursor: pointer;
    transition: background-color $dur-fast ease, color $dur-fast ease;

    &.is-on {
      background: #fff;
      color: $navy;
    }

    &:focus-within {
      outline: 2px solid $orange;
      outline-offset: 2px;
    }
  }

  &__grid {
    @include flex-cards(300px, 1.25rem);
  }

  &__card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1.6rem 1.4rem;
    border-radius: 26px;
    border: 1px solid $dark-line;
    background: rgba(#fff, 0.04);
    overflow: hidden;
    transition: transform $dur-slow $ease-out, border-color $dur ease;

    @media (hover: hover) {
      &:hover {
        transform: translateY(-5px);
        border-color: rgba($orange, 0.6);
      }
    }

    &--premium {
      background:
        radial-gradient(420px 220px at 100% 0%, rgba($orange, 0.22), transparent 70%),
        linear-gradient(160deg, $navy-2, $navy);
      border-color: rgba($orange, 0.45);
    }

    h3 {
      font-family: $font-display;
      color: #fff;
      font-size: $display-sm;
      line-height: 1.1;
    }
  }

  &__kicker {
    @include eyebrow;
    color: $sky-blue;
  }

  &__price {
    display: flex;
    flex-direction: column;

    strong {
      display: inline-block;
      font-family: $font-display;
      font-size: clamp(2.6rem, 2rem + 2.5vw, 3.6rem);
      line-height: 1;
      color: $orange;
    }

    small {
      margin-top: 0.3rem;
      font-size: $text-xs;
      color: $on-dark-soft;
    }
  }

  &__includes {
    display: flex;
    gap: 0.5rem;
    padding: 0.8rem 0;
    border-block: 1px solid $dark-line;
    color: #fff;
    font-weight: 500;

    svg {
      flex-shrink: 0;
      margin-top: 3px;
      color: $sky-blue;
    }
  }

  &__all {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.25rem 1rem;
    margin-bottom: 0.4rem;

    div {
      display: flex;
      justify-content: space-between;
      padding: 0.3rem 0;
      font-size: $text-xs;
      color: $on-dark-soft;
      transition: color $dur-fast ease;

      &.is-on {
        color: #fff;
        font-weight: 600;
      }
    }
  }
}

.pk-num-enter-active,
.pk-num-leave-active {
  transition:
    opacity 180ms $ease-out,
    transform 220ms $ease-out;
}

.pk-num-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.pk-num-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
