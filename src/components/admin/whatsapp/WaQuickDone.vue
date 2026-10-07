<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AnimatedCheck from '@/components/booking/AnimatedCheck.vue'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { money, shortDate, whatsappUrl } from '@/utils/format'
import { confirmationMessage, copyText } from '@/utils/whatsapp'
import type { WaOrder } from '@/types/whatsapp'

/** Pedido rápido guardado: confirmación al cliente por WhatsApp y siguiente pedido. */
const props = defineProps<{ order: WaOrder; paid: boolean }>()
const emit = defineEmits<{ again: [] }>()
const scope = useAdminScope()
const toast = useToastStore()

const paymentText = computed(() => {
  const o = props.order
  if (props.paid || o.paymentStatus === 'paid') return `Pagado${o.paymentAccount ? ` (${o.paymentAccount})` : ''}`
  if (o.paymentMethod === 'whatsapp' || !o.paymentAccount) return 'Por coordinar'
  if (/^(plan mensual|canje|cortes[ií]a)$/i.test(o.paymentAccount)) return o.paymentAccount
  return `${o.paymentAccount} (pendiente)`
})
const text = computed(() =>
  confirmationMessage({
    code: props.order.code,
    items: props.order.items,
    date: props.order.date,
    time: props.order.time,
    total: props.order.total,
    branchName: scope.branchName(props.order.branch),
    address: props.order.address,
    reference: props.order.reference,
    zone: props.order.zone,
    customerName: props.order.customer?.name,
    trackingUrl: props.order.trackingUrl,
    paymentText: paymentText.value,
  }),
)
const url = computed(() => whatsappUrl(props.order.customer?.phone, text.value))

async function copy() {
  if (await copyText(text.value)) toast.success('Mensaje copiado')
  else toast.error('No se pudo copiar el mensaje')
}
</script>

<template>
  <section class="wqd card">
    <AnimatedCheck />
    <h2 class="wqd__title">Pedido guardado</h2>
    <p class="wqd__code">{{ order.code }}</p>
    <p class="wqd__facts">
      {{ order.customer?.name }} · <span class="cap">{{ shortDate(order.date) }}</span> {{ order.time }} ·
      <strong class="money">{{ money(order.total) }}</strong> · {{ paymentText }}
    </p>
    <a :href="url" target="_blank" rel="noopener" class="btn btn--whatsapp btn--lg btn--block">
      <AppIcon name="whatsapp" /> Enviar confirmación por WhatsApp
    </a>
    <button type="button" class="btn btn--ghost btn--sm" @click="copy"><AppIcon name="copy" :size="16" /> Copiar el mensaje</button>
    <pre class="wqd__preview">{{ text }}</pre>
    <div class="wqd__actions">
      <button type="button" class="btn btn--primary btn--block" @click="emit('again')"><AppIcon name="plus" /> Nuevo pedido</button>
      <RouterLink to="/admin/whatsapp" class="btn btn--ghost btn--block">Ir a Pedidos por WhatsApp</RouterLink>
      <RouterLink :to="`/admin/pedidos/${order._id}`" class="wqd__link">Ver el pedido completo</RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.wqd {
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  animation: wqd-in $dur-slow $ease-out both;

  &__title {
    @include display($display-sm);
  }

  &__code {
    font-weight: 800;
    letter-spacing: 0.1em;
    padding: 0.35rem 1rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
  }

  &__facts {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__preview {
    align-self: stretch;
    max-height: 180px;
    overflow: auto;
    padding: 0.75rem;
    border-radius: $radius-md;
    background: $whatsapp-soft;
    color: $ink;
    font-family: $font-ui;
    font-size: $text-xs;
    text-align: left;
    white-space: pre-wrap;
  }

  &__actions {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__link {
    font-size: $text-sm;
    color: $navy;
    text-decoration: underline;
  }
}

.cap {
  text-transform: capitalize;
}

@keyframes wqd-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
