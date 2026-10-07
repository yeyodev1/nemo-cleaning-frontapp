<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ChoiceChips from './ChoiceChips.vue'
import NovedadForm from './NovedadForm.vue'
import { paymentConfirmation } from '@/config/operationLabels'
import { money, shortDate } from '@/utils/format'
import type { PaymentAccountOption, ProductionRow } from '@/types/operation'

/** Acciones de una fila de la Base: confirmar el pago, cambiar la cuenta y anotar una novedad. */
const props = defineProps<{ row: ProductionRow | null; accounts: PaymentAccountOption[] }>()
const emit = defineEmits<{ close: []; confirm: [row: ProductionRow, confirmation: string, account: string]; changed: [] }>()
const confirmation = ref('')
const account = ref('')
const choices = Object.entries(paymentConfirmation).map(([value, c]) => ({ value, label: c.label }))

watch(
  () => props.row,
  (r) => {
    confirmation.value = r?.paymentConfirmation || ''
    account.value = r?.paymentAccount || ''
  },
)
const dirty = () => props.row && (confirmation.value !== props.row.paymentConfirmation || account.value !== props.row.paymentAccount)
</script>

<template>
  <BaseSheet :open="!!row" :title="row ? `${row.customer?.name || 'Servicio'} · ${money(row.total)}` : ''" @close="emit('close')">
    <div v-if="row" class="rs">
      <p class="rs__meta">
        {{ row.code }} · {{ shortDate(row.date) }} · {{ row.operators.map((o) => o.name).join(', ') }}<template v-if="row.zone"> · {{ row.zone }}</template>
      </p>
      <section class="rs__sec">
        <h3>Pago</h3>
        <label class="field">
          <span class="field__label">Forma de pago</span>
          <select v-model="account">
            <option v-if="account && !accounts.some((a) => a.label === account)" :value="account">{{ account }}</option>
            <option v-for="a in accounts" :key="a.label" :value="a.label">{{ a.label }}</option>
          </select>
        </label>
        <div class="field">
          <span class="field__label">Confirmación</span>
          <ChoiceChips v-model="confirmation" :options="choices" label="Confirmación" small />
          <span class="field__hint">
            {{ paymentConfirmation[confirmation as keyof typeof paymentConfirmation]?.hint }}
            <template v-if="confirmation === 'confirmed' && row.balance > 0"> · Se registra el cobro de {{ money(row.balance) }}.</template>
          </span>
        </div>
        <button type="button" class="btn btn--primary" :disabled="!dirty()" @click="emit('confirm', row, confirmation, account)">Guardar pago</button>
      </section>
      <section class="rs__sec">
        <h3>Anotar novedad</h3>
        <NovedadForm :booking-id="row._id" :operators="row.operators" @saved="emit('changed')" />
      </section>
      <RouterLink :to="`/admin/pedidos/${row._id}`" class="btn btn--ghost"><AppIcon name="external" :size="16" /> Abrir el pedido completo</RouterLink>
    </div>
  </BaseSheet>
</template>

<style scoped lang="scss">
.rs {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__meta {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__sec {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding-top: 0.9rem;
    border-top: 1px solid $line;

    h3 {
      font-size: $text-sm;
      color: $navy;
    }

    > .btn {
      align-self: flex-start;
    }
  }
}
</style>
