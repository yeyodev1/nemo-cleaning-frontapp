<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'
import type { Dashboard } from '@/types/api'
import { money } from '@/utils/format'

const props = defineProps<{ data: Dashboard }>()

// "Por confirmar" (transferencias en revisión) y "Por cobrar" (deuda real) van separados:
// una transferencia ya enviada no es deuda del cliente.
const alerts = computed(() => {
  const d = props.data
  const rows: { show: boolean; value: string; label: string; hint: string; to: string; icon: IconName; tone: string }[] = [
    {
      show: d.pendingTransfers > 0,
      value: money(d.toConfirm ?? 0),
      label: 'Por confirmar',
      hint: `${d.pendingTransfers} ${d.pendingTransfers === 1 ? 'transferencia por revisar' : 'transferencias por revisar'}`,
      to: '/admin/pagos',
      icon: 'bank',
      tone: 'info',
    },
    {
      show: d.receivables > 0,
      value: money(d.receivables),
      label: 'Por cobrar',
      hint: 'Servicios hechos con saldo pendiente',
      to: '/admin/finanzas/cuentas-por-cobrar',
      icon: 'wallet',
      tone: 'warning',
    },
    {
      show: d.newOfficeQuotes > 0,
      value: String(d.newOfficeQuotes),
      label: d.newOfficeQuotes === 1 ? 'Cotización nueva' : 'Cotizaciones nuevas',
      hint: 'Oficinas esperando respuesta',
      to: '/admin/cotizaciones',
      icon: 'building',
      tone: 'aqua',
    },
  ]
  return rows.filter((a) => a.show)
})
</script>

<template>
  <div v-if="alerts.length" class="alerts">
    <RouterLink v-for="a in alerts" :key="a.to" :to="a.to" class="alert" :class="`alert--${a.tone}`">
      <span class="alert__icon"><AppIcon :name="a.icon" :size="20" /></span>
      <span class="alert__text">
        <span class="alert__label">{{ a.label }}</span>
        <strong class="money">{{ a.value }}</strong>
        <small>{{ a.hint }}</small>
      </span>
      <AppIcon name="chevron-right" :size="18" />
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
.alerts {
  @include flex-cards(240px, 0.6rem);
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 64px;
  padding: 0.75rem 0.9rem;
  border-radius: $radius-md;
  font-size: $text-sm;
  font-weight: 600;
  border: 1px solid transparent;
  transition: transform $dur-fast $ease-out;

  &:active {
    transform: scale(0.98);
  }

  &__icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    border-radius: 50%;
    background: rgba(#fff, 0.7);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    strong {
      font-size: $text-lg;
      font-weight: 800;
    }

    small {
      font-weight: 500;
      font-size: $text-xs;
      opacity: 0.9;
    }
  }

  &__label {
    font-size: $text-xs;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &--info {
    background: $info-bg;
    color: $info;
  }
  &--warning {
    background: $warning-bg;
    color: $warning;
  }
  &--aqua {
    background: $orange-soft;
    color: $orange-ink;
  }
}
</style>
