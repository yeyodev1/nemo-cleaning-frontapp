import type { QuoteItemInput, Service } from '@/types/api'

/** Carrito = { serviceId: cantidad }. */
export type Cart = Record<string, number>

export function cartItems(cart: Cart): QuoteItemInput[] {
  return Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([service, quantity]) => ({ service, quantity }))
}

export function cartCount(cart: Cart): number {
  return Object.values(cart).reduce((a, b) => a + (b > 0 ? b : 0), 0)
}

/** Subtotal provisional en el cliente; el servidor siempre recalcula (POST /public/quote). */
export function localSubtotal(cart: Cart, services: Service[]): number {
  return cartItems(cart).reduce((sum, i) => {
    const s = services.find((x) => x._id === i.service)
    return sum + (s ? s.price * i.quantity : 0)
  }, 0)
}
