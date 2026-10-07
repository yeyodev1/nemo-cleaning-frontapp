import type {
  BookingStatus,
  ID,
  PaymentConfirmation,
  PaymentMethod,
  PaymentStatus,
  QuoteItemInput,
  ServiceUnit,
} from './api'

/** Pedido de la bandeja "Pedidos por WhatsApp" (GET /admin/whatsapp/inbox). */
export interface WaOrder {
  _id: ID
  code: string
  source: 'whatsapp' | 'web' | 'admin' | 'import'
  /** true = lo creó el cliente en la web; false = pedido rápido del asesor. */
  fromWeb: boolean
  branch: ID
  customer: { _id: ID; name: string; phone?: string; email?: string } | null
  items: { name: string; variant?: string; quantity: number; unit?: ServiceUnit; subtotal: number }[]
  total: number
  discount: number
  amountPaid: number
  balance: number
  date: string
  time: string
  address: string
  reference: string
  zone: string
  notes: string
  status: BookingStatus
  operators: { _id: ID; name: string; color?: string }[]
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentAccount: string
  paymentConfirmation?: PaymentConfirmation
  trackingUrl: string
  createdAt: string
}

export type WaTab = 'pending' | 'unpaid' | 'recent'

export interface WaInbox {
  tab: WaTab
  items: WaOrder[]
  counts: { pending: number; unpaid: number }
}

export interface WaCustomerMatch {
  customer: { _id: ID; name: string; phone: string; email?: string; address?: string; totalOrders: number } | null
  last: { code: string; date: string; branch: ID; zone: string; address: string; reference: string } | null
  others: number
}

/** Cobro registrado desde la bandeja o el pedido rápido (el monto por defecto es el saldo). */
export interface WaPaymentInput {
  amount?: number
  proofUrl?: string
  reference?: string
}

export interface WaHandleInput {
  confirm?: boolean
  /** '' = por coordinar. */
  paymentAccount?: string
  operators?: ID[]
  payment?: WaPaymentInput
}

export interface WaQuickOrderInput {
  branch: ID
  customer: { _id?: ID; name: string; phone: string }
  items: (QuoteItemInput | { name: string; unitPrice: number; quantity: number })[]
  date: string
  time: string
  zone?: string
  address?: string
  reference?: string
  notes?: string
  discount?: number
  operators?: ID[]
  status: 'pending' | 'confirmed'
  paymentAccount: string
  payment?: WaPaymentInput
}
