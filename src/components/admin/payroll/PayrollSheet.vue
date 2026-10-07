<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { ledgerService } from '@/services/ledger.service'
import { useToastStore } from '@/stores/toast'
import { payableMethod } from '@/config/financeLabels'
import { errorMessage, money, todayISO } from '@/utils/format'
import type { PayrollRow } from '@/types/finance'

/** Editar una fila de nómina: sueldo del mes y lo pagado en cada quincena. */
const props = defineProps<{ open: boolean; row: PayrollRow | null }>()
const emit = defineEmits<{ close: []; saved: []; remove: [] }>()
const toast = useToastStore()
const saving = ref(false)
const methods = Object.values(payableMethod)

const blankPay = () => ({ paid: 0, date: '', method: '', reference: '' })
const form = reactive({ salary: 0, notes: '', q1: blankPay(), q2: blankPay() })

watch(
  () => props.open,
  (open) => {
    const r = props.row
    if (!open || !r) return
    form.salary = r.salary
    form.notes = r.notes
    for (const k of ['q1', 'q2'] as const) {
      form[k] = { paid: r[k].paid || 0, date: r[k].date || '', method: r[k].method || '', reference: r[k].reference || '' }
    }
  },
)

function payExpected(k: 'q1' | 'q2') {
  if (!props.row) return
  form[k].paid = props.row[k].expected
  if (!form[k].date) form[k].date = todayISO()
  if (!form[k].method) form[k].method = 'Transferencia'
}

async function save() {
  if (!props.row) return
  saving.value = true
  try {
    await ledgerService.updatePayroll(props.row._id, { ...form })
    toast.success(`Nómina de ${props.row.name} guardada`)
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" :title="row ? `Nómina · ${row.name}` : 'Nómina'" @close="emit('close')">
    <form v-if="row" id="payroll-form" class="form" @submit.prevent="save">
      <MoneyField v-model="form.salary" label="Sueldo de este mes" hint="Se toma de Personal; cámbialo aquí si este mes fue distinto." />
      <p v-if="row.advances" class="adv">Anticipos del mes: <strong>{{ money(row.advances) }}</strong> (ya descontados de lo esperado).</p>

      <fieldset v-for="k in (['q1', 'q2'] as const)" :key="k" class="q">
        <legend>{{ k === 'q1' ? 'Quincena 1 (1–15)' : 'Quincena 2 (16–fin)' }} · esperado {{ money(row[k].expected) }}</legend>
        <div class="form-row">
          <MoneyField v-model="form[k].paid" label="Pagado" />
          <label class="field"><span class="field__label">Fecha</span><input v-model="form[k].date" type="date" /></label>
        </div>
        <div class="form-row">
          <label class="field">
            <span class="field__label">Método</span>
            <select v-model="form[k].method">
              <option value="">—</option>
              <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
            </select>
          </label>
          <label class="field"><span class="field__label">Referencia</span><input v-model="form[k].reference" type="text" maxlength="120" /></label>
        </div>
        <button type="button" class="btn btn--soft btn--sm" @click="payExpected(k)">Pagar lo esperado ({{ money(row[k].expected) }})</button>
      </fieldset>
      <label class="field"><span class="field__label">Observaciones</span><input v-model="form.notes" type="text" maxlength="300" /></label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--danger btn--sm foot-left" @click="emit('remove')">Quitar del mes</button>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="payroll-form" class="btn btn--primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.adv {
  font-size: $text-sm;
  background: $warning-bg;
  color: $warning;
  padding: 0.6rem 0.8rem;
  border-radius: $radius-sm;
}

.q {
  border: 1px solid $line;
  border-radius: $radius-sm;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;

  legend {
    padding: 0 0.35rem;
    font-weight: 800;
    font-size: $text-sm;
  }

  > .btn {
    align-self: flex-start;
  }
}

.foot-left {
  margin-right: auto;
}
</style>
