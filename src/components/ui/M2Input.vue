<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Cantidad en m² con decimales (patios, oficinas). Acepta coma o punto y redondea a 2 cifras,
 * igual que el servidor. Vacío o 0 = quitar del pedido.
 */
const props = defineProps<{ modelValue: number; label: string; max?: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const text = ref(props.modelValue ? String(props.modelValue) : '')
watch(
  () => props.modelValue,
  (v) => {
    const current = parseFloat(text.value.replace(',', '.')) || 0
    if (Math.abs(current - v) > 0.001) text.value = v ? String(v) : ''
  },
)

function onInput(e: Event) {
  text.value = (e.target as HTMLInputElement).value
  const n = parseFloat(text.value.replace(',', '.'))
  const v = Number.isFinite(n) && n > 0 ? Math.min(props.max ?? 10000, Math.round(n * 100) / 100) : 0
  emit('update:modelValue', v)
}
</script>

<template>
  <label class="m2">
    <input
      :value="text"
      type="text"
      inputmode="decimal"
      placeholder="0"
      :aria-label="`Metros cuadrados de ${label}`"
      @input="onInput"
    />
    <span aria-hidden="true">m²</span>
  </label>
</template>

<style scoped lang="scss">
.m2 {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;

  input {
    width: 92px;
    text-align: right;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  span {
    font-weight: 600;
    color: $ink-soft;
    font-size: $text-sm;
  }
}
</style>
