<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import ProofLink from './ProofLink.vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { paymentMethod } from '@/config/labels'
import { errorMessage, money } from '@/utils/format'
import type { PaymentReviewEvidence } from '@/services/bookings.service'
import type { Payment } from '@/types/api'

/**
 * Paso de confirmación antes de aprobar un pago. Sin papel no se aprueba: si el pago no trae
 * comprobante hay que subirlo aquí; si es efectivo, confirmar que se recibió.
 */
// `fallbackProof` = el comprobante que el cliente adjuntó a la reserva (el back también lo acepta).
const props = defineProps<{ payment: Payment | null; busy: boolean; fallbackProof?: string }>()
const emit = defineEmits<{ close: []; confirm: [evidence: PaymentReviewEvidence] }>()
const toast = useToastStore()
const uploading = ref(false)
const proofUrl = ref('')
const cashConfirmed = ref(false)

watch(
  () => props.payment,
  () => {
    proofUrl.value = ''
    cashConfirmed.value = false
  },
)

const isCash = computed(() => props.payment?.method === 'cash')
const shownProof = computed(() => props.payment?.proofUrl || props.fallbackProof || '')
const needsProof = computed(() => !isCash.value && !shownProof.value)
const ready = computed(() => (isCash.value ? cashConfirmed.value : !needsProof.value || !!proofUrl.value))

async function upload(file: File) {
  uploading.value = true
  try {
    proofUrl.value = (await managementService.uploadFile(file)).url
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    uploading.value = false
  }
}

function confirm() {
  if (!ready.value) return toast.error(isCash.value ? 'Confirma que recibiste el efectivo' : 'Para aprobar sube el comprobante')
  emit('confirm', isCash.value ? { cashConfirmed: true } : { proofUrl: proofUrl.value || undefined })
}
</script>

<template>
  <BaseSheet :open="!!payment" title="Aprobar pago" :dirty="!!proofUrl || cashConfirmed" @close="emit('close')">
    <div v-if="payment" class="ap">
      <p class="ap__lead">Al aprobar, el pago se suma a lo cobrado de la reserva y se avisa al cliente.</p>
      <dl class="ap__sum">
        <div><dt>Monto</dt><dd class="ap__amount money">{{ money(payment.amount) }}</dd></div>
        <div><dt>Reserva</dt><dd>{{ payment.bookingCode }}</dd></div>
        <div><dt>Método</dt><dd>{{ payment.account || paymentMethod[payment.method] }}</dd></div>
      </dl>
      <ToggleSwitch
        v-if="isCash"
        v-model="cashConfirmed"
        label="Recibí el efectivo"
        hint="Obligatorio: confirma que el dinero ya está en tus manos"
      />
      <div v-else-if="shownProof" class="ap__proof">
        <ProofLink :url="shownProof" :title="`Comprobante ${payment.bookingCode}`" />
        <span>Revisa que el comprobante coincida con el monto antes de aprobar.</span>
      </div>
      <FileDrop
        v-else
        label="Comprobante (obligatorio)"
        :url="proofUrl"
        :busy="uploading"
        @pick="upload"
        @error="toast.error"
      />
    </div>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn btn--primary" :disabled="busy || uploading || !ready" @click="confirm">
        {{ busy ? 'Un momento…' : 'Confirmar aprobación' }}
      </button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.ap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__lead {
    color: $ink-soft;
    line-height: 1.5;
  }

  &__sum {
    border: 1px solid $line;
    border-radius: $radius-md;

    div {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.7rem 0.9rem;
    }

    div + div {
      border-top: 1px solid $line;
    }

    dt {
      font-size: $text-sm;
      color: $ink-muted;
    }

    dd {
      font-weight: 600;
      text-align: right;
    }
  }

  &__amount {
    font-size: $text-lg;
  }

  &__proof {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
