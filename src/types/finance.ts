// Tipos de Finanzas y gestión (fase 2), espejo de CONTRATO-API.md → "Finanzas y gestión".
import type { ExpenseCategory, ID, PaymentMethod } from './api'

/** Q1 (1–15), Q2 (16–fin) y total del mes. Centavos. */
export interface QTotals {
  q1: number
  q2: number
  total: number
}

export interface AccountTotals extends QTotals {
  account: string
}

export type PayStatus = 'pending' | 'partial' | 'paid'

export interface FortnightReport {
  month: string
  fortnights: { q1: { from: string; to: string }; q2: { from: string; to: string } }
  bookings: number
  reconciliation: {
    production: QTotals
    received: QTotals
    receivedByAccount: AccountTotals[]
    productionByAccount: AccountTotals[]
    cashCollected: QTotals
    cashAvailable: QTotals
    cashDisbursed: QTotals
    toConfirm: QTotals
    toCollect: QTotals
    pendingCollection: QTotals
    barter: QTotals
    lost: QTotals
    tips: QTotals
    difference: QTotals
  }
  collected: { total: QTotals; byAccount: AccountTotals[] }
  expenses: { byCategory: ({ category: ExpenseCategory } & QTotals)[]; total: QTotals }
  toPay: {
    payroll: {
      _id: ID
      name: string
      position: string
      q1: number
      q2: number
      total: number
      q1Status: PayStatus
      q2Status: PayStatus
      paid: number
    }[]
    payables: {
      _id: ID
      beneficiary: string
      category: PayableCategory
      q1: number
      q2: number
      total: number
      status: PayStatus
      paidAmount: number
      paidDate: string
      method: string
      reference: string
    }[]
    total: QTotals
    paid: QTotals
    pending: QTotals
  }
  profit: { totalCosts: QTotals; profit: QTotals; margin: QTotals }
  liquidity: { inAccounts: QTotals; pendingPayments: QTotals; available: QTotals }
}

export type PayableCategory =
  | 'nomina'
  | 'comision'
  | 'proveedor'
  | 'servicios'
  | 'alquiler'
  | 'credito'
  | 'marketing'
  | 'reembolso'
  | 'impuestos'
  | 'otro'

export type PayableMethod = 'transfer' | 'cash' | 'card' | 'deposit' | 'check' | 'other' | ''

export interface Payable {
  _id: ID
  branch: ID | null
  month: string
  fortnight: 1 | 2
  dueDate: string
  beneficiary: string
  category: PayableCategory
  amount: number
  paidAmount: number
  status: PayStatus
  paidDate: string
  method: PayableMethod
  account: string
  reference: string
  notes: string
}

export type PayableInput = Omit<Payable, '_id' | 'status'>

export interface PayableList {
  month: string
  items: Payable[]
  totals: { total: number; paid: number; pending: number; paidRatio: number; count: number; pendingCount: number }
}

export interface PayrollPay {
  paid: number
  date: string
  method: string
  reference: string
  expected: number
  advances: number
  status: PayStatus
}

export interface PayrollRow {
  _id: ID
  month: string
  user: ID
  name: string
  position: string
  branch: ID | null
  salary: number
  advances: number
  q1: PayrollPay
  q2: PayrollPay
  totalPaid: number
  pending: number
  notes: string
}

export interface PayrollList {
  month: string
  items: PayrollRow[]
  missing: { _id: ID; name: string; salary: number; position: string }[]
  totals: { salary: number; advances: number; paidQ1: number; paidQ2: number; paid: number; pending: number; paidRatio: number }
}

export interface StatementMonth {
  month: number
  sales: number
  collected: number
  salaries: number
  variable: number
  fixed: number
  commissions: number
  totalExpenses: number
  net: number
  margin: number
  expenseRatio: number
  payrollLoaded: boolean
}

export interface AnnualStatement {
  year: number
  months: StatementMonth[]
  total: StatementMonth
}

export interface DetailCategory {
  category: ExpenseCategory
  amount: number
  share: number
  items: {
    _id: ID
    date: string
    description: string
    amount: number
    installment: { number: number; count: number; totalAmount: number } | null
    recurring: boolean
  }[]
}

export interface MonthlyDetail {
  month: string
  summary: StatementMonth
  salaries: { total: number; rows: { name: string; position: string; amount: number; share: number; source: string }[] }
  variable: { total: number; categories: DetailCategory[] }
  fixed: { total: number; categories: DetailCategory[] }
  excluded: Partial<Record<ExpenseCategory, number>>
}

export type CashConcept = 'opening' | 'tip_cash' | 'to_management' | 'from_management' | 'adjustment' | 'other'

export interface CashRow {
  key: string
  source: 'payment' | 'expense' | 'manual'
  id: ID
  date: string
  concept: string
  operator: string
  detail: string
  in: number
  out: number
  balance: number
  branch: ID
}

export interface CashRegister {
  from: string
  to: string
  opening: number
  totalIn: number
  totalOut: number
  closing: number
  production: number
  pettyCash: number
  rows: CashRow[]
}

export interface CashMovementInput {
  branch: ID
  date: string
  direction: 'in' | 'out'
  concept: CashConcept
  amount: number
  operator?: ID | null
  detail: string
}

export type AgingBucket = 'd0_5' | 'd6_30' | 'd31_60' | 'd60'

export interface AgingCustomer {
  customer: { _id: ID | null; name: string; phone: string; email: string }
  total: number
  oldestDays: number
  bucket: AgingBucket
  bookings: { _id: ID; code: string; date: string; total: number; amountPaid: number; balance: number; days: number; bucket: AgingBucket }[]
}

export interface ReceivablesAging {
  today: string
  total: number
  customers: number
  bookings: number
  buckets: Record<AgingBucket, number>
  lost: { total: number; count: number }
  items: AgingCustomer[]
}

export interface BankPayment {
  _id: ID
  booking: ID
  bookingCode: string
  customer: string
  date: string
  amount: number
  method: PaymentMethod
  reference: string
  proofUrl: string
  verified: boolean
  verifiedBy: string
}

export interface BankAccountRec {
  account: string
  registered: number
  verified: number
  count: number
  unverifiedCount: number
  pendingVerification: number
  bank: number | null
  bankNote: string
  difference: number | null
  payments: BankPayment[]
}

export interface BankReconciliation {
  from: string
  to: string
  items: BankAccountRec[]
  totals: { registered: number; verified: number; pendingVerification: number; unverifiedCount: number; count: number }
}

export interface ZoneReport {
  year: number
  total: number
  zones: { zone: string; count: number; amount: number; share: number }[]
  months: { month: number; total: number; byZone: Record<string, number> }[]
}

export interface CustomerRef {
  _id: ID
  name: string
  phone: string
  email: string
}

export interface FrequencyReport {
  from: string
  to: string
  totalCustomers: number
  totalServices: number
  buckets: { key: string; label: string; customers: number; share: number }[]
  potential: { customer: CustomerRef; count: number; amount: number; last: string; first: string }[]
}

export type FollowUpResult = 'pending' | 'accepted' | 'declined' | 'unreachable'

export interface PortfolioItem {
  customer: CustomerRef
  lastService: string
  daysSince: number
  services: number
  amount: number
  followUp: {
    contact1At: string | null
    contact2At: string | null
    contact3At: string | null
    result: FollowUpResult
    notes: string
    updatedAt: string | null
    updatedBy: string
  }
}

export interface Portfolio {
  days: number
  total: number
  summary: Record<FollowUpResult | 'contacted', number>
  items: PortfolioItem[]
}
