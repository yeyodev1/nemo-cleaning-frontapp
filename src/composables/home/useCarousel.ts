import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Carrusel con scroll-snap nativo: el navegador hace el arrastre/inercia; aquí solo
 * se exponen flechas (prev/next) y el progreso para pintar una barra con scaleX.
 */
export function useCarousel(track: Ref<HTMLElement | null>) {
  const canPrev = ref(false)
  const canNext = ref(false)
  const progress = ref(0)
  let raf = 0
  let ro: ResizeObserver | null = null

  function measure() {
    raf = 0
    const el = track.value
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    canPrev.value = el.scrollLeft > 4
    canNext.value = el.scrollLeft < max - 4
    progress.value = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 1
  }

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(measure)
  }

  function go(dir: 1 | -1) {
    const el = track.value
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * step, behavior: smooth ? 'smooth' : 'auto' })
  }

  onMounted(() => {
    const el = track.value
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    ro = new ResizeObserver(onScroll)
    ro.observe(el)
    measure()
  })

  onBeforeUnmount(() => {
    track.value?.removeEventListener('scroll', onScroll)
    ro?.disconnect()
    if (raf) cancelAnimationFrame(raf)
  })

  return { canPrev, canNext, progress, go, refresh: onScroll }
}
