<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { money } from '@/utils/format'
import type { OfficeEstimate } from '@/composables/office/officePricing'

/** Resumen de la cotización: tarjeta lateral en escritorio, barra fija inferior en móvil. */
defineProps<{ preview: OfficeEstimate | null; sending: boolean }>()
const emit = defineEmits<{ submit: [] }>()
const expanded = ref(false)
</script>

<template>
  <aside class="sum" :class="{ 'is-open': expanded }" aria-label="Resumen de la cotización">
    <button type="button" class="sum__toggle" :aria-expanded="expanded" @click="expanded = !expanded">
      <span>
        <small>Estimado</small>
        <strong class="money">{{ preview ? money(preview.estimate) : '—' }}</strong>
      </span>
      <AppIcon name="chevron-down" class="sum__chev" />
    </button>

    <div class="sum__body">
      <h2 class="sum__title">Tu estimado</h2>
      <p v-if="!preview" class="sum__empty">Calcularemos tu estimado al cargar las tarifas.</p>
      <template v-else>
        <ul class="sum__lines">
          <li v-for="l in preview.breakdown" :key="l.label">
            <span>{{ l.label }}</span>
            <span class="money" :class="{ 'is-neg': l.amount < 0 }">{{ money(l.amount) }}</span>
          </li>
          <li v-if="!preview.breakdown.length" class="sum__empty">Completa los datos de tu oficina.</li>
        </ul>
        <p class="sum__total"><span>Total estimado</span><strong class="money">{{ money(preview.estimate) }}</strong></p>
        <p class="sum__note">Valor referencial por visita. Te confirmamos el precio final al enviar.</p>
      </template>
    </div>

    <button type="button" class="btn btn--primary btn--lg btn--block sum__cta" :disabled="sending" @click="emit('submit')">
      {{ sending ? 'Enviando…' : 'Enviar cotización' }}
      <AppIcon v-if="!sending" name="arrow-right" />
    </button>
  </aside>
</template>

<style scoped lang="scss">
.sum {
  position: fixed;
  inset: auto 0 0;
  z-index: 40;
  background: #fff;
  border-top: 1px solid $line;
  box-shadow: 0 -10px 30px rgba($navy-ink, 0.1);
  padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
  border-radius: $radius-lg $radius-lg 0 0;

  @include from('lg') {
    position: sticky;
    top: calc(var(--header-h) + 1.5rem);
    inset: auto;
    border: 1px solid $line;
    border-radius: $radius-lg;
    box-shadow: $shadow-md;
    padding: 1.4rem;
  }

  &__toggle {
    width: 100%;
    min-height: $tap;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;
    text-align: left;

    span {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
      font-weight: 700;
    }

    strong {
      font-size: $text-xl;
      color: $navy;
    }

    @include from('lg') {
      display: none;
    }
  }

  &__chev {
    transition: transform 0.25s $ease;
  }

  &.is-open &__chev {
    transform: rotate(180deg);
  }

  &__body {
    display: none;
    max-height: 45dvh;
    overflow-y: auto;
    padding-bottom: 0.75rem;

    @include from('lg') {
      display: block;
      max-height: none;
    }
  }

  &.is-open &__body {
    display: block;
  }

  &__title {
    font-size: $text-lg;
    margin-bottom: 0.75rem;
  }

  &__lines {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    font-size: $text-sm;

    li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      color: $ink-soft;
    }

    .is-neg {
      color: $success;
    }
  }

  &__total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px dashed $line-strong;
    font-weight: 700;

    strong {
      font-size: $text-xl;
      color: $navy;
    }
  }

  &__note,
  &__empty {
    margin-top: 0.5rem;
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
