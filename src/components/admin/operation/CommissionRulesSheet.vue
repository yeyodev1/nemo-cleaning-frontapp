<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import TierRows from './TierRows.vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { CommissionRule, OperatorOption } from '@/types/operation'

/** Reglas del FEE (solo gerencia): base diaria, tramos, % del supervisor y excepciones por operador. */
const props = defineProps<{ open: boolean; rule: CommissionRule | null; operators: OperatorOption[] }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const toast = useToastStore()
const busy = ref(false)
const form = ref<CommissionRule>({ dailyBase: 6000, tiers: [], supervisorPercent: 14, exceptions: [] })

watch(
  () => props.open,
  (o) => {
    if (o && props.rule) form.value = JSON.parse(JSON.stringify(props.rule))
  },
)

function addException() {
  const used = new Set(form.value.exceptions.map((e) => e.operator))
  const op = props.operators.find((o) => !used.has(o._id))
  if (!op) return toast.error('Todos los operadores ya tienen excepción')
  form.value.exceptions.push({ operator: op._id, tiers: JSON.parse(JSON.stringify(form.value.tiers)), note: '' })
}

async function save() {
  busy.value = true
  try {
    await operationService.saveCommissionRule({
      dailyBase: form.value.dailyBase,
      supervisorPercent: form.value.supervisorPercent,
      tiers: form.value.tiers,
      exceptions: form.value.exceptions.map((e) => ({ operator: e.operator, tiers: e.tiers, note: e.note })),
    })
    toast.success('Reglas del FEE guardadas')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" title="Reglas del FEE" wide @close="emit('close')">
    <form id="rules-form" class="rf" @submit.prevent="save">
      <p class="rf__hint">Excedente = producción del operador en el día − base diaria. Si es mayor a $0 se paga el % del tramo. Los cambios recalculan todos los meses.</p>
      <div class="form-row">
        <MoneyField v-model="form.dailyBase" label="Base diaria" />
        <label class="field">
          <span class="field__label">FEE supervisor (% del excedente)</span>
          <input v-model.number="form.supervisorPercent" type="number" min="0" max="100" step="0.5" inputmode="decimal" />
        </label>
      </div>
      <fieldset class="rf__set">
        <legend>Tramos para todos</legend>
        <TierRows v-model="form.tiers" />
      </fieldset>
      <fieldset class="rf__set">
        <legend>Excepciones por operador</legend>
        <p class="rf__hint">Para quien tiene otro acuerdo (ej.: un % fijo). Para un % fijo deja un solo tramo.</p>
        <div v-for="(e, i) in form.exceptions" :key="i" class="rf__exc">
          <div class="rf__exc-head">
            <label class="field">
              <span class="field__label">Operador</span>
              <select v-model="e.operator">
                <option v-for="o in operators" :key="o._id" :value="o._id">{{ o.name }}</option>
              </select>
            </label>
            <button type="button" class="btn btn--ghost btn--icon" aria-label="Quitar excepción" @click="form.exceptions.splice(i, 1)"><AppIcon name="trash" :size="16" /></button>
          </div>
          <TierRows v-model="e.tiers" />
          <label class="field"><span class="field__label">Motivo</span><input v-model="e.note" type="text" placeholder="Ej.: acuerdo de 34 % fijo" /></label>
        </div>
        <button type="button" class="btn btn--ghost btn--sm" @click="addException"><AppIcon name="plus" :size="16" /> Agregar excepción</button>
      </fieldset>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="rules-form" class="btn btn--primary" :disabled="busy">{{ busy ? 'Guardando…' : 'Guardar reglas' }}</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.rf {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__set {
    border: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding-top: 0.9rem;
    border-top: 1px solid $line;

    legend {
      font-weight: 700;
      color: $navy;
      font-size: $text-sm;
      margin-bottom: 0.5rem;
    }

    > .btn {
      align-self: flex-start;
    }
  }

  &__exc {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.75rem;
    border-radius: $radius-md;
    background: $sky;
  }

  &__exc-head {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;

    .field {
      flex: 1;
    }
  }
}
</style>
