<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import MoneyField from './MoneyField.vue'
import { financeService, type ExpenseInput } from '@/services/finance.service'
import { useAdminScope } from '@/stores/adminScope'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useUpload } from '@/composables/admin/useUpload'
import { expenseCategory, options, paidFrom, paymentMethod } from '@/config/labels'
import { errorMessage, todayISO } from '@/utils/format'
import type { Expense } from '@/types/api'

const props = defineProps<{ open: boolean; expense: Expense | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const scope = useAdminScope()
const user = useUserStore()
const toast = useToastStore()
const { uploading, upload } = useUpload()
const saving = ref(false)

function blank(): ExpenseInput {
  return {
    branch: scope.branch || (user.isAdmin ? null : scope.visibleBranches[0]?._id || null),
    date: todayISO(),
    category: 'insumos',
    description: '',
    amount: 0,
    paymentMethod: 'cash',
    paidFrom: 'petty_cash',
    supplier: '',
    receiptUrl: '',
  }
}

const form = reactive<ExpenseInput>(blank())

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const e = props.expense
    Object.assign(
      form,
      e
        ? {
            branch: e.branch ?? null,
            date: e.date.slice(0, 10),
            category: e.category,
            description: e.description,
            amount: e.amount,
            paymentMethod: e.paymentMethod,
            paidFrom: e.paidFrom,
            supplier: e.supplier || '',
            receiptUrl: e.receiptUrl || '',
          }
        : blank(),
    )
  },
)

async function onFile(file: File) {
  const url = await upload(file)
  if (url) form.receiptUrl = url
}

async function save() {
  if (form.amount <= 0) return toast.error('Ingresa un monto mayor a cero')
  saving.value = true
  try {
    const body = { ...form, paidFrom: user.isAdmin ? form.paidFrom : 'petty_cash' } as ExpenseInput
    if (props.expense) await financeService.updateExpense(props.expense._id, body)
    else await financeService.createExpense(body)
    toast.success(props.expense ? 'Gasto actualizado' : 'Gasto registrado')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" :title="expense ? 'Editar gasto' : 'Nuevo gasto'" @close="emit('close')">
    <form id="expense-form" class="form" @submit.prevent="save">
      <div class="form-row">
        <label class="field"><span class="field__label">Fecha</span><input v-model="form.date" type="date" required /></label>
        <MoneyField v-model="form.amount" label="Monto" required />
      </div>
      <label class="field">
        <span class="field__label">Descripción</span>
        <input v-model="form.description" type="text" required maxlength="160" placeholder="Ej. Shampoo para tapicería" />
      </label>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Categoría</span>
          <select v-model="form.category">
            <option v-for="o in options(expenseCategory)" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Sucursal</span>
          <select v-model="form.branch">
            <option v-if="user.isAdmin" :value="null">General (sin sucursal)</option>
            <option v-for="b in scope.visibleBranches" :key="b._id" :value="b._id">{{ b.name }}</option>
          </select>
        </label>
      </div>
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
            <option v-for="o in options(paymentMethod)" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
      </div>
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
</style>
