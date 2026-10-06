<script setup lang="ts">
import { ref, watch } from 'vue'
import { publicService } from '@/services/public.service'
import type { Slot } from '@/types/api'

/**
 * Fecha + hora. Muestra los cupos de /public/availability como referencia,
 * pero el personal puede escribir otra hora (el panel no está atado a los cupos).
 */
const props = defineProps<{ branch: string; keepTime?: string }>()
const date = defineModel<string>('date', { required: true })
const time = defineModel<string>('time', { required: true })
const slots = ref<Slot[]>([])
const loading = ref(false)

async function load() {
  slots.value = []
  if (!props.branch || !date.value) return
  loading.value = true
  try {
    slots.value = (await publicService.availability(props.branch, date.value)).slots
  } catch {
    slots.value = []
  } finally {
    loading.value = false
  }
}
watch(() => [props.branch, date.value], load, { immediate: true })
</script>

<template>
  <div class="slots">
    <div class="form-row">
      <label class="field">
        <span class="field__label">Fecha</span>
        <input v-model="date" type="date" required />
      </label>
      <label class="field">
        <span class="field__label">Hora</span>
        <input v-model="time" type="time" step="900" required />
      </label>
    </div>
    <p v-if="loading" class="slots__hint">Cargando cupos…</p>
    <div v-else-if="slots.length" class="slots__grid" role="group" aria-label="Cupos del día">
      <button
        v-for="s in slots"
        :key="s.time"
        type="button"
        class="slots__btn"
        :class="{ 'is-on': time === s.time, 'is-busy': !s.available && s.time !== keepTime }"
        :aria-pressed="time === s.time"
        @click="time = s.time"
      >
        {{ s.time }}
      </button>
    </div>
    <p v-else-if="branch && date" class="slots__hint">Sin cupos publicados para ese día; puedes escribir la hora.</p>
  </div>
</template>

<style scoped lang="scss">
.slots {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__btn {
    min-width: 72px;
    min-height: $tap;
    padding: 0 0.75rem;
    border-radius: $radius-sm;
    border: 1.5px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: $text-sm;
    font-variant-numeric: tabular-nums;

    &.is-busy {
      background: $sky-2;
      color: $ink-muted;
      text-decoration: line-through;
    }

    &.is-on {
      background: $navy;
      border-color: $navy;
      color: #fff;
      text-decoration: none;
    }
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
