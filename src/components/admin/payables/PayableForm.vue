<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { options } from '@/config/labels'
import { payableCategory, payableMethod } from '@/config/financeLabels'
import { errorMessage, money } from '@/utils/format'
import type { Payable, PayableInput } from '@/types/finance'

const props = defineProps<{ open: boolean; payable: Payable | null; month: string }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const scope = useAdminScope()
const toast = useToastStore()
const saving = ref(false)

function blank(): PayableInput {
  return {
    branch: scope.branch || null,
    month: props.month,
    fortnight: 1,
    dueDate: '',
    beneficiary: '',
    category: 'proveedor',
    amount: 0,
    paidAmount: 0,
    paidDate: '',
    method: '',
    account: '',
    reference: '',
    notes: '',
  }
}
const form = reactive<PayableInput>(blank())
watch(
  () => props.open,
  (open) => {
    if (!open) return
    const p = props.payable
    Object.assign(form, p ? { ...blank(), ...p } : blank())
  },
)
const pending = computed(() => Math.max(0, form.amount - form.paidAmount))
// Opciones como botones (sin selects nativos). "General" = de toda la empresa.
const GENERAL = '__general'
const branchChoices = computed(() => [{ value: GENERAL, label: 'General de la empresa' }, ...scope.visibleBranches.map((b) => ({ value: b._id, label: b.name }))])
const categoryChoices = options(payableCategory)
const methodChoices = options(payableMethod)
const fortnightChoices = [
  { value: '1', label: 'Q1 (1–15)' },
  { value: '2', label: 'Q2 (16–fin de mes)' },
]

async function save() {
  if (!form.beneficiary.trim()) return toast.error('Escribe a quién se le paga o el concepto')
  if (form.amount <= 0) return toast.error('Ingresa el valor a pagar')
  saving.value = true
  try {
    const body = { ...form }
    if (props.payable) await ledgerService.updatePayable(props.payable._id, body)
    else await ledgerService.createPayable(body)
    toast.success(props.payable ? 'Pago actualizado' : 'Pago agregado a la lista')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" :title="payable ? 'Editar pago' : 'Nuevo pago por realizar'" @close="emit('close')">
    <form id="payable-form" class="form" @submit.prevent="save">
      <label class="field">
        <span class="field__label">Beneficiario / concepto</span>
        <input v-model="form.beneficiary" type="text" maxlength="160" required placeholder="Ej. Alquiler bodega, Crédito motos VISA" />
      </label>
      <div class="field">
        <span class="field__label">Categoría</span>
        <ChoiceChips :model-value="form.category" :options="categoryChoices" label="Categoría" small @update:model-value="form.category = $event as typeof form.category" />
      </div>
      <MoneyField v-model="form.amount" label="Valor" required />
      <div class="field">
        <span class="field__label">Quincena</span>
        <ChoiceChips :model-value="String(form.fortnight)" :options="fortnightChoices" label="Quincena" @update:model-value="form.fortnight = Number($event) as 1 | 2" />
      </div>
      <div class="field">
        <span class="field__label">Fecha prevista (opcional)</span>
        <DatePicker v-model="form.dueDate" clearable placeholder="Sin fecha prevista" label="Fecha prevista" />
      </div>
      <div class="field">
        <span class="field__label">Sucursal</span>
        <ChoiceChips :model-value="form.branch || GENERAL" :options="branchChoices" label="Sucursal" small @update:model-value="form.branch = $event === GENERAL ? null : String($event)" />
      </div>

      <fieldset class="paid">
        <legend>Pago</legend>
        <div class="form-row">
          <MoneyField v-model="form.paidAmount" label="Pagado" :hint="`Pendiente: ${money(pending)}`" />
          <div class="field">
            <span class="field__label">Fecha de pago</span>
            <DatePicker v-model="form.paidDate" clearable placeholder="Aún no se paga" label="Fecha de pago" />
          </div>
        </div>
        <div class="field">
          <span class="field__label">Método</span>
          <ChoiceChips :model-value="form.method" :options="methodChoices" label="Método de pago" small @update:model-value="form.method = $event as typeof form.method" />
        </div>
        <div class="form-row">
          <label class="field">
            <span class="field__label">Cuenta / caja</span>
            <input v-model="form.account" type="text" maxlength="80" placeholder="Ej. Pichincha, Caja gerencia" />
          </label>
        </div>
        <label class="field">
          <span class="field__label">Referencia / comprobante</span>
          <input v-model="form.reference" type="text" maxlength="120" />
        </label>
      </fieldset>
      <label class="field">
        <span class="field__label">Observaciones</span>
        <input v-model="form.notes" type="text" maxlength="300" />
      </label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="payable-form" class="btn btn--primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.paid {
  border: 1px solid $line;
  border-radius: $radius-sm;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  legend {
    padding: 0 0.35rem;
    font-weight: 800;
    font-size: $text-sm;
  }
}
</style>
