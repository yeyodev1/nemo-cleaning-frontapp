<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import { MONTHS_SHORT } from '@/composables/admin/useMonthGrid'
import type { StaffOption } from '@/types/grid'

export interface AddPersonPayload {
  staff: StaffOption | null
  name: string
  position: string
  branch: string
  month: number
  amount: number | null
}

/**
 * "Agregar colaborador" a una grilla: alguien del Personal o una persona nueva (nombre + cargo).
 * El monto del mes es opcional: sin monto, la fila aparece vacía para escribir en la tabla.
 */
const props = defineProps<{
  open: boolean
  title: string
  amountLabel: string
  newHint: string
  staff: StaffOption[]
  branches: { _id: string; name: string }[]
  defaultBranch: string
  month: number
  busy?: boolean
}>()
const emit = defineEmits<{ close: []; add: [payload: AddPersonPayload] }>()

const POSITIONS = ['Supervisor', 'Asistente de base', 'Lavador']
const form = reactive({ mode: 'staff', staffId: '', name: '', position: 'Lavador', branch: '', month: 0, amount: 0 })

watch(
  () => props.open,
  (open) => {
    if (!open) return
    Object.assign(form, { mode: props.staff.length ? 'staff' : 'new', staffId: '', name: '', position: 'Lavador', amount: 0 })
    form.branch = props.defaultBranch || props.branches[0]?._id || ''
    form.month = props.month
  },
)

const picked = computed(() => props.staff.find((s) => s._id === form.staffId) || null)
const canAdd = computed(() => (form.mode === 'staff' ? !!picked.value : !!form.name.trim() && !!form.branch))

function submit() {
  if (!canAdd.value) return
  emit('add', {
    staff: form.mode === 'staff' ? picked.value : null,
    name: form.mode === 'staff' ? picked.value!.name : form.name.trim(),
    position: form.mode === 'staff' ? picked.value!.position : form.position.trim(),
    branch: form.mode === 'staff' ? picked.value!.branches[0] || form.branch : form.branch,
    month: form.month,
    amount: form.amount ? form.amount : null,
  })
}
</script>

<template>
  <BaseSheet :open="open" :title="title" @close="emit('close')">
    <form id="add-person" class="form" @submit.prevent="submit">
      <SegTabs v-model="form.mode" :tabs="[{ value: 'staff', label: 'Del personal' }, { value: 'new', label: 'Persona nueva' }]" />
      <label v-if="form.mode === 'staff'" class="field">
        <span class="field__label">Colaborador</span>
        <select v-model="form.staffId">
          <option value="">Elige…</option>
          <option v-for="s in staff" :key="s._id" :value="s._id">{{ s.name }}{{ s.position ? ` · ${s.position}` : '' }}</option>
        </select>
        <span v-if="!staff.length" class="field__hint">Todo el personal activo ya está en la tabla. Usa "Persona nueva".</span>
      </label>
      <template v-else>
        <label class="field">
          <span class="field__label">Nombre</span>
          <input v-model="form.name" type="text" maxlength="120" autocomplete="off" placeholder="Ej.: Mathias" />
        </label>
        <label class="field">
          <span class="field__label">Cargo</span>
          <input v-model="form.position" type="text" list="add-person-positions" maxlength="80" />
          <datalist id="add-person-positions"><option v-for="p in POSITIONS" :key="p" :value="p" /></datalist>
        </label>
        <label v-if="branches.length > 1" class="field">
          <span class="field__label">Sucursal</span>
          <select v-model="form.branch">
            <option v-for="b in branches" :key="b._id" :value="b._id">{{ b.name }}</option>
          </select>
        </label>
        <p class="hint">{{ newHint }}</p>
      </template>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Mes</span>
          <select v-model.number="form.month">
            <option v-for="(m, i) in MONTHS_SHORT" :key="m" :value="i">{{ m }}</option>
          </select>
        </label>
        <MoneyField v-model="form.amount" :label="amountLabel" hint="Opcional" />
      </div>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="add-person" class="btn btn--primary" :disabled="!canAdd || busy">{{ busy ? 'Agregando…' : 'Agregar' }}</button>
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
  color: $ink-muted;
}
</style>
