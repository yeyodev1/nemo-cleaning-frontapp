<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { options, paymentMethod } from '@/config/labels'
import { errorMessage, fromCents, toCents } from '@/utils/format'
import type { ManualPaymentInput } from '@/services/bookings.service'
import type { PaymentMethod } from '@/types/api'

const props = defineProps<{ open: boolean; balance: number; saving: boolean }>()
const emit = defineEmits<{ close: []; submit: [body: ManualPaymentInput] }>()
const toast = useToastStore()
const methods = options(paymentMethod)
const uploading = ref(false)
const form = reactive({ amount: '', method: 'cash' as PaymentMethod, reference: '', note: '', proofUrl: '' })

watch(
  () => props.open,
  (o) => o && Object.assign(form, { amount: fromCents(props.balance), method: 'cash', reference: '', note: '', proofUrl: '' }),
)

async function upload(file: File) {
  uploading.value = true
  try {
    form.proofUrl = (await managementService.uploadFile(file)).url
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    uploading.value = false
  }
}

function submit() {
  const amount = toCents(form.amount)
  if (amount <= 0) return toast.error('Ingresa un monto válido')
  emit('submit', {
    amount,
    method: form.method,
    reference: form.reference || undefined,
    note: form.note || undefined,
    proofUrl: form.proofUrl || undefined,
  })
}
</script>

<template>
  <BaseSheet :open="open" title="Registrar pago" @close="emit('close')">
    <form id="pay-form" class="pf" @submit.prevent="submit">
      <label class="field">
        <span class="field__label">Monto (USD)</span>
        <input v-model="form.amount" inputmode="decimal" required />
      </label>
      <label class="field">
        <span class="field__label">Método</span>
        <select v-model="form.method">
          <option v-for="m in methods" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Referencia</span>
        <input v-model="form.reference" placeholder="N.º de comprobante, voucher…" />
      </label>
      <label class="field">
        <span class="field__label">Nota</span>
        <input v-model="form.note" />
      </label>
      <FileDrop label="Adjuntar comprobante (opcional)" :url="form.proofUrl" :busy="uploading" @pick="upload" @error="toast.error" />
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="pay-form" class="btn btn--primary" :disabled="saving || uploading">Registrar</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.pf {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
</style>
