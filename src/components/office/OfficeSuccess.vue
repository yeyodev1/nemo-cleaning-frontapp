<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { money, whatsappUrl } from '@/utils/format'
import { officePlan } from '@/config/labels'
import { site } from '@/config/site'
import type { OfficeQuote } from '@/types/api'

defineProps<{ quote: OfficeQuote }>()
const emit = defineEmits<{ again: [] }>()
</script>

<template>
  <section class="ok" aria-live="polite">
    <span class="ok__check"><AppIcon name="check" :size="34" /></span>
    <h1>¡Recibimos tu cotización!</h1>
    <p v-if="quote.estimate === null">
      Elegiste el <strong>plan mensual</strong>, que tiene tarifa especial: nuestro equipo te contactará para cotizarlo.
    </p>
    <p v-else>Te enviamos el estimado a <strong>{{ quote.contact.email }}</strong>. Te contactaremos para coordinar.</p>
    <p class="ok__code">{{ quote.code }}</p>

    <div class="ok__card">
      <p class="ok__meta">
        {{ quote.squareMeters }} m² · {{ officePlan[quote.plan] }}
      </p>
      <ul>
        <li v-for="l in quote.breakdown" :key="l.label">
          <span>{{ l.label }}</span><span class="money">{{ money(l.amount) }}</span>
        </li>
      </ul>
      <p v-if="quote.estimate !== null" class="ok__total"><span>Estimado</span><strong class="money">{{ money(quote.estimate) }}</strong></p>
      <p v-else class="ok__total"><span>Valor</span><strong>Tarifa especial</strong></p>
    </div>

    <div class="ok__actions">
      <a
        v-if="quote.estimate === null"
        :href="whatsappUrl(site.whatsapp, `Hola, envié la solicitud ${quote.code} para el plan mensual de oficinas`)"
        target="_blank"
        rel="noopener"
        class="btn btn--whatsapp btn--lg"
      >
        <AppIcon name="whatsapp" :size="18" /> Escribir por WhatsApp
      </a>
      <RouterLink to="/" class="btn btn--primary btn--lg">Volver al inicio</RouterLink>
      <button type="button" class="btn btn--ghost btn--lg" @click="emit('again')">Nueva cotización</button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ok {
  max-width: 520px;
  margin-inline: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  &__check {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $orange;
    color: $charcoal;
    box-shadow: $shadow-orange;
    animation: pop 0.5s $ease-spring both;
  }

  h1 {
    @include display($display-sm);
  }

  p {
    color: $ink-soft;
  }

  &__code {
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 0.4rem 0.9rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy !important;
  }

  &__card {
    @include card(1.2rem);
    width: 100%;
    text-align: left;

    ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: $text-sm;
    }

    li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
  }

  &__meta {
    font-size: $text-xs;
    font-weight: 700;
    margin-bottom: 0.6rem;
  }

  &__total {
    display: flex;
    justify-content: space-between;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px dashed $line-strong;

    strong {
      color: $navy;
      font-size: $text-xl;
    }
  }

  &__actions {
    margin-top: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
  }
}

@keyframes pop {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
}
</style>
