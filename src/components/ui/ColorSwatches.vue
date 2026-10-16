<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

/**
 * Selector de color con muestras redondas (reemplaza al `<input type="color">`).
 * v-model = hex. Si el valor actual no está en la paleta, se agrega al inicio.
 */
const PALETTE = [
  '#F05E23',
  '#12263F',
  '#2B6E9E',
  '#6FB1DE',
  '#14915F',
  '#0F8C8C',
  '#B97300',
  '#D13A4A',
  '#C2408F',
  '#7B4BC4',
]

const props = defineProps<{ modelValue: string; label: string; colors?: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const norm = (c: string) => (c || '').trim().toLowerCase()

const list = computed(() => {
  const base = props.colors?.length ? props.colors : PALETTE
  const current = props.modelValue
  return current && !base.some((c) => norm(c) === norm(current)) ? [current, ...base] : base
})

/** Check oscuro sobre colores claros, blanco sobre oscuros. */
function checkColor(hex: string) {
  const m = norm(hex).replace('#', '')
  const full = m.length === 3 ? m.split('').map((x) => x + x).join('') : m
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return '#fff'
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? '#12263f' : '#fff'
}
</script>

<template>
  <div class="swatches" role="radiogroup" :aria-label="label">
    <button
      v-for="c in list"
      :key="c"
      type="button"
      class="swatches__item"
      :class="{ 'is-on': norm(c) === norm(modelValue) }"
      role="radio"
      :aria-checked="norm(c) === norm(modelValue)"
      :aria-label="`Color ${c}`"
      :title="c"
      @click="emit('update:modelValue', c)"
    >
      <span class="swatches__dot" :style="{ background: c, color: checkColor(c) }">
        <AppIcon v-if="norm(c) === norm(modelValue)" name="check" />
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;

  &__item {
    width: $tap;
    height: $tap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  &__dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 1px rgba($navy, 0.12);
    transition:
      transform $dur-fast $ease-out,
      box-shadow $dur-fast $ease-out;

    :deep(svg) {
      width: 16px;
      height: 16px;
    }
  }

  &__item:active &__dot {
    transform: scale(0.92);
  }

  &__item.is-on &__dot {
    box-shadow:
      0 0 0 2px $surface,
      0 0 0 4px $navy;
  }
}
</style>
