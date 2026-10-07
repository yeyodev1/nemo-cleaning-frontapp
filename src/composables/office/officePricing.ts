import type { BreakdownLine, OfficePlan, OfficePricing } from '@/types/api'
import { money } from '@/utils/format'
import { tierUnitPrice } from '@/utils/pricing'

export interface OfficeSpace {
  squareMeters: number
  plan: OfficePlan
  chairsFabric: number
  chairsMixed: number
  windows: number
  bathrooms: number
}

export interface OfficeEstimate {
  /** null = plan mensual (tarifa especial): sin precio automático. */
  estimate: number | null
  breakdown: BreakdownLine[]
}

export const PLAN_LABEL: Record<OfficePlan, string> = {
  basico: 'Básico',
  profundo: 'Profundo',
  mensual: 'Plan mensual',
}

const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0)

/**
 * Vista previa en el cliente (centavos). Espejo EXACTO de `computeEstimate` del back
 * (`officeQuote.service.ts`): m² × tarifa del plan + sillas de tela / mixtas por unidad +
 * ventanales y sanitarios por tramos. Plan mensual = tarifa especial → sin estimado.
 */
export function estimateOffice(space: OfficeSpace, p: OfficePricing): OfficeEstimate {
  if (space.plan === 'mensual') return { estimate: null, breakdown: [] }
  const breakdown: BreakdownLine[] = []
  const add = (label: string, amount: number) => {
    if (amount > 0) breakdown.push({ label, amount: Math.round(amount) })
  }
  const m2 = Math.round(n(space.squareMeters) * 100) / 100
  const perM2 = space.plan === 'profundo' ? p.deepPerM2 : p.basicPerM2
  add(`Limpieza ${PLAN_LABEL[space.plan]}: ${m2} m² × ${money(perM2)}`, m2 * perM2)
  add(`Sillas de tela: ${n(space.chairsFabric)} × ${money(p.chairFabric)}`, n(space.chairsFabric) * p.chairFabric)
  add(`Sillas mixtas: ${n(space.chairsMixed)} × ${money(p.chairMixed)}`, n(space.chairsMixed) * p.chairMixed)
  if (n(space.windows) > 0) {
    const unit = tierUnitPrice(p.windowTiers, space.windows) ?? 0
    add(`Ventanales: ${space.windows} × ${money(unit)}`, space.windows * unit)
  }
  if (n(space.bathrooms) > 0) {
    const unit = tierUnitPrice(p.bathroomTiers, space.bathrooms) ?? 0
    add(`Desinfección de sanitarios: ${space.bathrooms} × ${money(unit)}`, space.bathrooms * unit)
  }
  return { estimate: breakdown.reduce((s, l) => s + l.amount, 0), breakdown }
}
