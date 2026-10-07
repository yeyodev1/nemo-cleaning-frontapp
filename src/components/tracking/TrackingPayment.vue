<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import BankAccounts from '@/components/booking/BankAccounts.vue'
import PayphoneBox from '@/components/payment/PayphoneBox.vue'
import { useCatalogStore } from '@/stores/catalog'
import { money } from '@/utils/format'
import type { Booking } from '@/types/api'

/** Pago pendiente: subir comprobante de transferencia o pagar con tarjeta. */
const props = defineProps<{
  booking: Booking
  token: string
  busy: boolean
  upload: (f: File) => Promise<string>
}>()
const catalog = useCatalogStore()
const paying = ref(false)
const err = ref('')

const due = () => (props.booking.balance > 0 ? props.booking.balance : props.booking.total)

async function onFile(file: File) {
  err.value = await props.upload(file)
}
</script>

<template>
  <section class="tpay card" aria-labelledby="tpay-title">
    <h2 id="tpay-title" class="tpay__title">Completa tu pago</h2>

    <PayphoneBox
      v-if="paying"
      :code="booking.code"
      :token="token"
      :amount="due()"
      @cancel="paying = false"
    />

    <template v-else>
      <template v-if="booking.paymentMethod === 'transfer'">
        <BankAccounts :accounts="catalog.settings?.bankAccounts || []" :amount="money(due())" />
        <FileDrop
          :url="booking.transferProofUrl"
          :busy="busy"
          label="Subir comprobante de transferencia"
          @pick="onFile"
          @error="err = $event"
        />
        <p v-if="err" class="field__error" role="alert">{{ err }}</p>
      </template>

      <button
        v-if="catalog.settings?.payphoneEnabled"
        type="button"
        class="btn btn--block"
        :class="['card', 'whatsapp'].includes(booking.paymentMethod) ? 'btn--primary btn--lg' : 'btn--ghost'"
        @click="paying = true"
      >
        <AppIcon name="card" /> Pagar {{ money(due()) }} con tarjeta
      </button>
    </template>
  </section>
</template>

<style scoped lang="scss">
.tpay {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__title {
    font-size: $text-lg;
  }
}
</style>
