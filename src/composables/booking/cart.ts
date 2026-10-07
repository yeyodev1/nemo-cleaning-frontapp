import type { QuoteItemInput, Service } from '@/types/api'
import { priceLine } from '@/utils/pricing'

/**
 * Carrito = { clave: cantidad }. La clave es el id del servicio, o `id::opción` cuando el
 * servicio tiene variantes (tamaño, medida, plan…): así se pueden pedir dos sofás de distinto tamaño.
 * Las cantidades por m² pueden tener decimales.
 */
export type Cart = Record<string, number>

const SEP = '::'

export function cartKey(service: string, variant = ''): string {
  return variant ? `${service}${SEP}${variant}` : service
}

export function parseKey(key: string): { service: string; variant: string } {
  const i = key.indexOf(SEP)
  return i < 0 ? { service: key, variant: '' } : { service: key.slice(0, i), variant: key.slice(i + SEP.length) }
}

export function cartItems(cart: Cart): QuoteItemInput[] {
  return Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([key, quantity]) => {
      const { service, variant } = parseKey(key)
      return variant ? { service, variant, quantity } : { service, quantity }
    })
}

/** Número de líneas del pedido (no unidades: 40 m² cuentan como una línea). */
export function cartCount(cart: Cart): number {
  return Object.values(cart).filter((q) => q > 0).length
}

export interface LocalLine {
  key: string
  service: string
  name: string
  variant: string
  unit: Service['unit']
  quantity: number
  unitPrice: number
  unitPriceMax: number
  subtotal: number
  isExtra: boolean
}

/** Líneas con precio calculado en el cliente (misma regla que el servidor). */
export function localLines(cart: Cart, services: Service[]): LocalLine[] {
  const out: LocalLine[] = []
  for (const [key, quantity] of Object.entries(cart)) {
    if (!(quantity > 0)) continue
    const { service, variant } = parseKey(key)
    const s = services.find((x) => x._id === service)
    if (!s) continue
    const p = priceLine(s, variant, quantity)
    out.push({ key, service, name: s.name, variant, unit: s.unit, quantity, isExtra: s.isExtra, ...p })
  }
  return out
}

/** Subtotal provisional en el cliente; el servidor siempre recalcula (POST /public/quote). */
export function localSubtotal(cart: Cart, services: Service[]): number {
  return localLines(cart, services).reduce((sum, l) => sum + l.subtotal, 0)
}
