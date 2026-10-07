<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

/**
 * Código de 6 dígitos. Es un solo <input> transparente sobre 6 casillas:
 * así pegar, el autocompletado del SMS/correo (one-time-code) y borrar
 * funcionan como en cualquier campo, sin saltar de input en input. Sin
 * maxlength: un código pegado como "123 456" se cortaría antes de limpiarlo.
 */
const model = defineModel<string>({ required: true })
const props = defineProps<{ disabled?: boolean; invalid?: boolean; label?: string }>()
const emit = defineEmits<{ complete: [code: string] }>()

const input = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const slots = computed(() => Array.from({ length: 6 }, (_, i) => model.value[i] || ''))
const active = computed(() => Math.min(model.value.length, 5))

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 6)
  el.value = digits
  model.value = digits
  if (digits.length === 6) emit('complete', digits)
}

function focus() {
  input.value?.focus()
}

onMounted(focus)
defineExpose({ focus })
</script>

<template>
  <div class="code" :class="{ 'code--invalid': props.invalid, 'code--disabled': props.disabled }" @click="focus">
    <input
      ref="input"
      class="code__input"
      :value="model"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern="[0-9]*"
      :aria-label="props.label || 'Código de 6 dígitos'"
      :aria-invalid="props.invalid || undefined"
      :disabled="props.disabled"
      autofocus
      @input="onInput"
      @focus="focused = true"
      @blur="focused = false"
    />
    <span
      v-for="(d, i) in slots"
      :key="i"
      class="code__slot"
      :class="{ 'code__slot--filled': d, 'code__slot--active': focused && i === active }"
      aria-hidden="true"
      >{{ d }}</span
    >
  </div>
</template>

<style scoped lang="scss">
.code {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.45rem;
  max-width: 360px;

  &__input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    // El texto real queda invisible; las casillas lo pintan.
    color: transparent;
    caret-color: transparent;
    font-size: 16px; // iOS no hace zoom con ≥ 16px
    letter-spacing: 2.6em;
    z-index: 1;
  }

  &__slot {
    height: 56px;
    border-radius: $radius-sm;
    border: 1.5px solid $line-strong;
    background: $surface;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 800;
    color: $navy;
    font-variant-numeric: tabular-nums;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;

    @include from('md') {
      height: 62px;
    }

    &--filled {
      border-color: $navy;
      background: $sky;
    }

    &--active {
      border-color: $aqua-deep;
      box-shadow: 0 0 0 3px rgba($aqua, 0.3);
    }
  }

  &--invalid &__slot {
    border-color: $danger;
  }

  &--disabled {
    opacity: 0.6;
  }
}
</style>
