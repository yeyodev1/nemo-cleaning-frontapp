import type { Directive } from 'vue'

/**
 * v-magnetic: el CTA se inclina apenas hacia el puntero (solo mouse, solo transform).
 * Uso local en componentes: `import { vMagnetic } from '@/directives/magnetic'`.
 */
type MagneticEl = HTMLElement & { __mag?: { move: (e: PointerEvent) => void; leave: () => void } }

export const vMagnetic: Directive<MagneticEl, number | undefined> = {
  mounted(el, binding) {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return
    const strength = binding.value ?? 0.25
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) * strength
      const y = (e.clientY - (r.top + r.height / 2)) * strength
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }
    const leave = () => (el.style.transform = '')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.__mag = { move, leave }
  },
  unmounted(el) {
    if (!el.__mag) return
    el.removeEventListener('pointermove', el.__mag.move)
    el.removeEventListener('pointerleave', el.__mag.leave)
  },
}
