<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { clock12 } from '@/utils/format'

/**
 * Horas fijas de los turnos (8:00 am, 9:30 am…). Vacío = la web arma los turnos cada
 * `slotMinutes` entre apertura y cierre, como antes.
 */
const times = defineModel<string[]>({ required: true })
defineProps<{ every: number }>()
const text = ref('')

function add() {
  const t = text.value
  if (/^\d{2}:\d{2}$/.test(t) && !times.value.includes(t)) times.value = [...times.value, t].sort()
  text.value = ''
}
</script>

<template>
  <div class="st">
    <ul v-if="times.length" class="st__list">
      <li v-for="t in times" :key="t" class="st__chip">
        {{ clock12(t) }}
        <button type="button" :aria-label="`Quitar ${clock12(t)}`" @click="times = times.filter((x) => x !== t)"><AppIcon name="x" :size="14" /></button>
      </li>
    </ul>
    <p v-else class="st__empty">Sin horas fijas: turnos cada {{ every }} min entre apertura y cierre.</p>
    <div class="st__add">
      <input v-model="text" type="time" step="900" aria-label="Nueva hora de turno" @keydown.enter.prevent="add" />
      <button type="button" class="btn btn--ghost btn--sm" :disabled="!text" @click="add"><AppIcon name="plus" :size="16" /> Agregar hora</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.st {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.4rem 0.3rem 0.75rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
    font-size: $text-sm;
    font-weight: 600;
    font-variant-numeric: tabular-nums;

    button {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(18, 38, 63, 0.1);
      }
    }
  }

  &__empty {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__add {
    display: flex;
    gap: 0.5rem;

    input {
      flex: 1;
      min-width: 0;
    }
  }
}
</style>
