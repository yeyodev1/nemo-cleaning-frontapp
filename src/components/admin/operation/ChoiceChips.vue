<script setup lang="ts">
/**
 * Opciones como botones grandes (un toque en el celular en vez de abrir un select).
 * `multiple` = varios a la vez (operadores). El color pinta un punto (operador en la agenda).
 */
export interface Choice {
  value: string
  label: string
  color?: string
  hint?: string
}

const props = defineProps<{ options: Choice[]; modelValue: string | string[]; multiple?: boolean; label: string; small?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | string[]] }>()

function isOn(v: string) {
  return Array.isArray(props.modelValue) ? props.modelValue.includes(v) : props.modelValue === v
}

function toggle(v: string) {
  if (!props.multiple) return emit('update:modelValue', v)
  const list = Array.isArray(props.modelValue) ? props.modelValue : []
  emit('update:modelValue', list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
}
</script>

<template>
  <div class="chips" :class="{ 'chips--small': small }" :role="multiple ? 'group' : 'radiogroup'" :aria-label="label">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      class="chips__item"
      :class="{ 'is-on': isOn(o.value) }"
      :role="multiple ? 'checkbox' : 'radio'"
      :aria-checked="isOn(o.value)"
      :title="o.hint"
      @click="toggle(o.value)"
    >
      <span v-if="o.color" class="chips__dot" :style="{ background: o.color }" aria-hidden="true"></span>
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: $tap;
    padding: 0 0.9rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line-strong;
    background: $surface;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-soft;
    transition:
      background-color $dur-fast ease,
      border-color $dur-fast ease,
      color $dur-fast ease,
      transform $dur-fast $ease-out;

    &:active {
      transform: scale(0.97);
    }

    &.is-on {
      border-color: $navy;
      background: $navy;
      color: #fff;
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
  }

  &--small &__item {
    min-height: 38px;
    padding: 0 0.7rem;
    font-size: $text-xs;
  }
}
</style>
