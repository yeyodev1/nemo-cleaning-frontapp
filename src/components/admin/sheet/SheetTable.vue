<script setup lang="ts">
/**
 * Tabla tipo hoja de cálculo: scroll horizontal propio (la página nunca se desborda) y
 * primera columna fija para no perder de vista el concepto. Clases para las filas:
 * `is-total` (TOTAL), `is-key` (resultado destacado), `is-sub` (detalle sangrado),
 * `is-section` (título de bloque). Celdas numéricas con `num`, negativas con `neg`.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{ caption?: string; compact?: boolean }>()

// Aviso "desliza" solo cuando la tabla no cabe (en celular), y se va al llegar al final.
const box = ref<HTMLElement | null>(null)
const more = ref(false)
function check() {
  const el = box.value
  if (el) more.value = el.scrollWidth - el.clientWidth - el.scrollLeft > 8
}
let ro: ResizeObserver | undefined
onMounted(() => {
  check()
  if (box.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(check)
    ro.observe(box.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div class="sheet-wrap">
    <Transition name="fade">
      <p v-if="more" class="sheet-hint" aria-hidden="true">Desliza la tabla para ver más columnas →</p>
    </Transition>
    <div ref="box" class="sheet" :class="{ 'sheet--compact': compact }" tabindex="0" role="region" :aria-label="caption || 'Tabla'" @scroll.passive="check">
      <table>
        <caption v-if="caption" class="sr-only">{{ caption }}</caption>
        <slot />
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sheet-hint {
  font-size: $text-xs;
  font-weight: 600;
  color: $orange-ink;
  margin-bottom: 0.3rem;
  text-align: right;
}

.sheet {
  @include card(0);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;

  &:focus-visible {
    outline: 2.5px solid $orange-deep;
    outline-offset: 2px;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: $text-sm;
    font-variant-numeric: tabular-nums;
  }

  :deep(th),
  :deep(td) {
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid $line;
    text-align: left;
    white-space: nowrap;
    background: $surface;
  }

  :deep(thead th) {
    position: sticky;
    top: 0;
    z-index: 1;
    background: $navy;
    color: #fff;
    font-size: $text-xs;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  // Primera columna fija: el concepto siempre visible al desplazar los meses/quincenas.
  :deep(th:first-child),
  :deep(td:first-child) {
    position: sticky;
    left: 0;
    z-index: 2;
    min-width: 9.5rem;
    max-width: 15rem;
    white-space: normal;
    box-shadow: 1px 0 0 $line;
  }

  :deep(thead th:first-child) {
    z-index: 3;
  }

  :deep(.num) {
    text-align: right;
  }

  :deep(.neg) {
    color: $danger;
  }

  :deep(.pos) {
    color: $success;
  }

  :deep(.muted) {
    color: $ink-muted;
  }

  :deep(tr.is-section td) {
    background: $sky;
    color: $navy;
    font-size: $text-xs;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  :deep(tr.is-sub td:first-child) {
    padding-left: 1.6rem;
    color: $ink-soft;
    font-size: $text-xs;
  }

  :deep(tr.is-sub td) {
    color: $ink-soft;
  }

  :deep(tr.is-total td) {
    font-weight: 800;
    background: $navy-soft;
    border-top: 2px solid $navy;
  }

  :deep(tr.is-key td) {
    font-weight: 800;
    background: $orange-soft;
  }

  :deep(tbody tr:last-child td) {
    border-bottom: 0;
  }

  &--compact {
    :deep(th),
    :deep(td) {
      padding: 0.45rem 0.6rem;
    }
  }
}
</style>
