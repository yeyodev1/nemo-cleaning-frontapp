<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { bookingStatus, paymentMethod } from '@/config/labels'
import { mapsUrl, money, whatsappUrl } from '@/utils/format'
import type { Booking } from '@/types/api'
import type { JobStatus } from '@/composables/admin/useMyJobs'

const props = defineProps<{ job: Booking; busy: boolean }>()
const emit = defineEmits<{ status: [status: JobStatus, note?: string] }>()
const note = ref('')
const showNote = ref(false)

const done = computed(() => ['completed', 'cancelled', 'no_show'].includes(props.job.status))
const canGo = computed(() => ['pending', 'confirmed'].includes(props.job.status))
const canStart = computed(() => ['pending', 'confirmed', 'on_the_way'].includes(props.job.status))
const canFinish = computed(() => props.job.status === 'in_progress')

function send(status: JobStatus) {
  emit('status', status, note.value.trim() || undefined)
  note.value = ''
  showNote.value = false
}
</script>

<template>
  <article class="job" :class="{ 'job--done': done }">
    <header class="job__head">
      <span class="job__time">{{ job.time }}</span>
      <StatusBadge dot :tone="bookingStatus[job.status].tone" :label="bookingStatus[job.status].label" />
    </header>

    <div class="job__who">
      <strong>{{ job.customer?.name }}</strong>
      <span class="muted">{{ job.code }}</span>
    </div>

    <a :href="mapsUrl(job.address)" target="_blank" rel="noopener" class="job__addr">
      <AppIcon name="pin" :size="20" />
      <span>{{ job.address }}<small v-if="job.reference">{{ job.reference }}</small></span>
      <AppIcon name="external" :size="16" />
    </a>

    <div v-if="job.customer?.phone" class="job__contact">
      <a :href="`tel:${job.customer.phone}`" class="btn btn--ghost"><AppIcon name="phone" /> Llamar</a>
      <a :href="whatsappUrl(job.customer.phone, `Hola ${job.customer.name}, soy de Nemo Cleaning por tu servicio de hoy a las ${job.time}.`)" target="_blank" rel="noopener" class="btn btn--whatsapp"><AppIcon name="whatsapp" /> WhatsApp</a>
    </div>

    <ul class="job__items">
      <li v-for="i in job.items" :key="i.service"><strong>{{ i.quantity }}×</strong> {{ i.name }}</li>
    </ul>
    <p v-if="job.notes" class="job__notes"><AppIcon name="info" :size="16" /> {{ job.notes }}</p>
    <p v-if="job.balance > 0" class="job__due">Cobrar {{ money(job.balance) }} · {{ paymentMethod[job.paymentMethod] }}</p>

    <template v-if="!done">
      <button v-if="!showNote" type="button" class="job__notelink" @click="showNote = true">Agregar nota</button>
      <label v-else class="field">
        <span class="field__label">Nota</span>
        <input v-model="note" placeholder="Ej.: cliente pidió llegar 10 min tarde" />
      </label>
      <div class="job__actions">
        <button type="button" class="btn btn--soft btn--lg" :disabled="busy || !canGo" @click="send('on_the_way')"><AppIcon name="route" /> En camino</button>
        <button type="button" class="btn btn--primary btn--lg" :disabled="busy || !canStart" @click="send('in_progress')"><AppIcon name="play" /> Iniciar</button>
        <button type="button" class="btn btn--accent btn--lg" :disabled="busy || !canFinish" @click="send('completed')"><AppIcon name="check" /> Terminar</button>
      </div>
    </template>
  </article>
</template>

<style scoped lang="scss">
.job {
  @include card(1.1rem);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  box-shadow: $shadow-sm;

  &--done {
    opacity: 0.7;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__time {
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
    padding: 0.7rem 0.85rem;
    border-radius: $radius-md;
    background: $navy-soft;
    color: $navy;
    font-weight: 700;
    font-size: $text-sm;

    span {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    small {
      font-weight: 500;
      color: $ink-soft;
    }
  }

  &__contact {
    display: flex;
    gap: 0.5rem;

    .btn {
      flex: 1;
    }
  }

  &__items {
    list-style: none;
    font-size: $text-sm;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__notes {
    display: flex;
    gap: 0.45rem;
    padding: 0.6rem 0.8rem;
    border-radius: $radius-sm;
    background: $warning-bg;
    font-size: $text-sm;
  }

  &__due {
    font-weight: 800;
    color: $warning;
    font-size: $text-sm;
  }

  &__notelink {
    align-self: flex-start;
    min-height: 36px;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
    text-decoration: underline;
    text-underline-offset: 3px;
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
}
</style>
