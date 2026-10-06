<script setup lang="ts">
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{ modelValue: number; min?: number; max?: number; label: string }>(), {
  min: 0,
  max: 99,
})
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const set = (v: number) => emit('update:modelValue', Math.min(props.max, Math.max(props.min, v)))
</script>

<template>
  <div class="stepper" role="group" :aria-label="`Cantidad de ${label}`">
    <button
      type="button"
      class="stepper__btn"
      :disabled="modelValue <= min"
      :aria-label="`Quitar uno de ${label}`"
      @click="set(modelValue - 1)"
    >
      <AppIcon name="minus" :size="18" />
    </button>
    <output class="stepper__value" aria-live="polite">{{ modelValue }}</output>
    <button
      type="button"
      class="stepper__btn stepper__btn--plus"
      :disabled="modelValue >= max"
      :aria-label="`Agregar uno de ${label}`"
      @click="set(modelValue + 1)"
    >
      <AppIcon name="plus" :size="18" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 3px;
  border-radius: $radius-pill;
  background: $sky-2;

  &__btn {
    width: $tap;
    height: $tap;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $surface;
    color: $navy;
    box-shadow: $shadow-sm;
    transition: transform 0.15s $ease, background 0.2s;

    &:active:not(:disabled) {
      transform: scale(0.9);
    }

    &:disabled {
      opacity: 0.4;
      box-shadow: none;
    }

    &--plus {
      background: $navy;
      color: #fff;
    }
  }

  &__value {
    min-width: 2ch;
    text-align: center;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
}
</style>
