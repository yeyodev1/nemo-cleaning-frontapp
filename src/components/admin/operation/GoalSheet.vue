<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage, monthLabel } from '@/utils/format'
import type { GoalRow } from '@/types/operation'

const props = defineProps<{ row: GoalRow | null; month: string }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const toast = useToastStore()
const amount = ref(0)
const notes = ref('')
const busy = ref(false)

watch(() => props.row, (r) => {
  amount.value = r?.goal || 0
  notes.value = r?.notes || ''
})

async function save() {
  if (!props.row) return
  busy.value = true
  try {
    await operationService.saveGoal({ operator: props.row.operator, month: props.month, amount: amount.value, notes: notes.value })
    toast.success(amount.value ? 'Meta guardada' : 'Meta quitada')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <BaseSheet :open="!!row" :title="row ? `Meta de ${row.name}` : ''" @close="emit('close')">
    <form id="goal-form" class="gs" @submit.prevent="save">
      <p class="gs__hint">Meta de producción para {{ monthLabel(month) }}. La producción real se calcula sola con los servicios registrados.</p>
      <MoneyField v-model="amount" label="Meta mensual" hint="Deja en 0 para quitar la meta." />
      <label class="field"><span class="field__label">Observaciones</span><input v-model="notes" type="text" placeholder="Opcional" /></label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="goal-form" class="btn btn--primary" :disabled="busy">{{ busy ? 'Guardando…' : 'Guardar meta' }}</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.gs {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
