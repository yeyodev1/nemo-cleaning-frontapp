<script setup lang="ts">
import { ref } from 'vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { EvidenceKind } from '@/utils/paymentEvidence'

/**
 * El "papel" que pide marcar un pago como confirmado, justo debajo de la confirmación:
 * comprobante de la transferencia o el interruptor de efectivo recibido.
 */
defineProps<{ kind: EvidenceKind }>()
const proofUrl = defineModel<string>('proofUrl', { required: true })
const cashConfirmed = defineModel<boolean>('cashConfirmed', { required: true })
const uploading = defineModel<boolean>('uploading', { default: false })
const toast = useToastStore()
const local = ref(false)

async function upload(file: File) {
  uploading.value = local.value = true
  try {
    proofUrl.value = (await managementService.uploadFile(file)).url
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    uploading.value = local.value = false
  }
}
</script>

<template>
  <div v-if="kind" class="evi">
    <template v-if="kind === 'transfer'">
      <FileDrop label="Comprobante (obligatorio)" :url="proofUrl" :busy="local" @pick="upload" @error="toast.error" />
      <span v-if="!proofUrl" class="evi__req">Para marcar la transferencia como confirmada sube el comprobante.</span>
    </template>
    <ToggleSwitch
      v-else
      v-model="cashConfirmed"
      label="Recibí el efectivo"
      hint="Obligatorio para marcar el cobro como confirmado"
    />
  </div>
</template>

<style scoped lang="scss">
.evi {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem 0.85rem;
  border-radius: $radius-md;
  background: $info-bg;

  &__req {
    font-size: $text-xs;
    font-weight: 600;
    color: $info;
  }
}
</style>
