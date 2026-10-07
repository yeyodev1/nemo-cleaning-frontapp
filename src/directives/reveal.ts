import type { Directive } from 'vue'

/**
 * v-reveal: el bloque entra suave al aparecer en pantalla. Por defecto SIEMPRE es visible:
 * solo se anima (keyframes desde opacity 0) cuando el observer lo ve entrar, así nunca queda
 * oculto si el observer no corre (capturas, impresión, navegadores viejos). Respeta reduced-motion.
 */
let observer: IntersectionObserver | null = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        observer?.unobserve(el)
        // Lo que ya estaba en pantalla al montar no se re-anima (evita el parpadeo del primer pintado).
        if (el.dataset.revealSkip) continue
        el.classList.add('is-revealing')
        el.addEventListener('animationend', () => el.classList.remove('is-revealing'), { once: true })
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
  )
  return observer
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.dataset.revealSkip = '1'
    el.classList.add('reveal')
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
