<script setup lang="ts">
import BaseSheet from '@/components/ui/BaseSheet.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import MoneyField from './MoneyField.vue'
import { useToastStore } from '@/stores/toast'
import { useUpload } from '@/composables/admin/useUpload'
import { useExpenseForm } from '@/composables/finance/useExpenseForm'
import { expenseCategory, moneyMethods, options, paidFrom } from '@/config/labels'
import { expenseCategoryGroups } from '@/config/financeLabels'
import type { Expense } from '@/types/api'

const props = defineProps<{ open: boolean; expense: Expense | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const toast = useToastStore()
const { uploading, upload } = useUpload()
const { form, saving, save, isAdvance, deferredHint, scope, user } = useExpenseForm(props, () => emit('saved'))

async function onFile(file: File) {
  const url = await upload(file)
  if (url) form.receiptUrl = url
}
</script>

<template>
  <BaseSheet :open="open" :title="expense ? 'Editar gasto' : 'Nuevo gasto'" @close="emit('close')">
    <form id="expense-form" class="form" @submit.prevent="save">
      <div class="form-row">
        <label class="field">
          <span class="field__label">Categoría</span>
          <select v-model="form.category">
            <optgroup v-for="g in expenseCategoryGroups" :key="g.label" :label="g.label">
              <option v-for="c in g.items" :key="c" :value="c">{{ expenseCategory[c] }}</option>
            </optgroup>
          </select>
        </label>
        <MoneyField v-model="form.amount" :label="form.deferred ? 'Monto total del diferido' : 'Monto'" required />
      </div>
      <label class="field">
        <span class="field__label">Descripción</span>
        <input v-model="form.description" type="text" required maxlength="160" :placeholder="form.deferred ? 'Ej. moto, maquinaria Karcher' : 'Ej. Gasolina moto Sebastián'" />
      </label>
      <label v-if="isAdvance" class="field">
        <span class="field__label">¿A quién se le dio el anticipo?</span>
        <select v-model="form.employee" required>
          <option :value="null">Elige…</option>
          <option v-for="o in scope.operators" :key="o._id" :value="o._id">{{ o.name }}</option>
        </select>
        <span class="field__hint">Se descuenta solo de su nómina del mes.</span>
      </label>
      <div class="form-row">
        <label class="field"><span class="field__label">{{ form.deferred ? 'Fecha de la primera cuota' : 'Fecha' }}</span><input v-model="form.date" type="date" required /></label>
        <label class="field">
          <span class="field__label">Sucursal</span>
          <select v-model="form.branch">
            <option v-if="user.isAdmin" :value="null">General (sin sucursal)</option>
            <option v-for="b in scope.visibleBranches" :key="b._id" :value="b._id">{{ b.name }}</option>
          </select>
        </label>
      </div>

      <div class="kind" role="radiogroup" aria-label="Tipo de gasto">
        <label class="kind__opt" :class="{ 'is-on': form.kind === 'variable' }"><input v-model="form.kind" type="radio" value="variable" /> <strong>Variable</strong><small>Cambia cada mes</small></label>
        <label class="kind__opt" :class="{ 'is-on': form.kind === 'fixed' }"><input v-model="form.kind" type="radio" value="fixed" /> <strong>Fijo</strong><small>Alquiler, cuotas fijas</small></label>
      </div>
      <label v-if="form.kind === 'fixed' && !form.deferred" class="check">
        <input v-model="form.recurring" type="checkbox" /> Se repite cada mes (aparece en «Repetir gastos fijos»)
      </label>

      <template v-if="!expense">
        <label class="check"><input v-model="form.deferred" type="checkbox" /> Es un diferido (se paga en cuotas mensuales)</label>
        <div v-if="form.deferred" class="form-row">
          <label class="field"><span class="field__label">Número de cuotas</span><input v-model.number="form.count" type="number" min="2" max="60" /></label>
          <label class="field">
            <span class="field__label">Empieza en la cuota</span>
            <input v-model.number="form.first" type="number" min="1" :max="form.count" />
            <span class="field__hint">Si ya venías pagándolo (ej. 10 de 12).</span>
          </label>
        </div>
        <p v-if="deferredHint" class="hint">{{ deferredHint }}</p>
      </template>
      <p v-else-if="expense.installment" class="hint">Cuota {{ expense.installment.number }} de {{ expense.installment.count }}: los cambios solo afectan a esta cuota.</p>

      <div class="form-row">
        <label class="field">
          <span class="field__label">Pagado desde</span>
          <select v-model="form.paidFrom" :disabled="!user.isAdmin">
            <option v-for="o in options(paidFrom)" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Forma de pago</span>
          <select v-model="form.paymentMethod">
            <option v-for="o in moneyMethods" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
      </div>
      <p v-if="form.paidFrom === 'petty_cash' && form.paymentMethod === 'cash'" class="hint">Sale solo del registro de caja de la sucursal.</p>
      <label class="field">
        <span class="field__label">Proveedor (opcional)</span>
        <input v-model="form.supplier" type="text" maxlength="120" />
      </label>
      <div class="field">
        <span class="field__label">Factura o recibo (opcional)</span>
        <FileDrop label="Subir recibo" :url="form.receiptUrl" :busy="uploading" @pick="onFile" @error="toast.error($event)" />
      </div>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="expense-form" class="btn btn--primary" :disabled="saving || uploading">
        {{ saving ? 'Guardando…' : 'Guardar' }}
      </button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.hint {
  font-size: $text-sm;
  color: $info;
  background: $info-bg;
  padding: 0.55rem 0.75rem;
  border-radius: $radius-sm;
}

.kind {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;

  &__opt {
    display: flex;
    flex-direction: column;
    padding: 0.65rem 0.8rem;
    border: 1.5px solid $line-strong;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: border-color $dur-fast ease, background-color $dur-fast ease;

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    small {
      color: $ink-muted;
      font-size: $text-xs;
    }

    &.is-on {
      border-color: $navy;
      background: $navy-soft;
    }

    &:focus-within {
      outline: 2.5px solid $orange-deep;
      outline-offset: 2px;
    }
  }
}
</style>
