import { onBeforeUnmount, onMounted, type Ref } from 'vue'

/**
 * Parallax suave: mueve `target` en Y a una fracción del scroll mientras su sección está en pantalla.
 * Solo transform (compositor), un rAF por frame y nada si el usuario pide menos movimiento.
 */
export function useParallax(target: Ref<HTMLElement | null>, factor = 0.18) {
  let raf = 0
  let active = true
  let io: IntersectionObserver | null = null

  function paint() {
    raf = 0
    const el = target.value
    if (!el || !active) return
    const y = Math.min(window.scrollY, window.innerHeight * 1.2) * factor
    el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
  }

  function onScroll() {
    if (!raf) raf = requestAnimationFrame(paint)
  }

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !target.value) return
    io = new IntersectionObserver(([e]) => (active = Boolean(e?.isIntersecting)))
    io.observe(target.value.parentElement ?? target.value)
    window.addEventListener('scroll', onScroll, { passive: true })
    paint()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    io?.disconnect()
    if (raf) cancelAnimationFrame(raf)
  })
}
