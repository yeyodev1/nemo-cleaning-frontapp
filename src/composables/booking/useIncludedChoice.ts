import { computed, ref, type Ref } from 'vue'
import { cartKey, parseKey, type Cart } from './cart'
import type { Service } from '@/types/api'

/**
 * Opción incluida de un servicio (techo o asientos) dentro del selector. La elección vive en la
 * clave del carrito (`id::tamaño::opción`); al cambiarla se mueven las unidades ya puestas, así
 * el cliente puede elegir antes o después de sumar el auto sin perder lo que llevaba.
 */
export function useIncludedChoice(
  service: Ref<Service>,
  cart: Ref<Cart>,
  /** Cambios en bloque { clave: cantidad } (0 = quitar): mover unidades es una sola actualización. */
  patch: (changes: Cart) => void,
) {
  const options = computed(() => service.value.choices ?? [])
  // Si el borrador ya trae una elección (recarga de página o panel), se respeta.
  const fromCart = Object.entries(cart.value).find(
    ([k, q]) => q > 0 && parseKey(k).service === service.value._id && parseKey(k).choice,
  )
  const choice = ref(fromCart ? parseKey(fromCart[0]).choice : '')

  const keyFor = (variant = '') => cartKey(service.value._id, variant, options.value.length ? choice.value : '')

  /** Hay unidades en el carrito pero falta elegir: se marca el bloque. */
  const missing = computed(
    () =>
      options.value.length > 0 &&
      !choice.value &&
      Object.entries(cart.value).some(([k, q]) => q > 0 && parseKey(k).service === service.value._id),
  )

  function pick(next: string) {
    if (next === choice.value) return
    const changes: Cart = {}
    for (const [k, q] of Object.entries(cart.value)) {
      const p = parseKey(k)
      if (p.service !== service.value._id || !(q > 0)) continue
      const to = cartKey(p.service, p.variant, next)
      changes[k] = 0
      changes[to] = (changes[to] || cart.value[to] || 0) + q
    }
    choice.value = next
    if (Object.keys(changes).length) patch(changes)
  }

  return { options, choice, missing, keyFor, pick }
}
