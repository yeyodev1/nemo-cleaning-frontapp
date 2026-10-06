<script setup lang="ts">
import { ref, watch } from 'vue'
import { bookingStatus, options } from '@/config/labels'
import type { BookingStatus } from '@/types/api'

const props = defineProps<{ status: BookingStatus; saving: boolean }>()
const emit = defineEmits<{ change: [status: BookingStatus, note: string] }>()
const next = ref<BookingStatus>(props.status)
const note = ref('')
const statuses = options(bookingStatus)

watch(() => props.status, (s) => (next.value = s))

function submit() {
  emit('change', next.value, note.value)
  note.value = ''
}
</script>

<template>
  <section class="card st">
    <h3>Estado del pedido</h3>
    <div class="st__chips" role="radiogroup" aria-label="Estado">
      <label v-for="s in statuses" :key="s.value" class="st__chip" :class="[{ 'is-on': next === s.value }, `st__chip--${bookingStatus[s.value].tone}`]">
        <input v-model="next" type="radio" name="status" :value="s.value" class="sr-only" />
        {{ s.label }}
      </label>
    </div>
    <label class="field">
      <span class="field__label">Nota (opcional)</span>
      <input v-model="note" placeholder="Motivo del cambio" />
    </label>
    <button type="button" class="btn btn--primary st__btn" :disabled="saving || next === status" @click="submit">Cambiar estado</button>
  </section>
</template>

<style scoped lang="scss">
.st {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  h3 {
    font-size: $text-base;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__chip {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    padding: 0 0.85rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    font-size: $text-sm;
    font-weight: 700;
    cursor: pointer;

    &:focus-within {
      outline: 2.5px solid $aqua-deep;
      outline-offset: 2px;
    }

    &.is-on {
      background: $navy;
      border-color: $navy;
      color: #fff;
    }

    &--danger.is-on {
      background: $danger;
      border-color: $danger;
    }

    &--success.is-on {
      background: $success;
      border-color: $success;
    }
  }

  &__btn {
    align-self: flex-start;
  }
}
</style>
