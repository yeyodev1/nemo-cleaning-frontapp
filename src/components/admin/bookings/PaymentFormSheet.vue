<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { moneyMethods, paymentMethod } from '@/config/labels'
import { errorMessage, money } from '@/utils/format'
import type { ManualPaymentInput } from '@/services/bookings.service'
import type { PaymentMethod } from '@/types/api'

/**
 * Registrar un pago manual. Sin papel no hay pago: el efectivo se marca como recibido y la
 * transferencia o tarjeta lleva comprobante. Antes de enviar se revisa un resumen (paso 2).
 */
const props = defineProps<{ open: boolean; balance: number; saving: boolean; title?: string }>()
const emit = defineEmits<{ close: []; submit: [body: ManualPaymentInput] }>()
const toast = useToastStore()
const methods = moneyMethods
const uploading = ref(false)
const reviewing = ref(false)
const form = reactive({ amount: 0, method: 'cash' as PaymentMethod, reference: '', note: '', proofUrl: '', cashConfirmed: false, excessAs: '' as '' | 'tip' | 'credit' })
// Excedente: lo que entra por encima del saldo hay que decir qué es.
const excess = computed(() => Math.max(0, form.amount - Math.max(0, props.balance)))
const excessLabel = { tip: 'Propina para el equipo', credit: 'Saldo a favor del cliente' } as const

watch(
  () => props.open,
  (o) => {
    if (!o) return
    reviewing.value = false
    Object.assign(form, { amount: props.balance, method: 'cash', reference: '', note: '', proofUrl: '', cashConfirmed: false, excessAs: '' })
  },
)

const isCash = computed(() => form.method === 'cash')
const proofLabel = computed(() => (form.method === 'card' ? 'Voucher (obligatorio)' : 'Comprobante (obligatorio)'))
// Lo que falta para poder revisar: el papel del método elegido.
const missing = computed(() => {
  if (form.amount <= 0) return 'Ingresa un monto válido'
  if (excess.value > 0 && !form.excessAs) return `Hay ${money(excess.value)} de más: elige qué es`
  if (isCash.value) return form.cashConfirmed ? '' : 'Confirma que recibiste el efectivo'
  return form.proofUrl ? '' : 'Sube el comprobante para continuar'
})
const isPdf = computed(() => /\.pdf($|\?)/i.test(form.proofUrl))
const dirty = computed(
  () => form.amount !== props.balance || form.method !== 'cash' || !!form.reference || !!form.note || !!form.proofUrl || form.cashConfirmed,
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

function review() {
  if (missing.value) return toast.error(missing.value)
  reviewing.value = true
}

function submit() {
  if (missing.value) return toast.error(missing.value)
  emit('submit', {
    amount: form.amount,
    method: form.method,
    reference: form.reference || undefined,
    note: form.note || undefined,
    // Cada método manda solo su papel.
    proofUrl: isCash.value ? undefined : form.proofUrl,
    cashConfirmed: isCash.value ? true : undefined,
    excessAs: excess.value > 0 && form.excessAs ? form.excessAs : undefined,
  })
}
</script>

<template>
  <BaseSheet :open="open" :title="title || 'Registrar pago'" :dirty="dirty" @close="emit('close')">
    <form v-if="!reviewing" id="pay-form" class="pf" @submit.prevent="review">
      <MoneyField v-model="form.amount" label="Monto (USD)" required />
      <div class="field">
        <span class="field__label">Método</span>
        <ChoiceChips
          :model-value="form.method"
          :options="methods"
          label="Método de pago"
          @update:model-value="form.method = $event as PaymentMethod"
        />
      </div>
      <div v-if="excess > 0" class="pf__excess">
        <p><b>Excedente: {{ money(excess) }}</b> — el pago supera el saldo de {{ money(balance) }}. ¿Qué es lo que sobra?</p>
        <ChoiceChips
          :model-value="form.excessAs"
          :options="[
            { value: 'tip', label: excessLabel.tip },
            { value: 'credit', label: excessLabel.credit, hint: 'Se descuenta en su próximo servicio' },
          ]"
          label="Qué es el excedente"
          small
          @update:model-value="form.excessAs = $event as 'tip' | 'credit'"
        />
      </div>
      <ToggleSwitch
        v-if="isCash"
        v-model="form.cashConfirmed"
        label="Recibí el efectivo"
        hint="Obligatorio: confirma que el dinero ya está en tus manos"
      />
      <FileDrop v-else :label="proofLabel" :url="form.proofUrl" :busy="uploading" @pick="upload" @error="toast.error" />
      <label class="field">
        <span class="field__label">Referencia</span>
        <input v-model="form.reference" placeholder="N.º de comprobante, voucher…" />
      </label>
      <label class="field">
        <span class="field__label">Nota</span>
        <input v-model="form.note" />
      </label>
      <p v-if="missing" class="pf__hint">{{ missing }}</p>
    </form>

    <div v-else class="pf">
      <p class="pf__lead">Revisa antes de confirmar. El pago queda aprobado al instante.</p>
      <dl class="sum">
        <div class="sum__row"><dt>Monto</dt><dd class="sum__amount">{{ money(form.amount) }}</dd></div>
        <div class="sum__row"><dt>Método</dt><dd>{{ paymentMethod[form.method] }}</dd></div>
        <div v-if="form.reference" class="sum__row"><dt>Referencia</dt><dd>{{ form.reference }}</dd></div>
        <div v-if="excess > 0 && form.excessAs" class="sum__row"><dt>Excedente</dt><dd>{{ money(excess) }} · {{ excessLabel[form.excessAs] }}</dd></div>
        <div class="sum__row">
          <dt>Respaldo</dt>
          <dd v-if="isCash">Efectivo recibido</dd>
          <dd v-else>
            <a :href="form.proofUrl" target="_blank" rel="noopener" class="sum__proof">
              <img v-if="!isPdf" :src="form.proofUrl" alt="Comprobante del pago" />
              <span v-else>Ver PDF</span>
            </a>
          </dd>
        </div>
      </dl>
    </div>

    <template #footer>
      <template v-if="!reviewing">
        <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
        <button type="submit" form="pay-form" class="btn btn--primary" :disabled="saving || uploading || !!missing">
          Revisar y confirmar
        </button>
      </template>
      <template v-else>
        <button type="button" class="btn btn--ghost" :disabled="saving" @click="reviewing = false">Volver</button>
        <button type="button" class="btn btn--primary" :disabled="saving" @click="submit">
          {{ saving ? 'Un momento…' : 'Confirmar pago' }}
        </button>
      </template>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.pf {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__excess {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.8rem;
    border-radius: $radius-md;
    background: $warning-bg;

    p {
      font-size: $text-sm;
      color: $ink;
    }
  }

  &__lead {
    color: $ink-soft;
    line-height: 1.5;
  }
}

.sum {
  display: flex;
  flex-direction: column;
  border: 1px solid $line;
  border-radius: $radius-md;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0.9rem;

    & + & {
      border-top: 1px solid $line;
    }

    dt {
      font-size: $text-sm;
      color: $ink-muted;
    }

    dd {
      font-weight: 600;
      color: $ink;
      text-align: right;
    }
  }

  &__amount {
    font-size: $text-lg;
    font-variant-numeric: tabular-nums;
  }

  &__proof {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: $radius-sm;
    overflow: hidden;
    border: 1px solid $line;
    background: $sky;
    font-size: $text-xs;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
