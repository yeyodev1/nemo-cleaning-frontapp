<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import { operationService } from '@/services/operation.service'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage, money } from '@/utils/format'
import type { OperatorCollection } from '@/types/operation'

/**
 * Recibir un cobro del operador. Efectivo: cuánto entregó (por defecto lo que reportó).
 * Transferencia: subir la imagen del comprobante (obligatoria) y el monto.
 */
const props = defineProps<{ item: OperatorCollection | null }>()
const emit = defineEmits<{ close: []; done: [item: OperatorCollection] }>()
const toast = useToastStore()
const amount = ref(0)
const note = ref('')
const proofUrl = ref('')
const uploading = ref(false)
const saving = ref(false)
const excessAs = ref<'' | 'tip' | 'credit'>('')
const excess = computed(() => (props.item ? Math.max(0, amount.value - Math.max(0, props.item.balance)) : 0))

watch(
  () => props.item,
  (it) => {
    if (!it) return
    amount.value = it.method === 'cash' ? it.cashReceived : it.balance
    note.value = ''
    proofUrl.value = ''
    excessAs.value = ''
  },
)

const isCash = computed(() => props.item?.method === 'cash')
const diff = computed(() => (props.item && isCash.value ? amount.value - props.item.cashReceived : 0))
const who = computed(() => props.item?.operators.map((o) => o.name).join(', ') || props.item?.reportedBy || 'el operador')

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

async function confirm() {
  if (!props.item) return
  if (!isCash.value && !proofUrl.value) return toast.error('Sube la imagen del comprobante')
  if (excess.value > 0 && !excessAs.value) return toast.error(`Hay ${money(excess.value)} de más: elige si es propina o saldo a favor`)
  saving.value = true
  try {
    const r = await operationService.receiveCollection(props.item._id, { amount: amount.value, proofUrl: proofUrl.value || undefined, note: note.value.trim() || undefined, excessAs: excess.value > 0 ? excessAs.value || undefined : undefined })
    toast.success(isCash.value ? `Recibiste ${money(amount.value)} de ${who.value}` : 'Transferencia confirmada con comprobante')
    emit('done', r)
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="!!item" :title="isCash ? 'Recibir efectivo' : 'Confirmar transferencia'" :dirty="!!proofUrl || !!note" @close="emit('close')">
    <div v-if="item" class="rc">
      <div class="rc__summary">
        <div><small>Servicio</small><strong>{{ item.code }} · {{ item.customer?.name || 'Cliente' }}</strong></div>
        <div><small>Operador</small><strong>{{ who }}</strong></div>
        <div><small>Total del servicio</small><strong>{{ money(item.total) }}</strong></div>
        <div v-if="isCash"><small>El operador dice que cobró</small><strong class="rc__big">{{ money(item.cashReceived) }}</strong></div>
        <div v-else><small>Saldo por cobrar</small><strong class="rc__big">{{ money(item.balance) }}</strong></div>
      </div>

      <template v-if="isCash">
        <MoneyField v-model="amount" label="¿Cuánto efectivo te entregó?" />
        <p v-if="diff !== 0" class="rc__diff" role="alert">
          <AppIcon name="alert" :size="16" /> {{ diff < 0 ? `Faltan ${money(-diff)}` : `Sobran ${money(diff)}` }} respecto a lo que reportó. Explica en la nota.
        </p>
      </template>
      <template v-else>
        <FileDrop label="Imagen del comprobante (obligatoria)" :url="proofUrl" :busy="uploading" @pick="upload" @error="toast.error" />
        <MoneyField v-model="amount" label="Monto de la transferencia" />
      </template>

      <div v-if="excess > 0" class="rc__diff rc__diff--col">
        <span><b>Excedente: {{ money(excess) }}</b> sobre el saldo de {{ money(item.balance) }}. ¿Qué es lo que sobra?</span>
        <ChoiceChips
          :model-value="excessAs"
          :options="[
            { value: 'tip', label: 'Propina para el equipo' },
            { value: 'credit', label: 'Saldo a favor del cliente', hint: 'Se descuenta en su próximo servicio' },
          ]"
          label="Qué es el excedente"
          small
          @update:model-value="excessAs = $event as 'tip' | 'credit'"
        />
      </div>
      <label class="field">
        <span class="field__label">Nota (opcional)</span>
        <input v-model="note" type="text" :placeholder="isCash ? 'Ej.: entregó en la base a las 18:00' : 'Ej.: transferencia Pichincha #12345'" />
      </label>
      <p class="rc__hint">Al confirmar se registra el pago {{ isCash ? 'en efectivo' : 'por transferencia' }} en el servicio{{ isCash ? '' : ' con su comprobante' }}.</p>
    </div>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn btn--primary" :disabled="saving || uploading || (!isCash && !proofUrl)" @click="confirm">
        <AppIcon name="check" /> {{ saving ? 'Guardando…' : isCash ? 'Confirmar recepción' : 'Confirmar transferencia' }}
      </button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.rc {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;

    div {
      display: flex;
      flex-direction: column;
      padding: 0.6rem 0.75rem;
      border-radius: $radius-md;
      background: $sky;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__big {
    font-size: $text-xl;
    color: $navy;
  }

  &__diff {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.8rem;
    border-radius: $radius-sm;
    background: $warning-bg;
    color: $warning;
    font-size: $text-sm;
    font-weight: 600;
  }

  &__diff--col {
    flex-direction: column;
    align-items: stretch;
    color: $ink;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
