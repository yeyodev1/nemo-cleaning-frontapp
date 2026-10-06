import type { BreakdownLine, OfficeFrequency, OfficePricing } from '@/types/api'

export interface OfficeSpace {
  squareMeters: number
  chairs: number
  desks: number
  bathrooms: number
  frequency: OfficeFrequency
}

export interface OfficeEstimate {
  estimate: number
  breakdown: BreakdownLine[]
  discountPct: number
  appliedMinimum: boolean
}

const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0)

/**
 * Vista previa de la cotización en el cliente (centavos). El valor final lo
 * calcula el servidor en POST /public/office-quotes; esta fórmula lo replica:
 * suma por partidas → descuento por frecuencia → mínimo.
 */
export function estimateOffice(space: OfficeSpace, p: OfficePricing): OfficeEstimate {
  const breakdown: BreakdownLine[] = []
  const add = (label: string, qty: number, unit: number) => {
    if (qty > 0 && unit > 0) breakdown.push({ label, amount: Math.round(qty * unit) })
  }
  add(`${n(space.squareMeters)} m² de área`, n(space.squareMeters), p.pricePerM2)
  add(`${n(space.chairs)} sillas`, n(space.chairs), p.pricePerChair)
  add(`${n(space.desks)} escritorios`, n(space.desks), p.pricePerDesk)
  add(`${n(space.bathrooms)} baños`, n(space.bathrooms), p.pricePerBathroom)

  const base = breakdown.reduce((s, l) => s + l.amount, 0)
  const discountPct = space.frequency === 'unica' ? 0 : p.frequencyDiscounts?.[space.frequency] || 0
  const discount = Math.round((base * discountPct) / 100)
  if (discount > 0) breakdown.push({ label: `Descuento ${space.frequency} (${discountPct}%)`, amount: -discount })

  const subtotal = base - discount
  const appliedMinimum = subtotal < p.minimum
  if (appliedMinimum && base > 0) breakdown.push({ label: 'Ajuste a valor mínimo', amount: p.minimum - subtotal })

  return { estimate: base > 0 ? Math.max(subtotal, p.minimum) : 0, breakdown, discountPct, appliedMinimum }
}
