<script setup lang="ts">
defineProps<{ tabs: { value: string; label: string; count?: number }[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="seg" role="tablist">
    <button
      v-for="t in tabs"
      :key="t.value"
      type="button"
      role="tab"
      class="seg__tab"
      :class="{ 'is-on': modelValue === t.value }"
      :aria-selected="modelValue === t.value"
      @click="emit('update:modelValue', t.value)"
    >
      {{ t.label }}
      <span v-if="t.count" class="seg__count">{{ t.count }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.seg {
  display: flex;
  gap: 0.25rem;
  padding: 4px;
  border-radius: $radius-pill;
  background: $sky-2;
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: 1rem;

  &::-webkit-scrollbar {
    display: none;
  }

  &__tab {
    flex: 1 0 auto;
    min-height: 40px;
    padding: 0 1rem;
    border-radius: $radius-pill;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    white-space: nowrap;

    &.is-on {
      background: $surface;
      color: $navy;
      box-shadow: $shadow-sm;
    }
  }

  &__count {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: $radius-pill;
    background: $aqua;
    color: $navy-ink;
    font-size: 0.7rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
