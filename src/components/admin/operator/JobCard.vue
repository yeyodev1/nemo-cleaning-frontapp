<script setup lang="ts">
import { itemLabel } from '@/utils/pricing'
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import NovedadComposer from './NovedadComposer.vue'
import { operatorService } from '@/services/management.service'
import { bookingStatus } from '@/config/labels'
import { dateTime, mapsUrl, money, toCents, whatsappUrl } from '@/utils/format'
import { directionsUrl } from '@/utils/location'
import type { OperatorJob } from '@/types/api'
import type { JobStatus } from '@/composables/admin/useMyJobs'

/** Un servicio del día para el operador: a dónde ir, qué hacer y sus pasos. Sin montos. */
const props = defineProps<{ job: OperatorJob; busy: boolean; locating: boolean; isNew?: boolean }>()
const emit = defineEmits<{
  status: [status: JobStatus, payment?: { method: 'cash' | 'transfer'; cashReceived: number; handedTo?: string }]
  updated: [job: OperatorJob]
}>()
const reporting = ref(false)

// Cierre: cómo pagó el cliente y, si fue en efectivo, cuánto recibió.
const finishing = ref(false)
const payMethod = ref<'cash' | 'transfer' | ''>('')
const cashText = ref('')
const finishError = ref('')
// A quién le entrega el efectivo: gerencia o el administrador de la sucursal.
const handedTo = ref('')
const recipients = ref<{ _id: string; name: string; role: 'admin' | 'manager' }[]>([])
async function openFinish() {
  finishing.value = true
  if (!recipients.value.length) {
    try {
      recipients.value = await operatorService.recipients(props.job._id)
      if (recipients.value.length === 1) handedTo.value = recipients.value[0]!._id
    } catch {
      recipients.value = []
    }
  }
}

function finish() {
  finishError.value = ''
  if (!payMethod.value) return void (finishError.value = 'Elige cómo pagó el cliente')
  let cashReceived = 0
  if (payMethod.value === 'cash') {
    const n = Number(cashText.value.replace(',', '.'))
    if (!cashText.value.trim() || !Number.isFinite(n) || n < 0) return void (finishError.value = 'Escribe cuánto efectivo recibiste')
    cashReceived = toCents(n)
    if (!handedTo.value) return void (finishError.value = 'Elige a quién le entregas el efectivo')
  }
  emit('status', 'completed', { method: payMethod.value, cashReceived, handedTo: payMethod.value === 'cash' ? handedTo.value : undefined })
}

// Con GPS del cliente va directo al punto (indicaciones de manejo), no a la dirección escrita.
const navUrl = computed(() => directionsUrl(props.job.location) || mapsUrl(props.job.address))
const hasPoint = computed(() => props.job.location?.lat != null || !!props.job.location?.url)
const done = computed(() => ['completed', 'cancelled', 'no_show'].includes(props.job.status))
const canGo = computed(() => ['pending', 'confirmed'].includes(props.job.status))
const canStart = computed(() => ['pending', 'confirmed', 'on_the_way'].includes(props.job.status))
const canFinish = computed(() => props.job.status === 'in_progress')
const startedAt = computed(() => (props.job.startCheck ? dateTime(props.job.startCheck.at).split(', ').pop() : ''))

function onSaved(job: OperatorJob) {
  emit('updated', job)
  reporting.value = false
}
</script>

<template>
  <article class="job" :class="{ 'job--done': done, 'job--new': isNew }">
    <header class="job__head">
      <span class="job__time"><AppIcon name="clock" :size="22" /> {{ job.time }} <span v-if="isNew" class="job__new">Nuevo</span></span>
      <StatusBadge dot :tone="bookingStatus[job.status].tone" :label="bookingStatus[job.status].label" />
    </header>

    <div class="job__who">
      <strong>{{ job.customer?.name }}</strong>
      <span class="muted">{{ job.zone ? `${job.zone} · ` : '' }}{{ job.code }}</span>
    </div>

    <!-- 1. A dónde ir -->
    <a :href="navUrl" target="_blank" rel="noopener" class="job__addr" :class="{ 'job__addr--gps': hasPoint }">
      <AppIcon :name="hasPoint ? 'navigation' : 'pin'" :size="22" />
      <span>
        <b>{{ hasPoint ? 'Abrir mapa: cómo llegar al punto' : 'Abrir mapa' }}</b>
        {{ job.address }}
        <small v-if="job.reference">Referencia: {{ job.reference }}</small>
      </span>
      <AppIcon name="external" :size="16" />
    </a>

    <div v-if="job.customer?.phone" class="job__contact">
      <a :href="`tel:${job.customer.phone}`" class="btn btn--ghost"><AppIcon name="phone" /> Llamar</a>
      <a :href="whatsappUrl(job.customer.phone, `Hola ${job.customer.name}, soy de Nemo Cleaning por tu servicio de hoy a las ${job.time}.`)" target="_blank" rel="noopener" class="btn btn--whatsapp"><AppIcon name="whatsapp" /> WhatsApp</a>
    </div>

    <!-- 2. Qué hacer -->
    <section class="job__todo">
      <h3>Servicio</h3>
      <ul class="job__items">
        <li v-for="(i, n) in job.items" :key="n"><AppIcon name="check" :size="16" /> {{ itemLabel(i) }}</li>
      </ul>
      <p v-if="job.notes" class="job__notes"><AppIcon name="info" :size="18" /> <span><b>Instrucciones:</b> {{ job.notes }}</span></p>
      <p v-if="job.operators.length > 1" class="job__team">Con: {{ job.operators.map((o) => o.name).join(', ') }}</p>
    </section>

    <!-- 3. Pasos -->
    <p v-if="job.startCheck" class="job__started"><AppIcon name="check-circle" :size="18" /> Iniciado a las {{ startedAt }} · ubicación marcada</p>
    <template v-if="!done">
      <p v-if="canStart && !job.startCheck" class="job__tip"><AppIcon name="locate" :size="16" /> Al tocar <b>Iniciar</b> se marca tu ubicación (solo esa vez). Ten el GPS encendido.</p>
      <div class="job__actions">
        <button type="button" class="btn btn--soft btn--lg" :disabled="busy || !canGo" @click="emit('status', 'on_the_way')"><AppIcon name="route" /> En camino</button>
        <button type="button" class="btn btn--primary btn--lg" :disabled="busy || !canStart" @click="emit('status', 'in_progress')">
          <AppIcon name="play" /> {{ locating ? 'Marcando ubicación…' : 'Iniciar' }}
        </button>
        <button type="button" class="btn btn--accent btn--lg" :disabled="busy || !canFinish" @click="openFinish"><AppIcon name="check" /> Terminar</button>
      </div>

      <div v-if="finishing && canFinish" class="job__finish">
        <h3>Terminar servicio</h3>
        <span class="field__label">¿Cómo pagó el cliente?</span>
        <div class="job__paychoice" role="radiogroup" aria-label="Forma de pago">
          <label class="job__pay" :class="{ 'is-on': payMethod === 'cash' }">
            <input v-model="payMethod" type="radio" value="cash" class="sr-only" /> <AppIcon name="cash" /> Efectivo
          </label>
          <label class="job__pay" :class="{ 'is-on': payMethod === 'transfer' }">
            <input v-model="payMethod" type="radio" value="transfer" class="sr-only" /> <AppIcon name="bank" /> Transferencia
          </label>
        </div>
        <label v-if="payMethod === 'cash'" class="field">
          <span class="field__label">¿Cuánto efectivo recibiste? (USD)</span>
          <input v-model="cashText" type="text" inputmode="decimal" placeholder="0.00" autofocus />
        </label>
        <div v-if="payMethod === 'cash'" class="field">
          <span class="field__label">¿A quién le entregas el efectivo?</span>
          <div class="job__paychoice job__paychoice--wrap" role="radiogroup" aria-label="Quién recibe el efectivo">
            <button
              v-for="r in recipients"
              :key="r._id"
              type="button"
              class="job__pay"
              :class="{ 'is-on': handedTo === r._id }"
              role="radio"
              :aria-checked="handedTo === r._id"
              @click="handedTo = r._id"
            >
              <AppIcon name="user" :size="18" /> {{ r.name }} <small>{{ r.role === 'admin' ? 'Gerencia' : 'Administrador' }}</small>
            </button>
          </div>
          <span v-if="!recipients.length" class="field__hint">No hay administradores en tu sucursal: avisa a la oficina.</span>
        </div>
        <p v-if="payMethod === 'transfer'" class="job__tip">La oficina confirma la transferencia. No necesitas foto.</p>
        <p v-if="finishError" class="job__err" role="alert"><AppIcon name="alert" :size="16" /> {{ finishError }}</p>
        <div class="job__finish-actions">
          <button type="button" class="btn btn--ghost" @click="finishing = false">Cancelar</button>
          <button type="button" class="btn btn--accent" :disabled="busy" @click="finish"><AppIcon name="check" /> {{ busy ? 'Guardando…' : 'Terminar servicio' }}</button>
        </div>
      </div>
    </template>
    <p v-if="job.closeReport" class="job__closed">
      <AppIcon name="check-circle" :size="18" />
      {{ job.closeReport.method === 'cash' ? `Cobraste en efectivo: ${money(job.closeReport.cashReceived)}${job.closeReport.handedTo ? ` · lo entregas a ${job.closeReport.handedTo}` : ''}` : 'El cliente pagó por transferencia' }}
      <small v-if="job.closeReport.method === 'cash'" class="job__recv" :class="{ 'is-ok': job.closeReport.received }">{{ job.closeReport.received ? 'Recibido por la oficina ✓' : 'Pendiente de entregar' }}</small>
    </p>

    <!-- 4. Novedades con fotos -->
    <section class="job__nov">
      <ul v-if="job.novedades.length" class="job__novlist">
        <li v-for="n in job.novedades" :key="n._id">
          <p v-if="n.text">{{ n.text }}</p>
          <div v-if="n.photos.length" class="job__pics">
            <a v-for="p in n.photos" :key="p" :href="p" target="_blank" rel="noopener"><img :src="p" alt="Foto de la novedad" loading="lazy" /></a>
          </div>
          <small>{{ n.by }} · {{ dateTime(n.at) }}</small>
        </li>
      </ul>
      <NovedadComposer v-if="reporting" :job="job" @saved="onSaved" @close="reporting = false" />
      <button v-else-if="!['cancelled', 'no_show'].includes(job.status)" type="button" class="btn btn--ghost job__report" @click="reporting = true">
        <AppIcon name="camera" /> Reportar novedad con fotos
      </button>
    </section>
  </article>
</template>

<style scoped lang="scss">
.job {
  @include card(1.1rem);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  box-shadow: $shadow-sm;
  scroll-margin-top: 90px;

  &--done {
    opacity: 0.8;
  }

  &--new {
    box-shadow: 0 0 0 2px $orange;
  }

  &__new {
    padding: 0.15rem 0.55rem;
    border-radius: $radius-pill;
    background: $orange;
    color: $navy-ink;
    font-size: $text-xs;
    font-weight: 800;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__time {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: $display-sm;
    font-weight: 800;
    color: $navy;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  &__who {
    display: flex;
    flex-direction: column;

    strong {
      font-size: $text-lg;
    }

    span {
      font-size: $text-xs;
      font-weight: 700;
    }
  }

  &__addr {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: $tap-lg;
    padding: 0.8rem 0.9rem;
    border-radius: $radius-md;
    background: $navy-soft;
    color: $navy;
    font-size: $text-sm;

    span {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    b {
      font-size: $text-base;
    }

    small {
      color: $ink-soft;
    }

    &--gps {
      background: $navy;
      color: #fff;

      small {
        color: rgb(255 255 255 / 0.8);
      }
    }
  }

  &__contact {
    display: flex;
    gap: 0.5rem;

    .btn {
      flex: 1;
    }
  }

  &__todo {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h3 {
      font-size: $text-xs;
      text-transform: uppercase;
      color: $ink-muted;
    }
  }

  &__items {
    list-style: none;
    font-size: $text-base;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    li {
      display: flex;
      align-items: center;
      gap: 0.4rem;

      svg {
        color: $success;
      }
    }
  }

  &__notes {
    display: flex;
    gap: 0.5rem;
    padding: 0.7rem 0.85rem;
    border-radius: $radius-sm;
    background: $warning-bg;
    font-size: $text-sm;

    svg {
      flex-shrink: 0;
    }
  }

  &__team {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__started {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $success;
  }

  &__tip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: $text-xs;
    color: $ink-soft;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    @include from('sm') {
      flex-direction: row;

      .btn {
        flex: 1;
      }
    }
  }

  &__finish {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.9rem;
    border-radius: $radius-md;
    border: 2px solid $navy;

    h3 {
      font-size: $text-base;
      color: $navy;
    }
  }

  &__paychoice {
    display: flex;
    gap: 0.5rem;
  }

  &__pay {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: $tap-lg;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    font-weight: 700;
    cursor: pointer;

    &.is-on {
      border-color: $navy;
      background: $navy-soft;
      color: $navy;
    }

    &:focus-within {
      outline: 2.5px solid $orange-deep;
      outline-offset: 2px;
    }
  }

  &__paychoice--wrap {
    flex-wrap: wrap;

    .job__pay {
      flex: 1 1 160px;
      flex-direction: column;
      gap: 0.1rem;
      padding: 0.4rem;

      small {
        font-size: $text-xs;
        font-weight: 500;
        color: $ink-muted;
      }
    }
  }

  &__recv {
    padding: 0.1rem 0.5rem;
    border-radius: $radius-pill;
    background: $warning-bg;
    color: $warning;
    font-size: $text-xs;

    &.is-ok {
      background: $success-bg;
      color: $success;
    }
  }

  &__err {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: $text-sm;
    font-weight: 600;
    color: $danger;
  }

  &__finish-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  &__closed {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
  }

  &__nov {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding-top: 0.75rem;
    border-top: 1px solid $line;
  }

  &__novlist {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    li {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.6rem 0.75rem;
      border-radius: $radius-sm;
      background: $orange-soft;
      font-size: $text-sm;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__pics {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 0.4rem;

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 6px;
    }
  }

  &__report {
    min-height: $tap-lg;
    border: 2px dashed $orange-ink;
    color: $orange-ink;
    font-weight: 700;
  }
}
</style>
