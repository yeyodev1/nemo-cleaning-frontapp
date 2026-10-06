<script setup lang="ts">
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import type { OfficePricing } from '@/types/api'

// Se edita el objeto reactivo del padre directamente (es parte del mismo formulario).
defineProps<{ pricing: OfficePricing }>()
</script>

<template>
  <div class="op">
    <div class="form-row">
      <MoneyField v-model="pricing.pricePerM2" label="Precio por m²" />
      <MoneyField v-model="pricing.pricePerChair" label="Por silla" />
    </div>
    <div class="form-row">
      <MoneyField v-model="pricing.pricePerDesk" label="Por escritorio" />
      <MoneyField v-model="pricing.pricePerBathroom" label="Por baño" />
    </div>
    <MoneyField v-model="pricing.minimum" label="Mínimo por servicio" hint="Si el cálculo da menos, se cobra este valor." />
    <fieldset class="field">
      <legend class="field__label">Descuento por frecuencia (%)</legend>
      <div class="form-row">
        <label class="field"><span class="field__hint">Semanal</span><input v-model.number="pricing.frequencyDiscounts.semanal" type="number" min="0" max="100" /></label>
        <label class="field"><span class="field__hint">Quincenal</span><input v-model.number="pricing.frequencyDiscounts.quincenal" type="number" min="0" max="100" /></label>
        <label class="field"><span class="field__hint">Mensual</span><input v-model.number="pricing.frequencyDiscounts.mensual" type="number" min="0" max="100" /></label>
      </div>
    </fieldset>
  </div>
</template>

<style scoped lang="scss">
.op {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

fieldset {
  border: 0;
}

.form-row > .field {
  flex-basis: 90px;
}
</style>
