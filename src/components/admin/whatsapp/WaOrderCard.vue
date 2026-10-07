<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import { useAdminScope } from '@/stores/adminScope'
import { money, settledLabel, shortDate, timeAgo, whatsappUrl } from '@/utils/format'
import { greetingMessage } from '@/utils/whatsapp'
import type { WaOrder } from '@/types/whatsapp'

/** Tarjeta de la bandeja: lo necesario para atender sin abrir el pedido. Tocarla abre las acciones. */
const props = defineProps<{ order: WaOrder; now: number; highlight?: boolean }>()
const emit = defineEmits<{ open: [order: WaOrder] }>()
const scope = useAdminScope()

const o = computed(() => props.order)
const services = computed(() =>
  o.value.items.map((i) => `${i.name}${i.variant ? ` · ${i.variant}` : ''}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', '),
)
const chat = computed(() =>
  o.value.customer?.phone
    ? whatsappUrl(o.value.customer.phone, greetingMessage({ code: o.value.code, customerName: o.value.customer.name }))
    : '',
)
</script>

<template>
  <article class="wac" :class="{ 'wac--hi': highlight }">
    <button type="button" class="wac__main" :aria-label="`Atender ${o.code}`" @click="emit('open', o)">
      <span class="wac__top">
        <strong class="wac__code">{{ o.code }}</strong>
        <span class="wac__origin">{{ o.fromWeb ? 'Web' : 'Pedido rápido' }}</span>
        <span class="wac__ago">{{ timeAgo(o.createdAt, now) }}</span>
      </span>
      <span class="wac__who">
        <strong>{{ o.customer?.name || 'Sin nombre' }}</strong>
        <small>{{ o.customer?.phone || 'Sin teléfono' }}</small>
      </span>
      <span class="wac__services">{{ services }}</span>
      <span class="wac__meta">
        <span><AppIcon name="calendar" :size="14" /> {{ shortDate(o.date) }} · {{ o.time }}</span>
        <span v-if="scope.branchName(o.branch)"><AppIcon name="store" :size="14" /> {{ scope.branchName(o.branch) }}</span>
      </span>
      <span class="wac__foot">
        <BookingBadges :status="o.status" :payment="o.paymentStatus" :settled="settledLabel(o)" />
        <strong class="money wac__total">{{ money(o.total) }}</strong>
      </span>
    </button>
    <div class="wac__actions">
      <a v-if="chat" :href="chat" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">
        <AppIcon name="whatsapp" :size="16" /> Escribir al cliente
      </a>
      <button type="button" class="btn btn--primary btn--sm" @click="emit('open', o)">
        {{ o.status === 'pending' ? 'Atender' : 'Gestionar' }} <AppIcon name="arrow-right" :size="16" />
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
.wac {
  @include card(0);
  overflow: hidden;
  border-left: 4px solid $whatsapp;
  transition:
    box-shadow $dur $ease-out,
    transform $dur-fast $ease-out;

  &--hi {
    box-shadow: 0 0 0 3px rgba($whatsapp, 0.45), $shadow-md;
  }

  &__main {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.9rem 1rem 0.6rem;
    text-align: left;

    &:active {
      background: $sky;
    }
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: $text-xs;
  }

  &__code {
    font-size: $text-sm;
    letter-spacing: 0.04em;
    color: $navy;
  }

  &__origin {
    padding: 0.1rem 0.45rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
    font-weight: 700;
  }

  &__ago {
    margin-left: auto;
    color: $ink-muted;
    font-weight: 600;
  }

  &__who {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.15rem 0.5rem;

    small {
      color: $ink-muted;
    }
  }

  &__services {
    font-size: $text-sm;
    color: $ink-soft;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem 0.9rem;
    font-size: $text-xs;
    color: $ink-muted;

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      text-transform: capitalize;
    }
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__total {
    font-size: $text-lg;
    color: $navy;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.6rem 1rem 0.85rem;

    .btn {
      flex: 1;
      min-height: $tap;
    }
  }
}
</style>
