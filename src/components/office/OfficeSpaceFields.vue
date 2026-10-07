<script setup lang="ts">
import { computed } from 'vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import { money } from '@/utils/format'
import { tierMinQty, tierRanges } from '@/utils/pricing'
import type { Branch, OfficePlan, OfficePricing } from '@/types/api'

interface SpaceForm {
  branch: string
  squareMeters: number
  plan: OfficePlan
  chairsFabric: number
  chairsMixed: number
  windows: number
  bathrooms: number
}

const props = defineProps<{ form: SpaceForm; branches: Branch[]; errors: Record<string, string>; pricing: OfficePricing | null }>()

// Planes del catálogo NEMO HOME & OFFICE: precio por m² o tarifa especial.
const plans = computed(() => [
  { value: 'basico' as const, label: 'Básico', price: props.pricing ? `${money(props.pricing.basicPerM2)} / m²` : '' },
  { value: 'profundo' as const, label: 'Profundo', price: props.pricing ? `${money(props.pricing.deepPerM2)} / m²` : '' },
  { value: 'mensual' as const, label: 'Plan mensual', price: 'Tarifa especial' },
])
const minWindows = computed(() => (props.pricing ? tierMinQty(props.pricing.windowTiers) : 2))
const tierText = (tiers: OfficePricing['windowTiers']) =>
  tierRanges(tiers).map((t) => `${t.label}: ${money(t.price)} c/u`).join(' · ')

// Ventanales desde el mínimo: de 0 salta al mínimo y por debajo vuelve a 0.
function setWindows(v: number) {
  const f = props.form
  f.windows = v > 0 && v < minWindows.value ? (v > f.windows ? minWindows.value : 0) : v
}
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
      <span class="field__label">Metros cuadrados (m²)</span>
      <input
        v-model.number="form.squareMeters"
        type="number"
        inputmode="decimal"
        min="0"
        step="0.01"
        placeholder="Ej. 120"
        :aria-invalid="!!errors.squareMeters"
      />
      <span v-if="errors.squareMeters" class="field__error">{{ errors.squareMeters }}</span>
    </label>

    <div class="field">
      <span id="plan-label" class="field__label">Plan</span>
      <div class="space__freq" role="radiogroup" aria-labelledby="plan-label">
        <label v-for="p in plans" :key="p.value" class="freq" :class="{ 'is-on': form.plan === p.value }">
          <input v-model="form.plan" type="radio" name="plan" :value="p.value" class="sr-only" />
          <strong>{{ p.label }}</strong>
          <small>{{ p.price }}</small>
        </label>
      </div>
    </div>

    <div class="space__counts">
      <p class="space__sub">Adicionales opcionales</p>
      <div class="space__count">
        <span>Sillas de tela <small v-if="pricing">{{ money(pricing.chairFabric) }} c/u</small></span>
        <QuantityStepper v-model="form.chairsFabric" label="sillas de tela" :max="999" />
      </div>
      <div class="space__count">
        <span>Sillas mixtas <small v-if="pricing">{{ money(pricing.chairMixed) }} c/u</small></span>
        <QuantityStepper v-model="form.chairsMixed" label="sillas mixtas" :max="999" />
      </div>
      <div class="space__count">
        <span>Ventanales <small v-if="pricing">{{ tierText(pricing.windowTiers) }}</small></span>
        <QuantityStepper :model-value="form.windows" label="ventanales" :max="999" @update:model-value="setWindows" />
      </div>
      <span v-if="errors.windows" class="field__error">{{ errors.windows }}</span>
      <div class="space__count">
        <span>Baños (desinfección) <small v-if="pricing">{{ tierText(pricing.bathroomTiers) }}</small></span>
        <QuantityStepper v-model="form.bathrooms" label="baños" :max="99" />
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

  &__sub {
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
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

    > span {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    small {
      font-weight: 500;
      font-size: $text-xs;
      color: $ink-muted;
    }
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
    color: $orange-ink;
    font-weight: 700;
  }

  &.is-on {
    border-color: $navy;
    background: $navy-soft;
  }

  &:focus-within {
    outline: 2.5px solid $orange-deep;
    outline-offset: 2px;
  }
}
</style>
