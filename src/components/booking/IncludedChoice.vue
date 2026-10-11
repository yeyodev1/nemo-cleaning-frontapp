<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

/**
 * Opción incluida sin costo (Detailing Interior: techo o asientos). Botones grandes tipo
 * segmentado; si ya hay unidades en el carrito sin elegir, se marca para que no pase de largo.
 */
defineProps<{ label: string; options: string[]; modelValue: string; missing?: boolean; name: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <fieldset class="inc" :class="{ 'is-missing': missing }">
    <legend class="inc__label">
      {{ label }} <span class="inc__free">sin costo extra</span>
    </legend>
    <div class="inc__opts" role="radiogroup">
      <label v-for="o in options" :key="o" class="inc__opt" :class="{ 'is-on': modelValue === o }">
        <input
          type="radio"
          :name="name"
          :value="o"
          :checked="modelValue === o"
          @change="emit('update:modelValue', o)"
        />
        <AppIcon :name="modelValue === o ? 'check-circle' : 'plus'" :size="16" />
        {{ o }}
      </label>
    </div>
    <p v-if="missing" class="inc__warn" role="alert">
      <AppIcon name="alert" :size="14" /> Elige una opción para continuar.
    </p>
  </fieldset>
</template>

<style scoped lang="scss">
.inc {
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: $radius-md;
  background: $sky;
  transition: box-shadow $dur $ease-out;

  &.is-missing {
    box-shadow: inset 0 0 0 1.5px $orange;
  }

  &__label {
    float: left;
    width: 100%;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
  }

  &__free {
    margin-left: 0.25rem;
    font-size: $text-xs;
    font-weight: 600;
    color: $orange-ink;
  }

  &__opts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  &__opt {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 0 0.9rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;
    cursor: pointer;
    transition:
      border-color $dur-fast $ease-out,
      background-color $dur-fast $ease-out,
      transform $dur-fast $ease-out;

    &:active {
      transform: scale(0.97);
    }

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    &:has(input:focus-visible) {
      outline: 2px solid $navy;
      outline-offset: 2px;
    }

    &.is-on {
      border-color: $navy;
      background: $navy;
      color: #fff;
    }
  }

  &__warn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: $text-xs;
    font-weight: 600;
    color: $orange-ink;
  }
}
</style>
