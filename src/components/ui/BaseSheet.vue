<script setup lang="ts">
import { onBeforeUnmount, watch, ref, nextTick } from 'vue'
import AppIcon from './AppIcon.vue'

/**
 * Modal accesible: hoja inferior en móvil, diálogo centrado (o panel lateral con
 * `side`) desde tablet. Cierra con Escape y con el fondo; bloquea el scroll.
 */
const props = defineProps<{ open: boolean; title: string; side?: boolean; wide?: boolean; dirty?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const panel = ref<HTMLElement | null>(null)
const keepBtn = ref<HTMLButtonElement | null>(null)
// Con `dirty`, cerrar (fondo, Escape o X) primero pregunta dentro de la hoja; sin `dirty`, cierra directo.
const confirming = ref(false)
let lastFocus: HTMLElement | null = null

async function requestClose() {
  if (!props.dirty) return emit('close')
  if (confirming.value) return
  confirming.value = true
  await nextTick()
  keepBtn.value?.focus()
}

function keepEditing() {
  confirming.value = false
  panel.value?.focus()
}

function discard() {
  confirming.value = false
  emit('close')
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  // Segundo Escape con la pregunta abierta = seguir editando (no descarta por accidente).
  if (confirming.value) keepEditing()
  else requestClose()
}

watch(
  () => props.open,
  async (open) => {
    confirming.value = false
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
    <!-- Se queda montado hasta que termina la salida (el panel baja y el fondo se desvanece). -->
    <Transition name="sheet" :duration="{ enter: 460, leave: 420 }">
      <div v-if="open" class="sheet" :class="{ 'sheet--side': side }" @click.self="requestClose">
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
            <button type="button" class="sheet__close" aria-label="Cerrar" @click="requestClose">
              <AppIcon name="x" />
            </button>
          </header>
          <div class="sheet__body"><slot /></div>
          <div
            v-if="confirming"
            class="sheet__confirm"
            role="alertdialog"
            aria-live="assertive"
            aria-labelledby="sheet-confirm-msg"
          >
            <AppIcon name="alert" class="sheet__confirm-icon" />
            <p id="sheet-confirm-msg" class="sheet__confirm-msg">Tienes cambios sin guardar.</p>
            <div class="sheet__confirm-actions">
              <button ref="keepBtn" type="button" class="btn btn--ghost btn--sm" @click="keepEditing">Seguir editando</button>
              <button type="button" class="btn btn--primary btn--sm" @click="discard">Descartar</button>
            </div>
          </div>
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

  &__confirm {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.6rem;
    padding: 0.7rem 1.25rem;
    border-top: 1px solid $line;
    background: $warning-bg;
    color: $ink;
    animation: sheet-confirm-in $dur-fast $ease-out;
  }

  &__confirm-icon {
    flex-shrink: 0;
    color: $warning;
  }

  &__confirm-msg {
    flex: 1;
    min-width: 10rem;
    font-size: $text-sm;
    font-weight: 600;
  }

  &__confirm-actions {
    display: flex;
    gap: 0.4rem;
    margin-left: auto;
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

@keyframes sheet-confirm-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

// Fondo: fundido. Panel: sube desde abajo en móvil, escala+fundido centrado en tablet/escritorio
// y entra desde la derecha en modo `side`. Al cerrar, el recorrido inverso y algo más rápido.
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity $dur $ease-out;

  .sheet__panel {
    transition:
      transform $dur-slow $ease-out,
      opacity $dur $ease-out;
  }
}

.sheet-leave-active {
  transition-duration: 400ms;
  transition-timing-function: $ease-in-out;

  .sheet__panel {
    transition-duration: 400ms;
    transition-timing-function: $ease-in-out;
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;

  .sheet__panel {
    transform: translateY(100%);
  }

  @include from('md') {
    .sheet__panel {
      opacity: 0;
      transform: translateY(12px) scale(0.97);
    }

    &.sheet--side .sheet__panel {
      opacity: 1;
      transform: translateX(100%);
    }
  }
}
</style>
