<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ tabs: { value: string; label: string; count?: number }[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// Subrayado naranja que se desliza al tab activo. Solo transform (translateX + scaleX sobre 100 px).
const root = ref<HTMLElement | null>(null)
const ink = ref({ x: 0, w: 0, ready: false })

function measure() {
  const el = root.value?.querySelector<HTMLElement>('.seg__tab.is-on')
  if (!el) return
  ink.value = { x: el.offsetLeft + 12, w: Math.max(0, el.offsetWidth - 24), ready: true }
}

watch(() => [props.modelValue, props.tabs.length], () => nextTick(measure))
onMounted(() => {
  nextTick(measure)
  window.addEventListener('resize', measure)
})
onBeforeUnmount(() => window.removeEventListener('resize', measure))
</script>

<template>
  <div ref="root" class="seg" role="tablist">
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
    <span
      class="seg__ink"
      :class="{ 'is-ready': ink.ready }"
      :style="{ transform: `translateX(${ink.x}px) scaleX(${ink.w / 100})` }"
      aria-hidden="true"
    ></span>
  </div>
</template>

<style scoped lang="scss">
.seg {
  position: relative;
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
    font-weight: 600;
    color: $ink-soft;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    white-space: nowrap;
    transition:
      background-color $dur-fast ease,
      color $dur-fast ease,
      box-shadow $dur-fast ease;

    &.is-on {
      background: $surface;
      color: $navy;
      box-shadow: $shadow-sm;
    }
  }

  &__ink {
    position: absolute;
    left: 0;
    bottom: 6px;
    width: 100px;
    height: 2px;
    border-radius: 2px;
    background: $orange;
    transform-origin: left center;
    opacity: 0;
    pointer-events: none;

    &.is-ready {
      opacity: 1;
      transition: transform $dur $ease-out;
    }
  }

  &__count {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: $radius-pill;
    background: $orange;
    color: $navy;
    font-size: 0.7rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
