<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { monthLabel } from '@/utils/format'

/** Selector de mes con flechas (como cambiar de hoja en el Excel). v-model "YYYY-MM". */
const model = defineModel<string>({ required: true })
defineProps<{ label?: string }>()

function shift(n: number) {
  const [y = 2026, m = 1] = model.value.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + n, 1))
  model.value = d.toISOString().slice(0, 7)
}
const text = computed(() => monthLabel(model.value))
</script>

<template>
  <div class="mnav">
    <span class="field__label">{{ label || 'Mes' }}</span>
    <div class="mnav__row">
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Mes anterior" @click="shift(-1)">
        <AppIcon name="chevron-left" />
      </button>
      <label class="mnav__pick">
        <span class="mnav__text">{{ text }}</span>
        <input v-model="model" type="month" aria-label="Elegir mes" />
      </label>
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Mes siguiente" @click="shift(1)">
        <AppIcon name="chevron-right" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mnav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  &__row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  &__pick {
    position: relative;
    flex: 1;
    min-height: $tap;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $line-strong;
    border-radius: $radius-sm;
    background: $surface;
    font-weight: 700;
    cursor: pointer;

    input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    &:focus-within {
      outline: 2.5px solid $orange-deep;
      outline-offset: 2px;
    }
  }

  &__text {
    white-space: nowrap;
  }

  &__text::first-letter {
    text-transform: uppercase;
  }
}
</style>
