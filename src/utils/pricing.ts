import type { PriceTier, Service, ServiceVariant } from '@/types/api'
import { money } from './format'

/**
 * Reglas de precio del catálogo. Espejo EXACTO de `pricing.service.ts#priceLine` del back
 * (el servidor siempre recalcula; esto es para mostrar el subtotal al instante y que cuadre):
 * - con variantes: el precio de la opción (con rango se cobra el menor);
 * - con tramos: el precio del tramo alcanzado aplica a TODAS las unidades;
 * - por m²: precio × m² (decimales), redondeado a centavos.
 */

/** Precio del tramo de mayor `minQty` que la cantidad alcanza; null si no llega al primero. */
export function tierUnitPrice(tiers: PriceTier[], quantity: number): number | null {
  let price: number | null = null
  let best = -Infinity
  for (const t of tiers) {
    if (quantity >= t.minQty && t.minQty > best) {
      best = t.minQty
      price = t.unitPrice
    }
  }
  return price
}

export function tierMinQty(tiers: PriceTier[]): number {
  return tiers.length ? Math.min(...tiers.map((t) => t.minQty)) : 1
}

/** Cantidad mínima efectiva de un servicio (ventanales: 2). */
export function serviceMinQty(s: Pick<Service, 'minQty' | 'priceTiers'>): number {
  return Math.max(s.minQty || 1, s.priceTiers?.length ? tierMinQty(s.priceTiers) : 1)
}

export interface PricedLine {
  unitPrice: number
  unitPriceMax: number
  subtotal: number
}

export function priceLine(s: Service, variant: string, quantity: number): PricedLine {
  let unitPrice = s.price
  let unitPriceMax = s.priceMax || 0
  const v = s.variants?.find((x) => x.label === variant)
  if (v) {
    unitPrice = v.price
    unitPriceMax = v.priceMax || 0
  }
  if (s.priceTiers?.length) {
    unitPrice = tierUnitPrice(s.priceTiers, quantity) ?? s.priceTiers[0]?.unitPrice ?? s.price
    unitPriceMax = 0
  }
  return {
    unitPrice,
    unitPriceMax: unitPriceMax > unitPrice ? unitPriceMax : 0,
    subtotal: Math.round(unitPrice * quantity),
  }
}

/** "$15.00 – $20.00" o "$15.00". */
export function rangeLabel(price: number, priceMax?: number): string {
  return priceMax && priceMax > price ? `${money(price)} – ${money(priceMax)}` : money(price)
}

export function variantLabel(v: ServiceVariant): string {
  return rangeLabel(v.price, v.priceMax)
}

/** ¿Tiene precio distinto según opción o cantidad? Entonces se muestra "desde". */
export function hasFromPrice(s: Service): boolean {
  if (s.priceTiers?.length > 1) return true
  if (!s.variants?.length) return false
  const prices = new Set(s.variants.map((v) => v.price))
  return prices.size > 1 || s.variants.some((v) => v.priceMax > v.price)
}

/** Precio corto para tarjetas: "desde $8.00", "$15.00 – $20.00", "$25.00". */
export function priceSummary(s: Service): string {
  if (s.variants?.length === 1) return variantLabel(s.variants[0]!)
  return hasFromPrice(s) ? `desde ${money(s.price)}` : money(s.price)
}

/** "por m²", "c/u"… sufijo de unidad para precios. */
export function unitSuffix(s: Pick<Service, 'unit' | 'priceTiers'>): string {
  if (s.unit === 'm2') return '/ m²'
  if (s.priceTiers?.length) return 'c/u'
  return ''
}

/** "2 – 5" · "6 – 10" · "11 o más" para mostrar los tramos tal como el catálogo. */
export function tierRanges(tiers: PriceTier[]): { label: string; price: number }[] {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty)
  return sorted.map((t, i) => {
    const next = sorted[i + 1]
    let label: string
    if (!next) label = `${t.minQty} o más`
    else if (next.minQty - 1 === t.minQty) label = `${t.minQty}`
    else label = `${t.minQty} – ${next.minQty - 1}`
    return { label, price: t.unitPrice }
  })
}

/** Cantidad con unidad: "2", "12.5 m²". */
export function qtyLabel(quantity: number, unit?: string): string {
  return unit === 'm2' ? `${quantity} m²` : String(quantity)
}

/** "2× Limpieza de sofás · Sofá 2 puestos", "Patios · Plan Basic · 12.5 m²". */
export function itemLabel(i: { name: string; variant?: string; unit?: string; quantity: number }): string {
  const name = `${i.name}${i.variant ? ` · ${i.variant}` : ''}`
  return i.unit === 'm2' ? `${name} · ${i.quantity} m²` : `${i.quantity}× ${name}`
}
