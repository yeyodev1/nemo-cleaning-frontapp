<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import type { ServiceVariant } from '@/types/api'

/**
 * Opciones de precio de un servicio (tamaño de vehículo, medida, plan por m²…).
 * "Precio máx." solo se usa para mostrar un rango ($15 – $20); siempre se cobra "Precio".
 */
const model = defineModel<ServiceVariant[]>({ required: true })

function add() {
  model.value = [...model.value, { label: '', price: 0, priceMax: 0, durationMinutes: 0 }]
}
function remove(i: number) {
  model.value = model.value.filter((_, n) => n !== i)
}
</script>

<template>
  <fieldset class="ed">
    <legend>Opciones de precio <small>(tamaño, medida, plan…)</small></legend>
    <p v-if="!model.length" class="muted ed__hint">Sin opciones: se cobra el precio base.</p>
    <div v-for="(v, i) in model" :key="i" class="ed__row">
      <label class="field ed__label"><span class="field__label">Opción</span><input v-model="v.label" type="text" required maxlength="120" /></label>
      <MoneyField v-model="v.price" label="Precio" required />
      <MoneyField v-model="v.priceMax" label="Precio máx. (rango)" />
      <button type="button" class="btn btn--danger btn--icon" :aria-label="`Quitar opción ${v.label}`" @click="remove(i)"><AppIcon name="trash" :size="18" /></button>
    </div>
    <button type="button" class="btn btn--soft btn--sm" @click="add"><AppIcon name="plus" :size="16" /> Agregar opción</button>
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
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.6rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px dashed $line;

    > * {
      flex: 1 1 120px;
    }

    .btn--icon {
      flex: 0 0 auto;
    }
  }

  &__label {
    flex-basis: 100% !important;
  }
}
</style>
