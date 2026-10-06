<script setup lang="ts">
// Wordmark de Nemo Cleaning: gota con brillo + nombre. `light` para fondos oscuros.
withDefaults(defineProps<{ light?: boolean; compact?: boolean; height?: number }>(), { height: 36 })
</script>

<template>
  <span class="logo" :class="{ 'logo--light': light }" :style="{ height: `${height}px` }">
    <svg class="logo__mark" viewBox="0 0 40 40" :height="height" :width="height" aria-hidden="true">
      <defs>
        <linearGradient id="nemo-drop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#19C3B8" />
          <stop offset="1" stop-color="#0B4F8A" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#nemo-drop)" />
      <path d="M20 8c4.6 6 8 10.3 8 14.4A8 8 0 0 1 12 22.4C12 18.3 15.4 14 20 8Z" fill="#fff" />
      <path d="M16.6 23.2a3.6 3.6 0 0 0 3.4 3.4" stroke="#19C3B8" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M30.5 7.5v4M28.5 9.5h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
    </svg>
    <span v-if="!compact" class="logo__word">
      <strong>Nemo</strong><span>Cleaning</span>
    </span>
    <span class="sr-only">Nemo Cleaning</span>
  </span>
</template>

<style scoped lang="scss">
.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: $navy;

  &__mark {
    flex-shrink: 0;
  }

  &__word {
    display: inline-flex;
    align-items: baseline;
    gap: 0.3rem;
    font-family: $font-display;
    font-size: 1.22rem;
    letter-spacing: -0.03em;
    line-height: 1;

    strong {
      font-weight: 800;
    }

    span {
      font-weight: 500;
      color: $aqua-ink;
    }
  }

  &--light {
    color: #fff;

    .logo__word span {
      color: $aqua;
    }
  }
}
</style>
