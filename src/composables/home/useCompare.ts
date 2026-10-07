import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Comparador antes/después: arrastre con Pointer Events (mouse, touch y lápiz) sobre toda la foto
 * y teclado vía un <input type="range"> real (flechas, Inicio/Fin, lector de pantalla).
 * En táctil, `touch-action: pan-y` deja el scroll vertical al navegador y el gesto horizontal al slider.
 */
export function useCompare(frame: Ref<HTMLElement | null>, initial = 50) {
  const pos = ref(initial)
  const dragging = ref(false)
  let rect: DOMRect | null = null

  function setFromX(clientX: number) {
    if (!rect) return
    const p = ((clientX - rect.left) / rect.width) * 100
    pos.value = Math.round(Math.min(100, Math.max(0, p)) * 10) / 10
  }

  function onDown(e: PointerEvent) {
    if (e.button !== 0 || !frame.value) return
    rect = frame.value.getBoundingClientRect()
    dragging.value = true
    frame.value.setPointerCapture(e.pointerId)
    setFromX(e.clientX)
  }

  function onMove(e: PointerEvent) {
    if (dragging.value) setFromX(e.clientX)
  }

  function onUp(e: PointerEvent) {
    dragging.value = false
    frame.value?.releasePointerCapture?.(e.pointerId)
  }

  // Pista al entrar en pantalla: la línea se mece una vez (50 → 32 → 68 → 50) para invitar a arrastrar.
  let raf = 0
  let io: IntersectionObserver | null = null
  let touched = false

  function hint() {
    const start = performance.now()
    const D = 1700
    const tick = (t: number) => {
      if (touched) return
      const k = Math.min(1, (t - start) / D)
      pos.value = Math.round((initial + Math.sin(k * Math.PI * 2) * -18 * (1 - k * 0.35)) * 10) / 10
      if (k < 1) raf = requestAnimationFrame(tick)
      else pos.value = initial
    }
    raf = requestAnimationFrame(tick)
  }

  onMounted(() => {
    if (!frame.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        io?.disconnect()
        setTimeout(hint, 350)
      },
      { threshold: 0.6 },
    )
    io.observe(frame.value)
  })

  onBeforeUnmount(() => {
    io?.disconnect()
    cancelAnimationFrame(raf)
  })

  const stopHint = () => {
    touched = true
    cancelAnimationFrame(raf)
  }

  return { pos, dragging, onDown: (e: PointerEvent) => (stopHint(), onDown(e)), onMove, onUp, stopHint }
}
