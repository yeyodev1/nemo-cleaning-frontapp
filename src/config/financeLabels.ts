// Etiquetas de Finanzas y gestión (fase 2), con los nombres que usan en el Excel.
import type { Tone } from './labels'
import type { ExpenseCategory, ExpenseKind } from '@/types/api'
import type { AgingBucket, CashConcept, FollowUpResult, PayableCategory, PayableMethod, PayStatus } from '@/types/finance'

/** Columnas ENE…DIC del Resumen Anual. */
export const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

export const payStatus: Record<PayStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  partial: { label: 'Parcial', tone: 'aqua' },
  paid: { label: 'Pagado', tone: 'success' },
}

export const payableCategory: Record<PayableCategory, string> = {
  nomina: 'Nómina',
  comision: 'Comisión',
  proveedor: 'Proveedor',
  servicios: 'Servicios (luz, agua, internet)',
  alquiler: 'Alquiler',
  credito: 'Crédito / tarjeta',
  marketing: 'Marketing / pauta',
  reembolso: 'Reembolso / devolución',
  impuestos: 'Impuestos',
  otro: 'Otro',
}

export const payableMethod: Record<Exclude<PayableMethod, ''>, string> = {
  transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
  deposit: 'Depósito',
  check: 'Cheque',
  other: 'Otro',
}

export const expenseKind: Record<ExpenseKind, string> = {
  variable: 'Variable',
  fixed: 'Fijo',
}

/** Categorías agrupadas para los select (las más usadas primero, como en la hoja AGOSTO). */
export const expenseCategoryGroups: { label: string; items: ExpenseCategory[] }[] = [
  {
    label: 'Operación',
    items: ['combustible', 'insumos', 'quimicos', 'mantenimiento', 'gastos_mecanicos', 'reparaciones', 'recargas', 'uniformes', 'imprevistos'],
  },
  { label: 'Personal', items: ['anticipos', 'usuarios_adicionales', 'propinas', 'sueldos'] },
  { label: 'Local y servicios', items: ['arriendo', 'luz', 'agua', 'internet', 'rodapies', 'servicios_basicos'] },
  { label: 'Compras e importaciones', items: ['importaciones', 'productos_importados'] },
  { label: 'Otros', items: ['transporte', 'marketing', 'impuestos', 'otros'] },
]

export const cashConcept: Record<CashConcept, { label: string; direction: 'in' | 'out' | 'both' }> = {
  opening: { label: 'Saldo inicial', direction: 'in' },
  tip_cash: { label: 'Propina en efectivo', direction: 'out' },
  to_management: { label: 'Entrega a gerencia', direction: 'out' },
  from_management: { label: 'Reposición de gerencia', direction: 'in' },
  adjustment: { label: 'Ajuste de caja', direction: 'both' },
  other: { label: 'Otro', direction: 'both' },
}

export const agingBucket: Record<AgingBucket, { label: string; tone: Tone }> = {
  d0_5: { label: '5 días o menos', tone: 'info' },
  d6_30: { label: '6 a 30 días', tone: 'warning' },
  d31_60: { label: '31 a 60 días', tone: 'aqua' },
  d60: { label: 'Más de 60 días', tone: 'danger' },
}

export const followUpResult: Record<FollowUpResult, { label: string; tone: Tone }> = {
  pending: { label: 'Sin resultado', tone: '' },
  accepted: { label: 'Aceptó', tone: 'success' },
  declined: { label: 'No le interesa', tone: 'danger' },
  unreachable: { label: 'No contesta', tone: 'warning' },
}

/** 0.335 → "33.5%" */
export function pct(ratio: number | null | undefined, digits = 1): string {
  const v = (ratio || 0) * 100
  return `${v.toFixed(Math.abs(v) >= 100 || Number.isInteger(v) ? 0 : digits)}%`
}
