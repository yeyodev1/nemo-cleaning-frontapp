import { onBeforeUnmount, watch, type Ref } from 'vue'

/** Cierra un panel (popover) al tocar fuera de él o con Escape. */
export function useClickOutside(root: Ref<HTMLElement | null>, open: Ref<boolean>) {
  function onDown(e: PointerEvent) {
    if (root.value && !root.value.contains(e.target as Node)) open.value = false
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') open.value = false
  }
  watch(open, (o) => {
    if (o) {
      document.addEventListener('pointerdown', onDown)
      document.addEventListener('keydown', onKey)
    } else {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  })
  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDown)
    document.removeEventListener('keydown', onKey)
  })
}
