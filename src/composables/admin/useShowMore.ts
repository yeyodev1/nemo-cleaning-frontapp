import { computed, ref, watch, type Ref } from 'vue'

/**
 * Pinta una lista larga por tandas (cartera, cuentas por cobrar): con el historial del Excel son
 * miles de filas y dibujarlas todas de golpe congela el celular. Vuelve a la primera tanda si la
 * lista cambia (otro filtro o sucursal).
 */
export function useShowMore<T>(list: Ref<T[]>, step = 40) {
  const limit = ref(step)
  watch(list, () => (limit.value = step))
  const visible = computed(() => list.value.slice(0, limit.value))
  const remaining = computed(() => Math.max(0, list.value.length - limit.value))
  const more = () => (limit.value += step)
  return { visible, remaining, more, step }
}
