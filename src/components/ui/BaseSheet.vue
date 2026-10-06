<script setup lang="ts">
import { onBeforeUnmount, watch, ref, nextTick } from 'vue'
import AppIcon from './AppIcon.vue'

/**
 * Modal accesible: hoja inferior en móvil, diálogo centrado (o panel lateral con
 * `side`) desde tablet. Cierra con Escape y con el fondo; bloquea el scroll.
 */
const props = defineProps<{ open: boolean; title: string; side?: boolean; wide?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const panel = ref<HTMLElement | null>(null)
let lastFocus: HTMLElement | null = null

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      lastFocus = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
      await nextTick()
      panel.value?.focus()
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      lastFocus?.focus?.()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet" :class="{ 'sheet--side': side }" @click.self="emit('close')">
        <section
          ref="panel"
          class="sheet__panel"
          :class="{ 'sheet__panel--wide': wide }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <header class="sheet__head">
            <h2 class="sheet__title">{{ title }}</h2>
            <button type="button" class="sheet__close" aria-label="Cerrar" @click="emit('close')">
              <AppIcon name="x" />
            </button>
          </header>
          <div class="sheet__body"><slot /></div>
          <footer v-if="$slots.footer" class="sheet__foot"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.sheet {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: $overlay;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @include from('md') {
    align-items: center;
    padding: 1.5rem;
  }

  &__panel {
    width: 100%;
    max-height: 92dvh;
    display: flex;
    flex-direction: column;
    background: $surface;
    border-radius: $radius-lg $radius-lg 0 0;
    box-shadow: $shadow-lg;
    outline: none;

    @include from('md') {
      max-width: 540px;
      border-radius: $radius-lg;
    }

    &--wide {
      @include from('md') {
        max-width: 760px;
      }
    }
  }

  &--side {
    @include from('md') {
      justify-content: flex-end;
      align-items: stretch;
      padding: 0;
    }
  }

  &--side &__panel {
    @include from('md') {
      max-width: 480px;
      max-height: none;
      height: 100%;
      border-radius: $radius-lg 0 0 $radius-lg;
    }
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1rem 0.75rem 1.25rem;
    border-bottom: 1px solid $line;
  }

  &__title {
    font-size: $text-lg;
  }

  &__close {
    width: $tap;
    height: $tap;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $ink-soft;

    &:hover {
      background: $sky-2;
    }
  }

  &__body {
    padding: 1.1rem 1.25rem;
    overflow-y: auto;
    flex: 1;
  }

  &__foot {
    padding: 0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom));
    border-top: 1px solid $line;
    display: flex;
    gap: 0.6rem;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;

  .sheet__panel {
    transition: transform 0.3s $ease;
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;

  .sheet__panel {
    transform: translateY(40px);
  }
}
</style>
