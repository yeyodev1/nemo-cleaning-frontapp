<script setup lang="ts">
import { STEPS } from '@/composables/booking/useBookingSteps'

defineProps<{ step: number }>()
</script>

<template>
  <nav class="progress" aria-label="Pasos de la reserva">
    <p class="progress__count">Paso {{ step }} de {{ STEPS.length }}</p>
    <ol class="progress__list">
      <li
        v-for="(s, i) in STEPS"
        :key="s.short"
        class="progress__item"
        :class="{ 'is-done': i + 1 < step, 'is-on': i + 1 === step }"
        :aria-current="i + 1 === step ? 'step' : undefined"
      >
        <span class="progress__bar"></span>
        <span class="progress__label">{{ s.short }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.progress {
  &__count {
    font-size: $text-xs;
    font-weight: 700;
    color: $aqua-ink;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  &__list {
    list-style: none;
    display: flex;
    gap: 0.35rem;
  }

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__bar {
    height: 5px;
    border-radius: 5px;
    background: $line;
    transition: background 0.35s $ease;
  }

  .is-done &__bar {
    background: $aqua;
  }

  .is-on &__bar {
    background: $navy;
  }

  &__label {
    display: none;
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;

    @include from('md') {
      display: block;
    }
  }

  .is-on &__label {
    color: $navy;
  }
}
</style>
