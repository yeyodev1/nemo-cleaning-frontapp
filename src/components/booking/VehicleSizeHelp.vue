<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { vehicleSizes } from '@/config/landing'

/** Clasificación de vehículos del catálogo NEMO CAR, para elegir bien el tamaño. */
defineProps<{ open?: boolean; dark?: boolean }>()
</script>

<template>
  <details class="sizes" :class="{ 'sizes--dark': dark }" :open="open">
    <summary><AppIcon name="info" :size="16" /> ¿Qué tamaño es mi vehículo?</summary>
    <dl>
      <div v-for="v in vehicleSizes" :key="v.label">
        <dt>{{ v.label }}</dt>
        <dd>{{ v.examples }}</dd>
      </div>
    </dl>
  </details>
</template>

<style scoped lang="scss">
.sizes {
  border-radius: $radius-sm;
  background: $sky;
  border: 1px solid $line;
  font-size: $text-xs;

  summary {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: $tap;
    padding: 0 0.75rem;
    font-weight: 600;
    color: $navy;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  dl {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0 0.75rem 0.75rem;
  }

  dt {
    font-weight: 700;
    color: $navy;
  }

  dd {
    color: $ink-soft;
  }

  &--dark {
    background: rgba(#fff, 0.05);
    border-color: $dark-line;

    summary,
    dt {
      color: #fff;
    }

    summary svg {
      color: $orange;
    }

    dd {
      color: $on-dark-soft;
    }
  }
}
</style>
