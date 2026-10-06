<script setup lang="ts">
import type { Tone } from '@/config/labels'

defineProps<{ tone?: Tone; label: string; dot?: boolean }>()
</script>

<template>
  <span class="badge" :class="tone ? `badge--${tone}` : ''">
    <span v-if="dot" class="dot" aria-hidden="true"></span>{{ label }}
  </span>
</template>

<style scoped lang="scss">
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
</style>
