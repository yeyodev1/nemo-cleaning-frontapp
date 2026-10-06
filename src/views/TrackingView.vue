<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import StatusTimeline from '@/components/tracking/StatusTimeline.vue'
import TrackingItems from '@/components/tracking/TrackingItems.vue'
import TrackingPayment from '@/components/tracking/TrackingPayment.vue'
import { useTracking } from '@/composables/booking/useTracking'
import { useCatalogStore } from '@/stores/catalog'
import { bookingStatus } from '@/config/labels'
import { site } from '@/config/site'
import { longDate, whatsappUrl } from '@/utils/format'

const route = useRoute()
const code = String(route.params.code || '')
const token = String(route.query.token || '')
const catalog = useCatalogStore()
const t = useTracking(code, token)
const { booking, loading, error, busy, branch, needsPayment, canCancel } = t

const confirmOpen = ref(false)
const cancelError = ref('')

const showPay = computed(
  () =>
    needsPayment.value &&
    (booking.value?.paymentMethod !== 'cash' || !!catalog.settings?.payphoneEnabled),
)
const wa = computed(() =>
  whatsappUrl(
    branch.value?.whatsapp || site.whatsapp,
    `Hola, tengo una consulta sobre mi pedido ${code}`,
  ),
)

async function doCancel() {
  cancelError.value = await t.cancel()
  if (!cancelError.value) confirmOpen.value = false
}

onMounted(t.load)
</script>

<template>
  <section class="track">
    <div v-if="loading" class="track__loading" aria-busy="true">
      <span class="skeleton" style="height: 40px; width: 60%"></span>
      <span class="skeleton" style="height: 220px"></span>
      <span class="skeleton" style="height: 160px"></span>
    </div>

    <div v-else-if="error || !booking" class="track__error" role="alert">
      <span class="track__error-icon"><AppIcon name="search" :size="28" /></span>
      <h1>No pudimos abrir tu pedido</h1>
      <p>{{ error }}</p>
      <a :href="wa" target="_blank" rel="noopener" class="btn btn--whatsapp btn--lg"
        ><AppIcon name="whatsapp" /> Escríbenos</a
      >
      <RouterLink to="/" class="btn btn--ghost">Ir al inicio</RouterLink>
    </div>

    <template v-else>
      <header class="track__head">
        <p class="track__eyebrow">Pedido {{ booking.code }}</p>
        <h1 class="track__title">Hola, {{ booking.customer?.name?.split(' ')[0] || 'cliente' }}</h1>
        <StatusBadge
          dot
          :tone="bookingStatus[booking.status].tone"
          :label="bookingStatus[booking.status].label"
        />
      </header>

      <div class="track__grid">
        <div class="track__col">
          <section class="card track__when">
            <p>
              <AppIcon name="calendar" :size="18" />
              <strong class="track__cap">{{ longDate(booking.date) }}</strong> · {{ booking.time }}
            </p>
            <p>
              <AppIcon name="pin" :size="18" /> {{ booking.address
              }}<template v-if="booking.reference"> ({{ booking.reference }})</template>
            </p>
            <p v-if="branch"><AppIcon name="store" :size="18" /> Sucursal {{ branch.name }}</p>
          </section>
          <section class="card"><StatusTimeline :status="booking.status" /></section>
        </div>

        <div class="track__col">
          <p v-if="booking.paymentStatus === 'review'" class="track__notice" role="status">
            <AppIcon name="clock" :size="18" /> Recibimos tu comprobante. Lo estamos revisando y te
            confirmaremos por correo.
          </p>
          <TrackingPayment
            v-if="showPay"
            :booking="booking"
            :token="token"
            :busy="busy"
            :upload="t.uploadProof"
          />
          <TrackingItems :booking="booking" />
          <div class="track__actions">
            <a :href="wa" target="_blank" rel="noopener" class="btn btn--whatsapp btn--block"
              ><AppIcon name="whatsapp" /> Escribir a la sucursal</a
            >
            <button
              v-if="canCancel"
              type="button"
              class="btn btn--danger btn--block"
              @click="confirmOpen = true"
            >
              Cancelar pedido
            </button>
          </div>
        </div>
      </div>
    </template>

    <BaseSheet :open="confirmOpen" title="¿Cancelar este pedido?" @close="confirmOpen = false">
      <p>
        Liberaremos tu horario del {{ booking ? longDate(booking.date) : '' }}. Solo se puede
        cancelar con más de 12 horas de anticipación.
      </p>
      <p v-if="cancelError" class="field__error track__cerr" role="alert">{{ cancelError }}</p>
      <template #footer>
        <button type="button" class="btn btn--ghost" @click="confirmOpen = false">Volver</button>
        <button type="button" class="btn btn--danger" :disabled="busy" @click="doCancel">
          {{ busy ? 'Cancelando…' : 'Sí, cancelar' }}
        </button>
      </template>
    </BaseSheet>
  </section>
</template>

<style scoped lang="scss">
.track {
  @include container(1040px);
  padding-top: 1.5rem;
  padding-bottom: calc(3rem + env(safe-area-inset-bottom));

  &__loading,
  &__col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__error {
    max-width: 440px;
    margin: 2rem auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;

    p {
      color: $ink-soft;
    }
  }

  &__error-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy-soft;
    color: $navy;
  }

  &__head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    margin-bottom: 1.25rem;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm);
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include from('md') {
      flex-direction: row;
      align-items: flex-start;

      > * {
        flex: 1;
        min-width: 0;
      }
    }
  }

  &__when {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-size: $text-sm;

    p {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    svg {
      color: $aqua-ink;
      margin-top: 2px;
    }
  }

  &__cap {
    text-transform: capitalize;
  }

  &__notice {
    display: flex;
    gap: 0.5rem;
    padding: 0.9rem 1rem;
    border-radius: $radius-md;
    background: $info-bg;
    color: $info;
    font-size: $text-sm;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__cerr {
    margin-top: 0.75rem;
  }
}
</style>
