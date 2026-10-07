<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

/** Selector de año con flechas (la hoja del Excel es por año). */
const year = defineModel<number>({ required: true })
defineProps<{ suffix?: string }>()
</script>

<template>
  <div class="ynav">
    <button type="button" class="btn btn--ghost btn--icon" aria-label="Año anterior" @click="year--"><AppIcon name="chevron-left" /></button>
    <strong>{{ year }}<template v-if="suffix"> · {{ suffix }}</template></strong>
    <button type="button" class="btn btn--ghost btn--icon" aria-label="Año siguiente" @click="year++"><AppIcon name="chevron-right" /></button>
  </div>
</template>

<style scoped lang="scss">
.ynav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $navy;
}
</style>
