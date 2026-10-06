<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 88 })
</script>

<template>
  <svg class="check" :width="size" :height="size" viewBox="0 0 52 52" aria-hidden="true">
    <circle class="check__ring" cx="26" cy="26" r="24" fill="none" />
    <path class="check__tick" fill="none" d="M15 27l7 7 15-15" />
  </svg>
</template>

<style scoped lang="scss">
.check {
  border-radius: 50%;
  background: $aqua-soft;

  &__ring {
    stroke: $aqua;
    stroke-width: 3;
    stroke-dasharray: 152;
    stroke-dashoffset: 152;
    animation: draw 0.6s $ease forwards;
  }

  &__tick {
    stroke: $navy;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 40;
    stroke-dashoffset: 40;
    animation: draw 0.4s 0.45s $ease forwards;
  }
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
