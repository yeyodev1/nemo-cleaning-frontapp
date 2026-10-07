<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'
import type { Dashboard } from '@/types/api'

const props = defineProps<{ data: Dashboard }>()

const alerts = computed(() =>
  (
    [
      { n: props.data.pendingTransfers, label: props.data.pendingTransfers === 1 ? 'transferencia por revisar' : 'transferencias por revisar', to: '/admin/pagos', icon: 'bank', tone: 'info' },
      { n: props.data.receivables, label: props.data.receivables === 1 ? 'pedido con saldo por cobrar' : 'pedidos con saldo por cobrar', to: '/admin/pagos?tab=cxc', icon: 'wallet', tone: 'warning' },
      { n: props.data.newOfficeQuotes, label: props.data.newOfficeQuotes === 1 ? 'cotización de oficina nueva' : 'cotizaciones de oficina nuevas', to: '/admin/cotizaciones', icon: 'building', tone: 'aqua' },
    ] as { n: number; label: string; to: string; icon: IconName; tone: string }[]
  ).filter((a) => a.n > 0),
)
</script>

<template>
  <div v-if="alerts.length" class="alerts">
    <RouterLink v-for="a in alerts" :key="a.to" :to="a.to" class="alert" :class="`alert--${a.tone}`">
      <span class="alert__icon"><AppIcon :name="a.icon" :size="20" /></span>
      <span class="alert__text"><strong>{{ a.n }}</strong> {{ a.label }}</span>
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
  min-height: 56px;
  padding: 0.7rem 0.9rem;
  border-radius: $radius-md;
  font-size: $text-sm;
  font-weight: 600;
  border: 1px solid transparent;

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(#fff, 0.7);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    flex: 1;

    strong {
      font-size: $text-base;
      margin-right: 0.15rem;
    }
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
