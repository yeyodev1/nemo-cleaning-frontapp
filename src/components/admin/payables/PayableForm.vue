<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
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
      <div class="form-row">
        <label class="field">
          <span class="field__label">Categoría</span>
          <select v-model="form.category">
            <option v-for="o in options(payableCategory)" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
        <MoneyField v-model="form.amount" label="Valor" required />
      </div>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Quincena</span>
          <select v-model.number="form.fortnight">
            <option :value="1">Q1 (1–15)</option>
            <option :value="2">Q2 (16–fin de mes)</option>
          </select>
        </label>
        <label class="field"><span class="field__label">Fecha prevista (opcional)</span><input v-model="form.dueDate" type="date" /></label>
      </div>
      <label class="field">
        <span class="field__label">Sucursal</span>
        <select v-model="form.branch">
          <option :value="null">General de la empresa</option>
          <option v-for="b in scope.visibleBranches" :key="b._id" :value="b._id">{{ b.name }}</option>
        </select>
      </label>

      <fieldset class="paid">
        <legend>Pago</legend>
        <div class="form-row">
          <MoneyField v-model="form.paidAmount" label="Pagado" :hint="`Pendiente: ${money(pending)}`" />
          <label class="field"><span class="field__label">Fecha de pago</span><input v-model="form.paidDate" type="date" /></label>
        </div>
        <div class="form-row">
          <label class="field">
            <span class="field__label">Método</span>
            <select v-model="form.method">
              <option value="">—</option>
              <option v-for="o in options(payableMethod)" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </label>
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
