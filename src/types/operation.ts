// Tipos del módulo "Operación" (fase 2): espejo de CONTRATO-API.md.
import type { Booking, ID, PaymentConfirmation, PersonRef } from './api'

/** Línea del catálogo (con variante) o valor libre como en la Base. */
export type ProductionItemInput = { service: ID; variant?: string; quantity: number } | { name: string; unitPrice: number; quantity: number }

export interface PaymentAccountOption {
  label: string
  /** null = no entra dinero (canje, plan mensual). */
  method: 'cash' | 'transfer' | 'card' | null
}

export interface OperatorOption {
  _id: ID
  name: string
  color?: string
  position?: string
  branches: ID[]
}

export interface ProductionOptions {
  accounts: PaymentAccountOption[]
  branches: { _id: ID; name: string; zones: string[] }[]
  operators: OperatorOption[]
}

export interface ProductionInput {
  bookingId?: ID
  branch: ID
  date: string
  time?: string
  operators: ID[]
  customer: { _id?: ID; name?: string; phone?: string }
  zone: string
  items: ProductionItemInput[]
  discount?: number
  paymentAccount: string
  paymentConfirmation: PaymentConfirmation
  tip?: number
  notes?: string
}

export interface ProductionRow {
  _id: ID
  code: string
  date: string
  time: string
  branch: ID
  status: Booking['status']
  customer: { _id: ID; name: string; phone?: string } | null
  operators: { _id: ID; name: string; color?: string }[]
  zone: string
  items: { name: string; variant?: string; quantity: number; subtotal: number }[]
  total: number
  tip: number
  paymentAccount: string
  paymentConfirmation: PaymentConfirmation
  paymentStatus: Booking['paymentStatus']
  balance: number
  notes: string
  novedades: number
}

export interface ProductionList {
  items: ProductionRow[]
  total: number
  page: number
  pages: number
  from: string
  to: string
  totals: {
    count: number
    production: number
    tip: number
    balance: number
    receivable: number
    /** Transferencias en revisión ("Por confirmar"). */
    toConfirm?: number
    byConfirmation: Partial<Record<PaymentConfirmation, { count: number; total: number; balance: number }>>
  }
}

export interface NovedadRow {
  _id: ID
  bookingId: ID
  code: string
  date: string
  branch: ID
  text: string
  at: string
  by?: PersonRef
  customer?: string
  operator: { _id: ID; name: string; color?: string } | null
}

export type ShiftStatus = 'active' | 'off' | 'half'

export interface ShiftMonth {
  month: string
  days: { date: string; weekday: number }[]
  operators: OperatorOption[]
  cells: Record<ID, Record<string, ShiftStatus>>
}

export type GoalStatus = 'no_goal' | 'meets' | 'misses' | 'in_progress'

export interface GoalRow {
  operator: ID
  name: string
  color?: string
  position: string
  goal: number
  production: number
  compliance: number | null
  diff: number
  status: GoalStatus
  notes: string
}

export interface GoalMonth {
  month: string
  inProgress: boolean
  summary: {
    goalTotal: number
    production: number
    companyProduction: number
    compliance: number | null
    meeting: number
    notMeeting: number
    withoutGoal: number
  }
  items: GoalRow[]
}

export interface CommissionTier {
  /** Excedente en centavos a partir del cual (estrictamente mayor) aplica el %. */
  above: number
  percent: number
}

export interface CommissionRule {
  dailyBase: number
  tiers: CommissionTier[]
  supervisorPercent: number
  exceptions: { operator: ID; name?: string; tiers: CommissionTier[]; note: string }[]
}

export interface CommissionCell {
  production: number
  excess: number
  percent: number
  fee: number
  supervisorFee: number
}

interface QFee {
  fee: number
  supervisorFee: number
  adjustments: number
}

export interface CommissionSheet {
  month: string
  rule: CommissionRule
  operators: { _id: ID; name: string; color?: string; supervisor: ID | null; supervisorName: string }[]
  days: { date: string; cells: Record<ID, CommissionCell> }[]
  totals: { operator: ID; name: string; production: number; fee: number; supervisorFee: number; adjustments: number; total: number; q1: QFee; q2: QFee }[]
  supervisors: { supervisor: ID | null; name: string; q1: number; q2: number; total: number }[]
  adjustments: { _id: ID; date: string; operator: ID; name: string; kind: 'operator' | 'supervisor'; amount: number; note: string; createdBy?: PersonRef }[]
  summary: {
    production: number
    operators: number
    supervisor: number
    total: number
    q1: { operators: number; supervisor: number; total: number }
    q2: { operators: number; supervisor: number; total: number }
  }
}
