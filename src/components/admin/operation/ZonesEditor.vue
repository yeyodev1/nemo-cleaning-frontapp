<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

/** Lista de urbanizaciones de la sucursal (REP ZONA): se agregan escribiendo y se quitan con la x. */
const zones = defineModel<string[]>({ required: true })
const text = ref('')

function add() {
  const z = text.value.trim()
  if (z && !zones.value.some((x) => x.toLowerCase() === z.toLowerCase())) zones.value = [...zones.value, z]
  text.value = ''
}
</script>

<template>
  <div class="ze">
    <ul v-if="zones.length" class="ze__list">
      <li v-for="z in zones" :key="z" class="ze__chip">
        {{ z }}
        <button type="button" :aria-label="`Quitar ${z}`" @click="zones = zones.filter((x) => x !== z)"><AppIcon name="x" :size="14" /></button>
      </li>
    </ul>
    <p v-else class="ze__empty">Sin urbanizaciones: la web pedirá escribirla a mano.</p>
    <div class="ze__add">
      <input v-model="text" type="text" placeholder="Nueva urbanización" aria-label="Nueva urbanización" @keydown.enter.prevent="add" />
      <button type="button" class="btn btn--ghost btn--sm" :disabled="!text.trim()" @click="add"><AppIcon name="plus" :size="16" /> Agregar</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ze {
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
