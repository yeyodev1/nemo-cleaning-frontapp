<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import AnimatedCheck from '@/components/booking/AnimatedCheck.vue'
import { usePaymentConfirm } from '@/composables/booking/usePaymentConfirm'
import { site } from '@/config/site'
import { whatsappUrl } from '@/utils/format'

/** /pay-response (URL de respuesta en Payphone): vuelve aquí con ?id=&clientTransactionId=. */
const route = useRoute()
const router = useRouter()
const { phase, message, code, token, confirm } = usePaymentConfirm()

const q = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
onMounted(() => confirm(q('id'), q('clientTransactionId')))

const trackTo = computed(() =>
  code.value && token.value
    ? { path: `/pedido/${code.value}`, query: { token: token.value } }
    : null,
)

// Aprobado: se muestra el check un instante y se pasa al seguimiento.
watch(phase, (p) => {
  if (p === 'approved' && trackTo.value) setTimeout(() => router.replace(trackTo.value!), 1600)
})

const title = computed(
  () =>
    ({
      confirming: 'Confirmando tu pago…',
      approved: '¡Pago aprobado!',
      rejected: 'El pago no se completó',
      error: 'No pudimos confirmar el pago',
      missing: 'Faltan datos del pago',
    })[phase.value],
)
const body = computed(() => {
  if (phase.value === 'confirming') return 'No cierres esta página, toma solo unos segundos.'
  if (phase.value === 'approved') return 'Tu pedido quedó confirmado. Te llevamos a tu seguimiento…'
  if (phase.value === 'rejected')
    return 'No se realizó ningún cobro. Puedes intentarlo de nuevo desde tu pedido.'
  if (phase.value === 'missing')
    return 'Abre esta página desde el enlace de Payphone o revisa tu pedido.'
  return message.value || 'Si se debitó el valor, escríbenos y lo resolvemos.'
})
const wa = computed(() =>
  whatsappUrl(site.whatsapp, `Hola, tengo un problema con el pago del pedido ${code.value || ''}`),
)
</script>

<template>
  <section class="pres" aria-live="polite">
    <div class="pres__card">
      <Transition name="fade" mode="out-in">
        <span v-if="phase === 'confirming'" key="spin" class="pres__orbit" aria-hidden="true">
          <span></span><AppIcon name="lock" :size="26" />
        </span>
        <AnimatedCheck v-else-if="phase === 'approved'" key="ok" />
        <span v-else key="ko" class="pres__ko" aria-hidden="true"
          ><AppIcon name="x" :size="34"
        /></span>
      </Transition>

      <h1 class="pres__title">{{ title }}</h1>
      <p class="pres__body">{{ body }}</p>
      <p v-if="code" class="pres__code">{{ code }}</p>

      <div v-if="phase !== 'confirming'" class="pres__actions">
        <RouterLink v-if="trackTo" :to="trackTo" class="btn btn--primary btn--lg btn--block">
          {{ phase === 'approved' ? 'Ver mi pedido' : 'Reintentar desde mi pedido' }}
        </RouterLink>
        <RouterLink v-else to="/reservar" class="btn btn--primary btn--lg btn--block"
          >Volver a reservar</RouterLink
        >
        <a
          v-if="phase !== 'approved'"
          :href="wa"
          target="_blank"
          rel="noopener"
          class="btn btn--ghost btn--block"
        >
          <AppIcon name="whatsapp" /> Escríbenos por WhatsApp
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pres {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem 3rem;
  min-height: calc(100dvh - var(--header-h));
  background: linear-gradient(180deg, $sky, $paper);

  &__card {
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.9rem;
    text-align: center;
  }

  &__orbit {
    position: relative;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: $navy-soft;
    color: $navy;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    span {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: $orange;
      border-right-color: rgba($orange, 0.3);
      animation: orbit 0.9s linear infinite;
    }
  }

  &__ko {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: $danger-bg;
    color: $danger;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    @include display($display-sm);
    margin-top: 0.5rem;
  }

  &__body {
    color: $ink-soft;
    font-size: $text-sm;
    max-width: 36ch;
  }

  &__code {
    font-weight: 800;
    letter-spacing: 0.1em;
    padding: 0.4rem 1rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
  }

  &__actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.75rem;
  }
}

@keyframes orbit {
  to {
    transform: rotate(360deg);
  }
}
</style>
