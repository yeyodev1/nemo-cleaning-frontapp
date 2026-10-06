<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'
import type { BookingStatus } from '@/types/api'

const props = defineProps<{ status: BookingStatus }>()

const FLOW: { id: BookingStatus; label: string; text: string; icon: IconName }[] = [
  { id: 'pending', label: 'Recibido', text: 'Tenemos tu pedido.', icon: 'inbox' },
  {
    id: 'confirmed',
    label: 'Confirmado',
    text: 'Tu horario está reservado.',
    icon: 'check-circle',
  },
  { id: 'on_the_way', label: 'En camino', text: 'El equipo va hacia tu dirección.', icon: 'route' },
  { id: 'in_progress', label: 'Limpiando', text: 'Estamos trabajando.', icon: 'sparkles' },
  { id: 'completed', label: 'Terminado', text: '¡Listo y reluciente!', icon: 'star' },
]

const stopped = computed(() => props.status === 'cancelled' || props.status === 'no_show')
const current = computed(() => FLOW.findIndex((f) => f.id === props.status))
</script>

<template>
  <div v-if="stopped" class="stopped" role="status">
    <AppIcon name="ban" :size="22" />
    <div>
      <strong>{{ status === 'cancelled' ? 'Pedido cancelado' : 'Servicio no realizado' }}</strong>
      <p>
        {{
          status === 'cancelled'
            ? 'Este pedido fue cancelado.'
            : 'No pudimos realizar el servicio en la fecha acordada.'
        }}
        Escríbenos si necesitas reagendar.
      </p>
    </div>
  </div>
  <ol v-else class="timeline" aria-label="Estado del pedido">
    <li
      v-for="(f, i) in FLOW"
      :key="f.id"
      class="timeline__step"
      :class="{ 'is-done': i < current, 'is-on': i === current }"
      :aria-current="i === current ? 'step' : undefined"
    >
      <span class="timeline__dot"
        ><AppIcon :name="i < current ? 'check' : f.icon" :size="16"
      /></span>
      <span class="timeline__text">
        <strong>{{ f.label }}</strong>
        <small v-if="i === current">{{ f.text }}</small>
      </span>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.timeline {
  list-style: none;
  display: flex;
  flex-direction: column;

  &__step {
    position: relative;
    display: flex;
    gap: 0.85rem;
    padding-bottom: 1.1rem;

    &:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 17px;
      top: 36px;
      bottom: 0;
      width: 2px;
      background: $line;
    }

    &.is-done::before {
      background: $aqua;
    }
  }

  &__dot {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $sky-2;
    color: $ink-muted;
    z-index: 1;
  }

  .is-done &__dot {
    background: $aqua;
    color: $navy-ink;
  }

  .is-on &__dot {
    background: $navy;
    color: #fff;
    box-shadow: 0 0 0 6px rgba($navy, 0.14);
  }

  &__text {
    display: flex;
    flex-direction: column;
    padding-top: 6px;
    font-size: $text-sm;
    color: $ink-muted;

    small {
      color: $ink-soft;
    }
  }

  .is-done &__text,
  .is-on &__text {
    color: $ink;
  }
}

.stopped {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: $radius-md;
  background: $danger-bg;
  color: $danger;

  p {
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
