// Tipos del contrato (CONTRATO-API.md). Dinero siempre en centavos enteros.

export type ID = string

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pages: number
}

export interface ApiError {
  status: number
  message: string
  data?: unknown
}

// ---------- Catálogo ----------
export interface Branch {
  _id: ID
  name: string
  slug: 'samborondon' | 'via-a-la-costa' | string
  address: string
  phone: string
  whatsapp: string
  email: string
  active: boolean
  openingTime: string
  closingTime: string
  slotMinutes: number
  workDays: number[]
}

export type Role = 'admin' | 'manager' | 'operator'

export interface User {
  _id: ID
  name: string
  email: string
  phone?: string
  role: Role
  branches: ID[]
  active: boolean
  color?: string
  createdAt?: string
}

export type ServiceCategory = 'vehiculos' | 'colchones' | 'muebles' | 'hogar' | 'alfombras' | 'oficinas' | 'otros'
export type ServiceUnit = 'unidad' | 'm2' | 'servicio'

export interface Service {
  _id: ID
  name: string
  slug: string
  category: ServiceCategory
  description: string
  imageUrl?: string
  price: number
  unit: ServiceUnit
  durationMinutes: number
  isExtra: boolean
  active: boolean
  order: number
}

export interface Customer {
  _id: ID
  name: string
  email: string
  phone: string
  documentId?: string
  address?: string
  notes?: string
  branch?: ID
  totalOrders: number
  totalSpent: number
  createdAt: string
}

// ---------- Pedidos ----------
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type PaymentMethod = 'card' | 'cash' | 'transfer'
export type PaymentStatus = 'pending' | 'review' | 'partial' | 'paid' | 'refunded'

export interface BookingItem {
  service: ID
  name: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface InvoiceData {
  required: boolean
  name: string
  documentId: string
  email: string
  address: string
}

export interface HistoryEntry {
  at: string
  by?: string | { id?: string; name?: string }
  action: string
  note?: string
}

export interface OperatorRef {
  _id: ID
  name: string
  color?: string
}

export interface CustomerRef {
  _id: ID
  name: string
  email: string
  phone: string
}

export interface Booking {
  _id: ID
  code: string
  branch: ID | Branch
  customer: CustomerRef
  source: 'web' | 'admin'
  items: BookingItem[]
  subtotal: number
  discount: number
  total: number
  date: string
  time: string
  durationMinutes: number
  address: string
  reference?: string
  notes?: string
  status: BookingStatus
  operators: OperatorRef[]
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  amountPaid: number
  balance: number
  transferProofUrl?: string
  invoice?: InvoiceData
  history?: HistoryEntry[]
  createdAt: string
  updatedAt: string
}

export interface PersonRef {
  id: ID
  name: string
}

export type PaymentRecordStatus = 'pending' | 'review' | 'approved' | 'rejected' | 'refunded'

export interface Payment {
  _id: ID
  booking: ID
  bookingCode: string
  branch: ID
  amount: number
  method: PaymentMethod
  provider: 'payphone' | 'manual'
  status: PaymentRecordStatus
  proofUrl?: string
  reference?: string
  clientTransactionId?: string
  transactionId?: string
  note?: string
  registeredBy?: PersonRef
  reviewedBy?: PersonRef
  reviewedAt?: string
  createdAt: string
}

export interface BookingDetail extends Booking {
  payments?: Payment[]
}

// ---------- Gastos ----------
export type ExpenseCategory =
  | 'insumos'
  | 'sueldos'
  | 'transporte'
  | 'servicios_basicos'
  | 'arriendo'
  | 'mantenimiento'
  | 'marketing'
  | 'impuestos'
  | 'otros'

export type PaidFrom = 'petty_cash' | 'management'

export interface Expense {
  _id: ID
  branch: ID | null
  date: string
  category: ExpenseCategory
  description: string
  amount: number
  paymentMethod: PaymentMethod
  paidFrom: PaidFrom
  supplier?: string
  receiptUrl?: string
  createdBy?: PersonRef
  createdAt: string
}

// ---------- Oficinas ----------
export type OfficeFrequency = 'unica' | 'semanal' | 'quincenal' | 'mensual'
export type OfficeQuoteStatus = 'new' | 'contacted' | 'won' | 'lost'

export interface OfficeContact {
  name: string
  email: string
  phone: string
  company?: string
}

export interface BreakdownLine {
  label: string
  amount: number
}

export interface OfficeQuote {
  _id: ID
  code: string
  branch: ID
  contact: OfficeContact
  squareMeters: number
  chairs: number
  desks: number
  bathrooms: number
  frequency: OfficeFrequency
  notes?: string
  estimate: number
  breakdown: BreakdownLine[]
  status: OfficeQuoteStatus
  booking?: ID | null
  createdAt: string
}

// ---------- Configuración ----------
export interface BankAccount {
  bank: string
  type: string
  number: string
  holder: string
  documentId: string
}

export interface OfficePricing {
  pricePerM2: number
  pricePerChair: number
  pricePerDesk: number
  pricePerBathroom: number
  minimum: number
  frequencyDiscounts: { semanal: number; quincenal: number; mensual: number }
}

export interface Settings {
  businessName: string
  notifyEmails: string[]
  bankAccounts: BankAccount[]
  officePricing: OfficePricing
  bookingLeadHours: number
}

export interface PublicSettings {
  businessName: string
  bankAccounts: BankAccount[]
  officePricing: OfficePricing
  bookingLeadHours: number
  payphoneEnabled: boolean
}

// ---------- Público ----------
export interface Slot {
  time: string
  available: boolean
}

export interface Availability {
  date: string
  slots: Slot[]
}

export interface QuoteItemInput {
  service: ID
  quantity: number
}

export interface QuoteResult {
  items: BookingItem[]
  subtotal: number
  total: number
  durationMinutes: number
}

export interface PayphoneInit {
  token: string
  storeId: string
  clientTransactionId: string
  amount: number
  amountWithoutTax: number
  amountWithTax: number
  tax: number
  currency: string
  reference: string
  email?: string
  phoneNumber?: string
  documentId?: string
}

export interface BookingCustomerInput {
  name: string
  email: string
  phone: string
  documentId?: string
}

export interface CreateBookingInput {
  branch: ID
  items: QuoteItemInput[]
  date: string
  time: string
  customer: BookingCustomerInput
  address: string
  reference?: string
  notes?: string
  paymentMethod: PaymentMethod
  transferProofUrl?: string
  invoice?: InvoiceData
}

export interface AdminCreateBookingInput extends CreateBookingInput {
  operators?: ID[]
  discount?: number
  status?: BookingStatus
}

export interface CreateBookingResult {
  booking: Booking
  accessToken: string
  payment?: PayphoneInit
}

export interface PayphoneConfirmResult {
  status: 'approved' | 'rejected'
  booking: Booking & { accessToken?: string }
  accessToken?: string
}

export interface OfficeQuoteInput {
  branch: ID
  contact: OfficeContact
  squareMeters: number
  chairs: number
  desks: number
  bathrooms: number
  frequency: OfficeFrequency
  notes?: string
}

// ---------- Admin: reportes ----------
export interface Dashboard {
  today: { bookings: number; completed: number; pending: number; income: number }
  period: { bookings: number; income: number; expenses: number; net: number; averageTicket: number }
  pendingTransfers: number
  receivables: number
  newOfficeQuotes: number
  incomeByDay: { date: string; amount: number }[]
  topServices: { name: string; quantity: number; amount: number }[]
  byOperator: { name: string; bookings: number; amount: number }[]
  upcoming: Booking[]
}

export interface Agenda {
  date: string
  operators: User[]
  bookings: Booking[]
}

export interface IncomeStatement {
  month: string
  income: {
    total: number
    byMethod: Partial<Record<PaymentMethod, number>>
    byService: { name: string; quantity?: number; amount: number }[]
  }
  expenses: {
    total: number
    byCategory: { category: ExpenseCategory; amount: number }[]
    pettyCash: number
    management: number
  }
  net: number
}

export interface ProductionReport {
  byService: { service: ID; name: string; quantity: number; amount: number }[]
  byOperator: { operator: ID; name: string; bookings: number; amount: number }[]
  byDay: { date: string; bookings: number; amount: number }[]
}

export interface CashReport {
  date: string
  income: { total: number; byMethod: Partial<Record<PaymentMethod, number>> }
  pettyCashExpenses: { total: number; items: Expense[] }
  balance: number
}

export interface CustomerDetail extends Customer {
  bookings: Booking[]
}
