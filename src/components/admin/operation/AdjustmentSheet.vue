<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import ChoiceChips from './ChoiceChips.vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage, todayISO } from '@/utils/format'
import type { OperatorOption } from '@/types/operation'

/** Ajuste manual con nota: bono (suma) o descuento (resta), al FEE del operador o del supervisor. */
const props = defineProps<{ open: boolean; operators: OperatorOption[]; month: string }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const toast = useToastStore()
const busy = ref(false)
const form = reactive({ operator: '', date: todayISO(), sign: 'plus', amount: 0, kind: 'operator', note: '' })

watch(
  () => props.open,
  (o) => {
    if (!o) return
    const today = todayISO()
    Object.assign(form, { operator: props.operators[0]?._id || '', date: today.startsWith(props.month) ? today : `${props.month}-01`, sign: 'plus', amount: 0, kind: 'operator', note: '' })
  },
)

async function save() {
  if (!form.operator) return toast.error('Elige a quién va el ajuste')
  if (form.amount <= 0) return toast.error('Escribe el valor del ajuste')
  if (!form.note.trim()) return toast.error('Escribe el motivo')
  busy.value = true
  try {
    await operationService.addAdjustment({
      operator: form.operator,
      date: form.date,
      kind: form.kind as 'operator' | 'supervisor',
      amount: form.sign === 'plus' ? form.amount : -form.amount,
      note: form.note.trim(),
    })
    toast.success('Ajuste registrado')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" title="Ajuste de comisión" @close="emit('close')">
    <form id="adj-form" class="af" @submit.prevent="save">
      <div class="field">
        <span class="field__label">Persona</span>
        <select v-model="form.operator">
          <option v-for="o in operators" :key="o._id" :value="o._id">{{ o.name }}</option>
        </select>
      </div>
      <div class="field">
        <span class="field__label">Tipo</span>
        <ChoiceChips v-model="form.sign" :options="[{ value: 'plus', label: 'Bono (suma)' }, { value: 'minus', label: 'Descuento (resta)' }]" label="Tipo de ajuste" small />
      </div>
      <div class="field">
        <span class="field__label">Se aplica al</span>
        <ChoiceChips v-model="form.kind" :options="[{ value: 'operator', label: 'FEE del operador' }, { value: 'supervisor', label: 'FEE supervisor' }]" label="A qué FEE" small />
      </div>
      <div class="form-row">
        <MoneyField v-model="form.amount" label="Valor" />
        <label class="field"><span class="field__label">Fecha</span><input v-model="form.date" type="date" /></label>
      </div>
      <label class="field"><span class="field__label">Motivo</span><input v-model="form.note" type="text" placeholder="Ej.: descontar $5 por queja del cliente" /></label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="adj-form" class="btn btn--primary" :disabled="busy">{{ busy ? 'Guardando…' : 'Registrar ajuste' }}</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.af {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
</style>
