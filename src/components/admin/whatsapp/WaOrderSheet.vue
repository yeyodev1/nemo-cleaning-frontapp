<script setup lang="ts">
import { computed, toRef } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import WaPaymentFields from './WaPaymentFields.vue'
import { useWaOrderSheet } from '@/composables/whatsapp/useWaOrderSheet'
import { useAdminScope } from '@/stores/adminScope'
import { money, settledLabel, shortDate } from '@/utils/format'
import type { WaOrder } from '@/types/whatsapp'

/** Hoja de acciones del pedido: todo sin salir de la bandeja (en el celular, hoja inferior). */
const props = defineProps<{ order: WaOrder | null }>()
const emit = defineEmits<{ close: []; saved: [order: WaOrder] }>()
const scope = useAdminScope()
const s = useWaOrderSheet(toRef(props, 'order'), (o) => emit('saved', o))
const o = computed(() => props.order)
const pending = computed(() => o.value?.status === 'pending')
</script>

<template>
  <BaseSheet :open="!!order" :title="order ? `Pedido ${order.code}` : 'Pedido'" @close="emit('close')">
    <div v-if="o" class="wos">
      <header class="wos__head">
        <div>
          <strong class="wos__name">{{ o.customer?.name || 'Sin nombre' }}</strong>
          <small>{{ o.customer?.phone || 'Sin teléfono' }}</small>
        </div>
        <BookingBadges :status="o.status" :payment="o.paymentStatus" :settled="settledLabel(o)" />
      </header>

      <div class="wos__quick">
        <a v-if="s.chatUrl.value" :href="s.chatUrl.value" target="_blank" rel="noopener" class="wos__q wos__q--wa">
          <AppIcon name="whatsapp" :size="20" /><span>Abrir chat</span>
        </a>
        <a v-if="s.canPayLink.value && s.payUrl.value" :href="s.payUrl.value" target="_blank" rel="noopener" class="wos__q">
          <AppIcon name="card" :size="20" /><span>Enviar link de pago</span>
        </a>
        <button v-if="s.canPayLink.value" type="button" class="wos__q" @click="s.copyPayText()">
          <AppIcon name="copy" :size="20" /><span>Copiar link de pago</span>
        </button>
      </div>

      <section class="wos__sum">
        <p><AppIcon name="calendar" :size="15" /> <span class="cap">{{ shortDate(o.date) }}</span> · {{ o.time }}<template v-if="scope.branchName(o.branch)"> · {{ scope.branchName(o.branch) }}</template></p>
        <p v-if="o.address || o.zone"><AppIcon name="pin" :size="15" /> {{ [o.address, o.zone].filter(Boolean).join(' · ') }}</p>
        <ul>
          <li v-for="(i, n) in o.items" :key="n">
            <span>{{ i.name }}<template v-if="i.variant"> · {{ i.variant }}</template> <small>x{{ i.quantity }}</small></span>
            <span class="money">{{ money(i.subtotal) }}</span>
          </li>
        </ul>
        <p class="wos__total"><span>Total</span><strong class="money">{{ money(o.total) }}</strong></p>
        <p v-if="o.amountPaid > 0" class="wos__paid">Pagado {{ money(o.amountPaid) }} · saldo {{ money(o.balance) }}</p>
        <p v-if="o.notes" class="wos__notes">{{ o.notes }}</p>
      </section>

      <section class="wos__sec">
        <h3>Pago</h3>
        <WaPaymentFields v-model:state="s.pay.value" :balance="o.balance" />
      </section>

      <section v-if="s.operatorChoices.value.length" class="wos__sec">
        <h3>Operador</h3>
        <ChoiceChips v-model="s.form.operators" :options="s.operatorChoices.value" multiple label="Operadores" small />
      </section>

      <RouterLink :to="`/admin/pedidos/${o._id}`" class="wos__more">Ver pedido completo <AppIcon name="chevron-right" :size="16" /></RouterLink>
    </div>

    <template #footer>
      <button type="button" class="btn btn--ghost" :disabled="s.saving.value" @click="s.save(false)">Guardar</button>
      <button v-if="pending" type="button" class="btn btn--primary" :disabled="s.saving.value" @click="s.save(true)">
        <AppIcon name="check" /> {{ s.saving.value ? 'Guardando…' : 'Confirmar pedido' }}
      </button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.wos {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

    div {
      display: flex;
      flex-direction: column;
    }

    small {
      color: $ink-muted;
    }
  }

  &__name {
    font-size: $text-lg;
  }

  &__quick {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
  }

  &__q {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    min-height: 68px;
    padding: 0.5rem;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    background: $surface;
    color: $navy;
    font-size: $text-xs;
    font-weight: 700;
    text-align: center;
    transition: transform $dur-fast $ease-out;

    &:active {
      transform: scale(0.96);
    }

    &--wa {
      background: $whatsapp;
      border-color: $whatsapp;
      color: #fff;
    }
  }

  &__sum {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.85rem;
    border-radius: $radius-md;
    background: $sky;
    font-size: $text-sm;

    p {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.4rem 0;
      border-top: 1px dashed $line-strong;
    }

    li {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }

    small {
      color: $ink-muted;
    }
  }

  &__total {
    justify-content: space-between;
    font-size: $text-base;
    color: $navy;
  }

  &__paid,
  &__notes {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__sec h3 {
    font-size: $text-sm;
    color: $navy;
    margin-bottom: 0.5rem;
  }

  &__more {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    font-size: $text-sm;
    font-weight: 600;
    color: $navy;
    text-decoration: underline;
  }
}

.cap {
  text-transform: capitalize;
}
</style>
