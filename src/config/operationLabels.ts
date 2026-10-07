// Etiquetas del módulo "Operación" con el vocabulario de las hojas del Excel.
import type { PaymentConfirmation } from '@/types/api'
import type { GoalStatus, ShiftStatus } from '@/types/operation'
import type { Tone } from './labels'

export const paymentConfirmation: Record<PaymentConfirmation, { label: string; tone: Tone; hint: string }> = {
  confirmed: { label: 'Confirmado', tone: 'success', hint: 'El dinero ya se vio en la cuenta o en caja' },
  pending_confirmation: { label: 'Pendiente de confirmación', tone: 'info', hint: 'Dijo que pagó; falta verlo en la cuenta' },
  pending_payment: { label: 'Pendiente de pago', tone: 'warning', hint: 'Aún no paga: queda por cobrar' },
  lost: { label: 'Perdida', tone: 'danger', hint: 'No se va a cobrar' },
  exchange: { label: 'Canje', tone: 'navy', hint: 'Sin cobro: intercambio o cortesía' },
}

export const positionLabel: Record<'supervisor' | 'base_assistant' | 'washer', string> = {
  supervisor: 'Supervisor',
  base_assistant: 'Asistente de base',
  washer: 'Lavador',
}

export const shiftLabel: Record<ShiftStatus, { label: string; short: string }> = {
  active: { label: 'Activo', short: 'A' },
  off: { label: 'Libre', short: 'L' },
  half: { label: 'Medio día', short: '½' },
}

export const goalStatus: Record<GoalStatus, { label: string; tone: Tone }> = {
  meets: { label: 'Cumple', tone: 'success' },
  misses: { label: 'No cumple', tone: 'danger' },
  in_progress: { label: 'En curso', tone: 'info' },
  no_goal: { label: 'Sin meta', tone: '' },
}

/** 0.4567 → "45,7 %" */
export function pct(ratio: number | null | undefined, digits = 0): string {
  if (ratio === null || ratio === undefined) return '—'
  return `${(ratio * 100).toLocaleString('es-EC', { maximumFractionDigits: digits })} %`
}
