<script setup lang="ts">
import { ref, watch } from 'vue'
import { fromCents, toCents } from '@/utils/format'

/** Campo de dinero: se escribe en dólares, el v-model va en centavos. */
const props = defineProps<{ modelValue: number; label: string; required?: boolean; hint?: string }>()
const emit = defineEmits<{ 'update:modelValue': [cents: number] }>()

const text = ref(fromCents(props.modelValue))
let focused = false

watch(
  () => props.modelValue,
  (v) => {
    if (!focused) text.value = fromCents(v)
  },
)

function onInput(e: Event) {
  text.value = (e.target as HTMLInputElement).value
  emit('update:modelValue', toCents(text.value))
}

function onBlur() {
  focused = false
  text.value = fromCents(props.modelValue)
}
</script>

<template>
  <label class="field">
    <span class="field__label">{{ label }}</span>
    <span class="money-field">
      <span class="money-field__sign" aria-hidden="true">$</span>
      <input
        :value="text"
        type="text"
        inputmode="decimal"
        :required="required"
        @focus="focused = true"
        @blur="onBlur"
        @input="onInput"
      />
    </span>
    <span v-if="hint" class="field__hint">{{ hint }}</span>
  </label>
</template>

<style scoped lang="scss">
.money-field {
  position: relative;
  display: block;

  &__sign {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: $ink-muted;
    font-weight: 700;
  }

  input {
    padding-left: 1.8rem;
    font-variant-numeric: tabular-nums;
  }
}
</style>
