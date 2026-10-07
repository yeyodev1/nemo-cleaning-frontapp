<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { cashConcept } from '@/config/financeLabels'
import { errorMessage, todayISO } from '@/utils/format'
import type { CashConcept, CashMovementInput } from '@/types/finance'

/** Movimiento manual de caja: propina en efectivo, entrega a gerencia, reposición, ajuste. */
const props = defineProps<{ open: boolean; date: string }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const scope = useAdminScope()
const toast = useToastStore()
const saving = ref(false)

const blank = (): CashMovementInput => ({
  branch: scope.branch || scope.visibleBranches[0]?._id || '',
  date: props.date || todayISO(),
  direction: 'out',
  concept: 'to_management',
  amount: 0,
  operator: null,
  detail: '',
})
const form = reactive<CashMovementInput>(blank())
watch(
  () => props.open,
  (o) => o && Object.assign(form, blank()),
)
// El saldo inicial se fija en "Inicio del registro" (arriba en la caja), no como movimiento.
const concepts = (Object.entries(cashConcept) as [CashConcept, (typeof cashConcept)[CashConcept]][]).filter(([k]) => k !== 'opening')
const fixedDirection = computed(() => cashConcept[form.concept].direction)
watch(
  () => form.concept,
  (c) => {
    const d = cashConcept[c].direction
    if (d !== 'both') form.direction = d
  },
)

async function save() {
  if (!form.branch) return toast.error('Elige la sucursal de la caja')
  if (form.amount <= 0) return toast.error('Ingresa un monto mayor a cero')
  saving.value = true
  try {
    await ledgerService.createMovement({ ...form, operator: form.operator || null })
    toast.success('Movimiento registrado en la caja')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" title="Nuevo movimiento de caja" @close="emit('close')">
    <form id="move-form" class="form" @submit.prevent="save">
      <p class="tip">Los cobros en efectivo y los gastos de caja menor ya entran solos. Aquí va todo lo demás.</p>
      <label class="field">
        <span class="field__label">Concepto</span>
        <select v-model="form.concept">
          <option v-for="[k, c] in concepts" :key="k" :value="k">{{ c.label }}</option>
        </select>
      </label>
      <div v-if="fixedDirection === 'both'" class="dir" role="radiogroup" aria-label="Tipo de movimiento">
        <label class="check"><input v-model="form.direction" type="radio" value="in" /> Ingreso (entra a caja)</label>
        <label class="check"><input v-model="form.direction" type="radio" value="out" /> Egreso (sale de caja)</label>
      </div>
      <p v-else class="dir-fixed">{{ form.direction === 'in' ? 'Entra dinero a la caja' : 'Sale dinero de la caja' }}</p>
      <div class="form-row">
        <label class="field"><span class="field__label">Fecha</span><input v-model="form.date" type="date" required /></label>
        <MoneyField v-model="form.amount" label="Monto" required />
      </div>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Sucursal</span>
          <select v-model="form.branch" required>
            <option v-for="b in scope.visibleBranches" :key="b._id" :value="b._id">{{ b.name }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Operador (opcional)</span>
          <select v-model="form.operator">
            <option :value="null">—</option>
            <option v-for="o in scope.operators" :key="o._id" :value="o._id">{{ o.name }}</option>
          </select>
        </label>
      </div>
      <label class="field">
        <span class="field__label">Detalle</span>
        <input v-model="form.detail" type="text" maxlength="300" placeholder="Ej. Cliente transfirió $2 de propina para Sebastián" />
      </label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="move-form" class="btn btn--primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.tip {
  font-size: $text-sm;
  color: $ink-muted;
}

.dir {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.25rem;
}

.dir-fixed {
  font-size: $text-sm;
  font-weight: 700;
  color: $navy;
}
</style>
