<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { fromCents, toCents } from '@/utils/format'
import type { CommissionTier } from '@/types/operation'

/**
 * Tramos del FEE: "si el excedente pasa de $X, se paga Y %". El primero siempre empieza en
 * $0. Se escriben en dólares; el modelo guarda centavos.
 */
const tiers = defineModel<CommissionTier[]>({ required: true })

function setAbove(i: number, v: string) {
  tiers.value = tiers.value.map((t, j) => (j === i ? { ...t, above: Math.max(0, toCents(v)) } : t))
}
function setPercent(i: number, v: string) {
  tiers.value = tiers.value.map((t, j) => (j === i ? { ...t, percent: Math.min(100, Math.max(0, Number(v) || 0)) } : t))
}
function add() {
  const last = tiers.value[tiers.value.length - 1]
  tiers.value = [...tiers.value, { above: (last?.above || 0) + 500, percent: last?.percent || 30 }]
}
function remove(i: number) {
  tiers.value = tiers.value.filter((_, j) => j !== i)
}
</script>

<template>
  <div class="tr">
    <div v-for="(t, i) in tiers" :key="i" class="tr__row">
      <label class="field">
        <span class="field__label">{{ i === 0 ? 'Excedente desde ($)' : 'Si pasa de ($)' }}</span>
        <input :value="fromCents(t.above)" type="text" inputmode="decimal" :disabled="i === 0" @change="setAbove(i, ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="field">
        <span class="field__label">Se paga (%)</span>
        <input :value="t.percent" type="number" min="0" max="100" step="1" inputmode="numeric" @change="setPercent(i, ($event.target as HTMLInputElement).value)" />
      </label>
      <button type="button" class="btn btn--ghost btn--icon" :disabled="tiers.length === 1" :aria-label="`Quitar tramo ${i + 1}`" @click="remove(i)">
        <AppIcon name="trash" :size="16" />
      </button>
    </div>
    <button type="button" class="btn btn--ghost btn--sm tr__add" @click="add"><AppIcon name="plus" :size="16" /> Agregar tramo</button>
  </div>
</template>

<style scoped lang="scss">
.tr {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__row {
    display: grid;
    grid-template-columns: 1fr 0.8fr auto;
    align-items: end;
    gap: 0.5rem;
  }

  &__add {
    align-self: flex-start;
  }
}
</style>
