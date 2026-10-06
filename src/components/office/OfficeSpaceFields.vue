<script setup lang="ts">
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import { officeFrequency, options } from '@/config/labels'
import type { Branch, OfficeFrequency } from '@/types/api'

interface SpaceForm {
  branch: string
  squareMeters: number
  chairs: number
  desks: number
  bathrooms: number
  frequency: OfficeFrequency
}

defineProps<{ form: SpaceForm; branches: Branch[]; errors: Record<string, string>; discounts?: Record<string, number> }>()
const frequencies = options(officeFrequency)
</script>

<template>
  <fieldset class="space">
    <legend class="space__legend">Tu oficina</legend>

    <label class="field">
      <span class="field__label">Sucursal más cercana</span>
      <select v-model="form.branch" :aria-invalid="!!errors.branch">
        <option value="" disabled>Elige una sucursal</option>
        <option v-for="b in branches" :key="b._id" :value="b._id">{{ b.name }}</option>
      </select>
      <span v-if="errors.branch" class="field__error">{{ errors.branch }}</span>
    </label>

    <label class="field">
      <span class="field__label">Área aproximada (m²)</span>
      <input v-model.number="form.squareMeters" type="number" inputmode="numeric" min="1" step="1" :aria-invalid="!!errors.squareMeters" />
      <span v-if="errors.squareMeters" class="field__error">{{ errors.squareMeters }}</span>
    </label>

    <div class="space__counts">
      <div class="space__count">
        <span>Sillas</span>
        <QuantityStepper v-model="form.chairs" label="sillas" :max="999" />
      </div>
      <div class="space__count">
        <span>Escritorios</span>
        <QuantityStepper v-model="form.desks" label="escritorios" :max="999" />
      </div>
      <div class="space__count">
        <span>Baños</span>
        <QuantityStepper v-model="form.bathrooms" label="baños" :max="50" />
      </div>
    </div>

    <div class="field">
      <span class="field__label" id="freq-label">Frecuencia</span>
      <div class="space__freq" role="radiogroup" aria-labelledby="freq-label">
        <label v-for="f in frequencies" :key="f.value" class="freq" :class="{ 'is-on': form.frequency === f.value }">
          <input v-model="form.frequency" type="radio" name="frequency" :value="f.value" class="sr-only" />
          <strong>{{ f.label }}</strong>
          <small v-if="discounts && discounts[f.value]">-{{ discounts[f.value] }}%</small>
          <small v-else-if="f.value === 'unica'">Sin compromiso</small>
        </label>
      </div>
    </div>
  </fieldset>
</template>

<style scoped lang="scss">
.space {
  border: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__legend {
    font-size: $text-lg;
    font-weight: 800;
    margin-bottom: 0.75rem;
  }

  &__counts {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__count {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    border-radius: $radius-md;
    background: $sky;
    border: 1px solid $line;
    font-weight: 700;
    font-size: $text-sm;
  }

  &__freq {
    @include flex-cards(130px, 0.5rem);
  }
}

.freq {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-height: 64px;
  justify-content: center;
  padding: 0.65rem 0.85rem;
  border-radius: $radius-md;
  border: 1.5px solid $line;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  strong {
    font-size: $text-sm;
  }

  small {
    font-size: $text-xs;
    color: $aqua-ink;
    font-weight: 700;
  }

  &.is-on {
    border-color: $navy;
    background: $navy-soft;
  }

  &:focus-within {
    outline: 2.5px solid $aqua-deep;
    outline-offset: 2px;
  }
}
</style>
