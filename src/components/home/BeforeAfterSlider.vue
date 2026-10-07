<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCompare } from '@/composables/home/useCompare'

/**
 * Comparador ANTES / DESPUÉS con fotos reales del catálogo. La capa "antes" se recorta con
 * transform (no clip-path) para que arrastrar sea 100% compositor. Accesible por teclado.
 */
const props = defineProps<{ before: string; after: string; title: string; ratio: string; eager?: boolean }>()
const frame = ref<HTMLElement | null>(null)
const { pos, dragging, onDown, onMove, onUp, stopHint } = useCompare(frame)

// Las fotos verticales no pueden pasar de cierta altura: el ancho se calcula desde el alto máximo.
const style = computed(() => {
  const [w, h] = props.ratio.split('/').map((n) => Number(n.trim()))
  const r = w && h ? w / h : 1
  return {
    aspectRatio: props.ratio,
    width: `min(100%, calc(var(--ba-max-h) * ${r.toFixed(4)}))`,
    '--shift': `${100 - pos.value}%`,
    '--pos': `${pos.value}%`,
  }
})
</script>

<template>
  <figure
    ref="frame"
    class="ba"
    :class="{ 'is-dragging': dragging }"
    :style="style"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <img class="ba__img" :src="after" :alt="`${title} después de la limpieza`" :loading="eager ? 'eager' : 'lazy'" draggable="false" />
    <div class="ba__before" aria-hidden="true">
      <div class="ba__before-inner">
        <img class="ba__img" :src="before" alt="" :loading="eager ? 'eager' : 'lazy'" draggable="false" />
      </div>
    </div>
    <span class="ba__tag ba__tag--before" aria-hidden="true">Antes</span>
    <span class="ba__tag ba__tag--after" aria-hidden="true">Después</span>
    <span class="ba__handle" aria-hidden="true"><span class="ba__knob"></span></span>
    <input
      v-model.number="pos"
      class="ba__range"
      type="range"
      min="0"
      max="100"
      step="2"
      @keydown="stopHint"
      :aria-label="`Comparar ${title}: mueve a la izquierda para ver el después`"
      :aria-valuetext="`${Math.round(pos)}% antes visible`"
    />
    <figcaption class="sr-only">{{ title }}: foto real antes y después de la limpieza</figcaption>
  </figure>
</template>

<style scoped lang="scss">
.ba {
  --ba-max-h: min(68svh, 620px);
  position: relative;
  margin-inline: auto;
  max-width: 100%;
  border-radius: $radius-lg;
  overflow: hidden;
  background: $navy-deep;
  box-shadow: $shadow-lg, 0 0 0 1px rgba(#fff, 0.1);
  user-select: none;
  touch-action: pan-y;
  cursor: ew-resize;

  &__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  // Ventana que se corre a la izquierda y la foto dentro se corre igual a la derecha: queda quieta.
  &__before {
    position: absolute;
    inset: 0;
    overflow: hidden;
    transform: translate3d(calc(-1 * var(--shift)), 0, 0);
  }

  &__before-inner {
    position: absolute;
    inset: 0;
    transform: translate3d(var(--shift), 0, 0);
  }

  &__tag {
    position: absolute;
    top: 0.75rem;
    padding: 0.3rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    pointer-events: none;
    backdrop-filter: blur(6px);

    &--before {
      left: 0.75rem;
      background: rgba($navy-deep, 0.75);
      color: #fff;
    }

    &--after {
      right: 0.75rem;
      background: $orange;
      color: $navy;
    }
  }

  // Capa a todo el ancho desplazada con translateX(--pos): la línea vive en su borde izquierdo.
  &__handle {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transform: translate3d(var(--pos), 0, 0);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: -1px;
      width: 2px;
      background: #fff;
      box-shadow: 0 0 16px rgba(#000, 0.45);
    }
  }

  &__knob {
    position: absolute;
    top: 50%;
    left: 0;
    width: 52px;
    height: 52px;
    margin: -26px 0 0 -26px;
    border-radius: 50%;
    background: rgba(#fff, 0.95);
    border: 3px solid $orange;
    box-shadow: 0 8px 24px rgba($navy-ink, 0.45);
    transition: transform $dur-fast $ease-out;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      margin-top: -6px;
      border: 6px solid transparent;
    }

    &::before {
      left: 5px;
      border-right-color: $navy;
    }

    &::after {
      right: 5px;
      border-left-color: $navy;
    }
  }

  &.is-dragging &__knob {
    transform: scale(1.12);
  }

  // Input real (teclado + lector de pantalla), invisible y sin capturar el puntero.
  &__range {
    position: absolute;
    inset: auto 0 0;
    width: 100%;
    height: 1px;
    margin: 0;
    opacity: 0;
    pointer-events: none;
  }

  &:focus-within {
    outline: 3px solid $orange;
    outline-offset: 4px;
  }
}
</style>
