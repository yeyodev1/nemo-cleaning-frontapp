<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AnimatedCheck from './AnimatedCheck.vue'
import PayphoneBox from '@/components/payment/PayphoneBox.vue'
import { longDate, money } from '@/utils/format'
import type { CreateBookingResult } from '@/types/api'
import { useCustomerStore } from '@/stores/customer'

const props = defineProps<{ result: CreateBookingResult }>()
const emit = defineEmits<{ again: [] }>()

const customer = useCustomerStore()
const b = computed(() => props.result.booking)
const paying = ref(Boolean(props.result.payment) && props.result.booking.paymentMethod === 'card')
const trackTo = computed(() => ({
  path: `/pedido/${b.value.code}`,
  query: { token: props.result.accessToken },
}))
const trackUrl = computed(
  () => `${window.location.origin}/pedido/${b.value.code}?token=${props.result.accessToken}`,
)

const next = computed(() => {
  if (b.value.paymentMethod === 'card')
    return 'Si no completaste el pago, puedes hacerlo desde el enlace de seguimiento.'
  if (b.value.paymentMethod === 'transfer')
    return 'Revisaremos tu comprobante y te confirmaremos por correo en breve.'
  return 'Paga en efectivo al equipo el día del servicio. Te enviamos el resumen por correo.'
})
</script>

<template>
  <section class="done">
    <template v-if="paying">
      <header class="done__head">
        <p class="done__eyebrow">Pedido {{ b.code }} creado</p>
        <h1 class="done__title">Completa tu pago con tarjeta</h1>
      </header>
      <PayphoneBox
        :code="b.code"
        :token="result.accessToken"
        :init="result.payment"
        @cancel="paying = false"
      />
    </template>

    <template v-else>
      <AnimatedCheck />
      <h1 class="done__title">¡Reserva recibida!</h1>
      <p class="done__code">{{ b.code }}</p>
      <dl class="done__facts">
        <div>
          <dt>Fecha</dt>
          <dd class="done__cap">{{ longDate(b.date) }}</dd>
        </div>
        <div>
          <dt>Hora</dt>
          <dd>{{ b.time }}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd class="money">{{ money(b.total) }}</dd>
        </div>
      </dl>
      <p class="done__next"><AppIcon name="info" :size="18" /> {{ next }}</p>
      <div class="done__actions">
        <RouterLink :to="trackTo" class="btn btn--primary btn--lg btn--block"
          >Ir a mi pedido <AppIcon name="arrow-right"
        /></RouterLink>
        <button type="button" class="btn btn--ghost btn--block" @click="emit('again')">
          Hacer otra reserva
        </button>
      </div>
      <p v-if="customer.isAuthenticated" class="done__link">
        También lo tienes en <RouterLink to="/mi-cuenta">Mi cuenta</RouterLink>, con el resto de tus pedidos.
      </p>
      <p v-else class="done__link">
        Guarda este enlace para ver tu pedido: <a :href="trackUrl">{{ trackUrl }}</a>
      </p>
    </template>
  </section>
</template>

<style scoped lang="scss">
.done {
  width: 100%;
  max-width: 520px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem 0 3rem;

  &__head {
    text-align: left;
    align-self: stretch;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm);
  }

  &__code {
    font-weight: 800;
    letter-spacing: 0.1em;
    padding: 0.4rem 1rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
  }

  &__facts {
    align-self: stretch;
    display: flex;
    border: 1px solid $line;
    border-radius: $radius-md;
    background: $surface;

    > div {
      flex: 1;
      padding: 0.75rem 0.5rem;

      & + div {
        border-left: 1px solid $line;
      }
    }

    dt {
      font-size: $text-xs;
      color: $ink-muted;
      font-weight: 700;
    }

    dd {
      font-weight: 800;
      font-size: $text-sm;
    }
  }

  &__cap::first-letter {
    text-transform: uppercase;
  }

  &__next {
    display: flex;
    gap: 0.5rem;
    text-align: left;
    font-size: $text-sm;
    color: $ink-soft;
    padding: 0.85rem 1rem;
    border-radius: $radius-md;
    background: $sky;

    svg {
      color: $aqua-ink;
      margin-top: 2px;
    }
  }

  &__actions {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__link {
    font-size: $text-xs;
    color: $ink-muted;
    word-break: break-all;

    a {
      color: $navy;
      text-decoration: underline;
    }
  }
}
</style>
