<script setup lang="ts">
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import TiersEditor from '@/components/admin/catalog/TiersEditor.vue'
import type { OfficePricing } from '@/types/api'

// Se edita el objeto reactivo del padre directamente (es parte del mismo formulario).
// Tarifas del catálogo Home & Office; el plan mensual es tarifa especial y no tiene precio aquí.
defineProps<{ pricing: OfficePricing }>()
</script>

<template>
  <div class="op">
    <div class="form-row">
      <MoneyField v-model="pricing.basicPerM2" label="Plan Básico (por m²)" />
      <MoneyField v-model="pricing.deepPerM2" label="Plan Profundo (por m²)" />
    </div>
    <div class="form-row">
      <MoneyField v-model="pricing.chairFabric" label="Silla de tela (c/u)" />
      <MoneyField v-model="pricing.chairMixed" label="Silla mixta (c/u)" />
    </div>
    <TiersEditor v-model="pricing.windowTiers" legend="Ventanales" />
    <TiersEditor v-model="pricing.bathroomTiers" legend="Desinfección de sanitarios" />
    <p class="muted op__hint">Plan mensual: tarifa especial. La cotización queda sin valor y el equipo contacta al cliente.</p>
  </div>
</template>

<style scoped lang="scss">
.op {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__hint {
    font-size: $text-xs;
  }
}
</style>
