<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { paymentMethods } from '@/config/landing'
</script>

<template>
  <section class="pay" aria-labelledby="pay-title">
    <div class="pay__inner">
      <SectionHead id="pay-title" eyebrow="Formas de pago" title="Paga como prefieras" />
      <ul class="pay__list">
        <li v-for="(m, i) in paymentMethods" :key="m.title" v-reveal="i * 70" class="method">
          <span class="method__icon"><AppIcon :name="m.icon" :size="24" /></span>
          <div>
            <h3>{{ m.title }}</h3>
            <p>{{ m.text }}</p>
          </div>
        </li>
      </ul>
      <p class="pay__note"><AppIcon name="lock" :size="16" /> Los pagos con tarjeta se procesan de forma segura con Payphone. Nunca guardamos los datos de tu tarjeta.</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pay {
  padding: $space-section 0;

  &__inner {
    @include container;
  }

  &__list {
    list-style: none;
    @include flex-cards(260px, 1rem);
  }

  &__note {
    margin-top: 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    font-size: $text-sm;
    color: $ink-muted;

    svg {
      margin-top: 0.2rem;
      color: $success;
    }
  }
}

.method {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1.2rem;
  border-radius: $radius-md;
  border: 1px solid $line;
  background: #fff;

  &__icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy-soft;
    color: $navy;
  }

  h3 {
    font-size: $text-lg;
  }

  p {
    font-size: $text-sm;
    color: $ink-soft;
    margin-top: 0.2rem;
  }
}
</style>
