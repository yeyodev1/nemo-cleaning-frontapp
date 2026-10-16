<script setup lang="ts">
import BaseSheet from '@/components/ui/BaseSheet.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import MoneyField from './MoneyField.vue'
import { useToastStore } from '@/stores/toast'
import { useUpload } from '@/composables/admin/useUpload'
import { useExpenseForm } from '@/composables/finance/useExpenseForm'
import { expenseCategory, moneyMethods, options, paidFrom } from '@/config/labels'
import { expenseCategoryGroups } from '@/config/financeLabels'
import type { Expense } from '@/types/api'
import { computed } from 'vue'

const props = defineProps<{ open: boolean; expense: Expense | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const toast = useToastStore()
const { uploading, upload } = useUpload()
const { form, saving, save, isAdvance, deferredHint, scope, user } = useExpenseForm(props, () => emit('saved'))

// Opciones como botones (sin selects nativos). "General" = sin sucursal.
const GENERAL = '__general'
const branchChoices = computed(() => [
  ...(user.isAdmin ? [{ value: GENERAL, label: 'General (sin sucursal)' }] : []),
  ...scope.visibleBranches.map((b) => ({ value: b._id, label: b.name })),
])
const employeeChoices = computed(() => scope.operators.map((o) => ({ value: o._id, label: o.name, color: o.color })))
const paidFromChoices = options(paidFrom)
const catOptions = (items: readonly (keyof typeof expenseCategory)[]) => items.map((c) => ({ value: c, label: expenseCategory[c] }))

async function onFile(file: File) {
  const url = await upload(file)
  if (url) form.receiptUrl = url
}
</script>

<template>
  <BaseSheet :open="open" :title="expense ? 'Editar gasto' : 'Nuevo gasto'" @close="emit('close')">
    <form id="expense-form" class="form" @submit.prevent="save">
      <div class="field">
        <span class="field__label">Categoría</span>
        <div class="cats">
          <div v-for="g in expenseCategoryGroups" :key="g.label" class="cats__group">
            <small>{{ g.label }}</small>
            <ChoiceChips
              :model-value="form.category"
              :options="catOptions(g.items)"
              :label="g.label"
              small
              @update:model-value="form.category = $event as typeof form.category"
            />
          </div>
        </div>
      </div>
      <MoneyField v-model="form.amount" :label="form.deferred ? 'Monto total del diferido' : 'Monto'" required />
      <label class="field">
        <span class="field__label">Descripción</span>
        <input v-model="form.description" type="text" required maxlength="160" :placeholder="form.deferred ? 'Ej. moto, maquinaria Karcher' : 'Ej. Gasolina moto Sebastián'" />
      </label>
      <div v-if="isAdvance" class="field">
        <span class="field__label">¿A quién se le dio el anticipo?</span>
        <ChoiceChips :model-value="form.employee || ''" :options="employeeChoices" label="Persona del anticipo" small @update:model-value="form.employee = String($event) || null" />
        <span class="field__hint">Se descuenta solo de su nómina del mes.</span>
      </div>
      <div class="field">
        <span class="field__label">{{ form.deferred ? 'Fecha de la primera cuota' : 'Fecha' }}</span>
        <DatePicker v-model="form.date" label="Fecha del gasto" />
      </div>
      <div class="field">
        <span class="field__label">Sucursal</span>
        <ChoiceChips
          :model-value="form.branch || GENERAL"
          :options="branchChoices"
          label="Sucursal"
          small
          @update:model-value="form.branch = $event === GENERAL ? null : String($event)"
        />
      </div>

      <div class="kind" role="radiogroup" aria-label="Tipo de gasto">
        <label class="kind__opt" :class="{ 'is-on': form.kind === 'variable' }"><input v-model="form.kind" type="radio" value="variable" class="sr-only" /> <strong>Variable</strong><small>Cambia cada mes</small></label>
        <label class="kind__opt" :class="{ 'is-on': form.kind === 'fixed' }"><input v-model="form.kind" type="radio" value="fixed" class="sr-only" /> <strong>Fijo</strong><small>Alquiler, cuotas fijas</small></label>
      </div>
      <ToggleSwitch v-if="form.kind === 'fixed' && !form.deferred" v-model="form.recurring" label="Se repite cada mes" hint="Aparece en «Repetir gastos fijos»." />

      <template v-if="!expense">
        <ToggleSwitch v-model="form.deferred" label="Es un diferido" hint="Se paga en cuotas mensuales." />
        <div v-if="form.deferred" class="form-row">
          <div class="field">
            <span class="field__label">Número de cuotas</span>
            <QuantityStepper v-model="form.count" :min="2" :max="60" label="Número de cuotas" />
          </div>
          <div class="field">
            <span class="field__label">Empieza en la cuota</span>
            <QuantityStepper v-model="form.first" :min="1" :max="form.count" label="Cuota inicial" />
            <span class="field__hint">Si ya venías pagándolo (ej. 10 de 12).</span>
          </div>
        </div>
        <p v-if="deferredHint" class="hint">{{ deferredHint }}</p>
      </template>
      <p v-else-if="expense.installment" class="hint">Cuota {{ expense.installment.number }} de {{ expense.installment.count }}: los cambios solo afectan a esta cuota.</p>

      <div class="field">
        <span class="field__label">Pagado desde</span>
        <ChoiceChips
          :model-value="form.paidFrom"
          :options="user.isAdmin ? paidFromChoices : paidFromChoices.filter((o) => o.value === form.paidFrom)"
          label="Pagado desde"
          small
          @update:model-value="user.isAdmin && (form.paidFrom = $event as typeof form.paidFrom)"
        />
      </div>
      <div class="field">
        <span class="field__label">Forma de pago</span>
        <ChoiceChips :model-value="form.paymentMethod" :options="moneyMethods" label="Forma de pago" small @update:model-value="form.paymentMethod = $event as typeof form.paymentMethod" />
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
.cats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__group small {
    display: block;
    margin-bottom: 0.25rem;
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
    text-transform: uppercase;
  }
}

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
