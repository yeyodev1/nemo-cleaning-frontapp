<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import NovedadForm from './NovedadForm.vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { paymentConfirmation } from '@/config/operationLabels'
import { dateTime, errorMessage, money } from '@/utils/format'
import type { Booking, Novedad } from '@/types/api'

/** Datos de la Base en el pedido (urbanización, cuenta, confirmación, propina) y sus novedades. */
const props = defineProps<{ booking: Booking }>()
const emit = defineEmits<{ changed: [] }>()
const toast = useToastStore()
const adding = ref(false)
const removing = ref<Novedad | null>(null)
const busy = ref(false)
const opName = (id: string | null) => props.booking.operators.find((o) => o._id === id)?.name

async function remove() {
  if (!removing.value) return
  busy.value = true
  try {
    await operationService.deleteNovedad(props.booking._id, removing.value._id)
    toast.success('Novedad eliminada')
    removing.value = null
    emit('changed')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="card dop">
    <h2>Base de producción</h2>
    <dl class="dop__grid">
      <div><dt>Urbanización</dt><dd>{{ booking.zone || '—' }}</dd></div>
      <div><dt>Forma de pago</dt><dd>{{ booking.paymentAccount || '—' }}</dd></div>
      <div>
        <dt>Confirmación</dt>
        <dd><StatusBadge v-if="booking.paymentConfirmation" :tone="paymentConfirmation[booking.paymentConfirmation].tone" :label="paymentConfirmation[booking.paymentConfirmation].label" /></dd>
      </div>
      <div><dt>Propina</dt><dd class="money">{{ booking.tip ? money(booking.tip) : '—' }}</dd></div>
    </dl>

    <h3>Novedades</h3>
    <ul v-if="booking.novedades?.length" class="dop__list">
      <li v-for="n in booking.novedades" :key="n._id">
        <p>{{ n.text }}</p>
        <small>{{ opName(n.operator) ? `${opName(n.operator)} · ` : '' }}{{ n.by?.name }} · {{ dateTime(n.at) }}</small>
        <button type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar novedad" @click="removing = n"><AppIcon name="trash" :size="16" /></button>
      </li>
    </ul>
    <p v-else class="dop__empty">Sin novedades.</p>
    <NovedadForm v-if="adding" :booking-id="booking._id" :operators="booking.operators" @saved="adding = false; emit('changed')" />
    <button v-else type="button" class="btn btn--soft btn--sm dop__add" @click="adding = true"><AppIcon name="plus" :size="16" /> Anotar novedad</button>

    <ConfirmSheet :open="!!removing" title="Eliminar novedad" :message="removing ? `Se borra: “${removing.text}”.` : ''" confirm-label="Eliminar" danger :busy="busy" @close="removing = null" @confirm="remove" />
  </section>
</template>

<style scoped lang="scss">
.dop {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h2 {
    font-size: $text-base;
    color: $navy;
  }

  h3 {
    font-size: $text-sm;
    color: $navy;
    padding-top: 0.6rem;
    border-top: 1px solid $line;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;

    dt {
      font-size: $text-xs;
      color: $ink-muted;
      font-weight: 600;
    }

    dd {
      font-size: $text-sm;
      font-weight: 600;
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    li {
      position: relative;
      padding: 0.6rem 2.8rem 0.6rem 0.75rem;
      border-radius: $radius-md;
      background: $warning-bg;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }

    .btn {
      position: absolute;
      top: 0.2rem;
      right: 0.2rem;
    }
  }

  &__empty {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__add {
    align-self: flex-start;
  }
}
</style>
