<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import type { PriceTier } from '@/types/api'

/**
 * Precio por cantidad: el precio del tramo alcanzado se aplica a todas las unidades
 * (ventanales x6 → 6 × $6,50). El tramo más bajo es la cantidad mínima.
 */
const model = defineModel<PriceTier[]>({ required: true })
defineProps<{ legend?: string }>()

function add() {
  const last = model.value[model.value.length - 1]
  model.value = [...model.value, { minQty: last ? last.minQty + 1 : 1, unitPrice: 0 }]
}
function remove(i: number) {
  model.value = model.value.filter((_, n) => n !== i)
}
</script>

<template>
  <fieldset class="ed">
    <legend>{{ legend || 'Precio por cantidad' }} <small>(precio unitario según el tramo alcanzado)</small></legend>
    <p v-if="!model.length" class="muted ed__hint">Sin tramos.</p>
    <div v-for="(t, i) in model" :key="i" class="ed__row">
      <label class="field"><span class="field__label">Desde (unidades)</span><input v-model.number="t.minQty" type="number" min="1" step="1" required /></label>
      <MoneyField v-model="t.unitPrice" label="Precio c/u" required />
      <button type="button" class="btn btn--danger btn--icon" :aria-label="`Quitar tramo desde ${t.minQty}`" @click="remove(i)"><AppIcon name="trash" :size="18" /></button>
    </div>
    <button type="button" class="btn btn--soft btn--sm" @click="add"><AppIcon name="plus" :size="16" /> Agregar tramo</button>
  </fieldset>
</template>

<style scoped lang="scss">
.ed {
  border: 1px solid $line;
  border-radius: $radius-md;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  legend {
    font-weight: 700;
    color: $navy;
    padding: 0 0.35rem;

    small {
      font-weight: 500;
      color: $ink-muted;
    }
  }

  &__hint {
    font-size: $text-xs;
  }

  &__row {
    display: flex;
    align-items: flex-end;
    gap: 0.6rem;

    > * {
      flex: 1 1 120px;
    }

    .btn--icon {
      flex: 0 0 auto;
    }
  }
}
</style>
