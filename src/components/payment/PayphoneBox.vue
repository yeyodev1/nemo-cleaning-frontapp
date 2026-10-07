<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { money } from '@/utils/format'
import { usePayphoneBox } from '@/composables/booking/usePayphoneBox'
import type { PayphoneInit } from '@/types/api'

/**
 * Marco propio alrededor de la Cajita de Payphone. Con `init` se pinta de una;
 * sin él (pedido ya creado) se pide un cobro nuevo al backend.
 */
const props = defineProps<{
  code: string
  token: string
  init?: PayphoneInit | null
  amount?: number
}>()
const emit = defineEmits<{ cancel: [] }>()

const box = usePayphoneBox('pp-button')
const shown = computed(() => box.amount.value || props.amount || props.init?.amount || 0)
const clock = computed(() => {
  const s = Math.ceil(box.remaining.value / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

const restart = () => box.restart(props.code, props.token)
onMounted(() => (props.init ? box.render(props.init, props.code, props.token) : restart()))
</script>

<template>
  <section class="pp" aria-live="polite">
    <header class="pp__head">
      <div>
        <p class="pp__eyebrow">Total a pagar</p>
        <p class="pp__amount money">{{ money(shown) }}</p>
      </div>
      <span class="pp__lock"><AppIcon name="lock" :size="22" /></span>
    </header>

    <div v-if="box.status.value === 'loading' || box.status.value === 'idle'" class="pp__state">
      <span class="skeleton pp__ghost"></span>
      <span class="skeleton pp__ghost pp__ghost--short"></span>
      <p>Cargando el pago seguro…</p>
    </div>

    <div v-else-if="box.status.value === 'error'" class="pp__state pp__state--err" role="alert">
      <AppIcon name="alert" :size="26" />
      <p>{{ box.error.value }}</p>
      <button type="button" class="btn btn--primary" @click="restart">
        <AppIcon name="refresh" /> Reintentar
      </button>
    </div>

    <div v-else-if="box.status.value === 'expired'" class="pp__state" role="status">
      <AppIcon name="clock" :size="26" />
      <p>El formulario de pago venció por seguridad.</p>
      <button type="button" class="btn btn--primary" @click="restart">
        <AppIcon name="refresh" /> Nuevo intento
      </button>
    </div>

    <div v-show="box.status.value === 'ready'" class="pp__form">
      <div id="pp-button"></div>
      <p class="pp__timer">
        <AppIcon name="clock" :size="14" /> El formulario vence en {{ clock }}
      </p>
    </div>

    <footer class="pp__foot">
      <span><AppIcon name="shield" :size="16" /> Pago procesado por Payphone</span>
      <button type="button" class="pp__change" @click="emit('cancel')">Pagar después</button>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.pp {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.15rem;
  border-radius: $radius-lg;
  background: $surface;
  border: 1px solid $line;
  box-shadow: $shadow-md;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.9rem;
    border-bottom: 1px dashed $line;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__amount {
    @include display($display-sm);
  }

  &__lock {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $orange-soft;
    color: $orange-ink;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
    padding: 0.75rem 0;
    color: $ink-soft;
    font-size: $text-sm;

    > svg {
      color: $navy;
    }

    &--err > svg {
      color: $danger;
    }
  }

  &__ghost {
    width: 100%;
    height: 48px;

    &--short {
      width: 70%;
    }
  }

  &__timer {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.75rem;
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
    font-variant-numeric: tabular-nums;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    font-size: $text-xs;
    color: $ink-muted;

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    svg {
      color: $success;
    }
  }

  &__change {
    min-height: $tap;
    padding: 0 0.5rem;
    font-weight: 700;
    color: $navy;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
