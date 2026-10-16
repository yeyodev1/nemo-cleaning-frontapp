<script setup lang="ts">
/**
 * Interruptor sí/no (reemplaza al checkbox nativo). Toda la fila es el área táctil (≥ 44px).
 * v-model booleano; el texto va por `label` o por el slot por defecto, con `hint` opcional.
 */
const props = defineProps<{ modelValue: boolean; label?: string; hint?: string; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function toggle() {
  if (!props.disabled) emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    class="toggle"
    :class="{ 'is-on': modelValue }"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="toggle__text">
      <span class="toggle__label"><slot>{{ label }}</slot></span>
      <span v-if="hint" class="toggle__hint">{{ hint }}</span>
    </span>
    <span class="toggle__track" aria-hidden="true"><span class="toggle__knob"></span></span>
  </button>
</template>

<style scoped lang="scss">
.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  width: 100%;
  min-height: $tap;
  padding: 0.45rem 0.2rem;
  text-align: left;
  border-radius: $radius-md;

  &:disabled {
    opacity: 0.55;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  &__label {
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__track {
    position: relative;
    flex-shrink: 0;
    width: 48px;
    height: 28px;
    border-radius: $radius-pill;
    background: $line-strong;
    transition: background-color $dur-fast $ease-out;
  }

  &__knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: $surface;
    box-shadow: 0 1px 3px rgba($navy, 0.3);
    transition: transform $dur-fast $ease-out;
  }

  &:active &__knob {
    width: 25px;
  }

  &.is-on &__track {
    background: $navy;
  }

  &.is-on &__knob {
    transform: translateX(20px);
  }

  &.is-on:active &__knob {
    transform: translateX(17px);
  }
}
</style>
