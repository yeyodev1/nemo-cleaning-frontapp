<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import ChoiceChips from './ChoiceChips.vue'
import type { OperatorOption } from '@/types/operation'

/** Atajo para no tocar día por día: día libre fijo de la semana o volver todo a ACTIVO. */
const props = defineProps<{ open: boolean; operators: OperatorOption[] }>()
const emit = defineEmits<{ close: []; weekly: [op: string, weekday: number]; reset: [op: string] }>()
const op = ref('')
const weekday = ref('1')
const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((label, i) => ({ value: String(i), label }))
watch(() => props.open, (o) => o && (op.value = props.operators[0]?._id || ''))
</script>

<template>
  <BaseSheet :open="open" title="Llenar el mes rápido" @close="emit('close')">
    <div class="wo">
      <div class="field">
        <span class="field__label">Operador</span>
        <ChoiceChips v-model="op" :options="operators.map((o) => ({ value: o._id, label: o.name, color: o.color }))" label="Operador" small />
      </div>
      <div class="field">
        <span class="field__label">Su día libre de la semana</span>
        <ChoiceChips v-model="weekday" :options="days" label="Día libre" small />
      </div>
      <p class="wo__hint">Se marcan como LIBRE todos esos días del mes. Lo demás no cambia.</p>
    </div>
    <template #footer>
      <button type="button" class="btn btn--ghost" :disabled="!op" @click="emit('reset', op)">Todo el mes activo</button>
      <button type="button" class="btn btn--primary" :disabled="!op" @click="emit('weekly', op, Number(weekday))">Marcar día libre</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.wo {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
