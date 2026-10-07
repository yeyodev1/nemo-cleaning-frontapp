<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { addDays, longDate, todayISO } from '@/utils/format'

const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="dnav">
    <button type="button" class="btn btn--ghost btn--icon" aria-label="Día anterior" @click="model = addDays(model, -1)">
      <AppIcon name="chevron-left" />
    </button>
    <label class="dnav__date">
      <span class="dnav__label">{{ longDate(model) }}</span>
      <input v-model="model" type="date" aria-label="Elegir fecha" />
    </label>
    <button type="button" class="btn btn--ghost btn--icon" aria-label="Día siguiente" @click="model = addDays(model, 1)">
      <AppIcon name="chevron-right" />
    </button>
    <button v-if="model !== todayISO()" type="button" class="btn btn--soft btn--sm" @click="model = todayISO()">Hoy</button>
  </div>
</template>

<style scoped lang="scss">
.dnav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  &__date {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    input {
      max-width: 200px;
      min-height: 40px;
      padding-block: 0.35rem;
    }
  }

  &__label {
    font-weight: 800;
    font-size: $text-sm;
    // Puede ocupar dos líneas: truncado, con el botón "Hoy" a 390 px se perdía el año.
    line-height: 1.25;

    &::first-letter {
      text-transform: uppercase;
    }
  }
}
</style>
