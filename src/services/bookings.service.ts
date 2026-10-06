import APIBase from './httpBase'
import type {
  AdminCreateBookingInput,
  Agenda,
  Booking,
  BookingDetail,
  BookingStatus,
  Dashboard,
  Paginated,
  Payment,
  PaymentMethod,
  PaymentRecordStatus,
  PaymentStatus,
  QuoteItemInput,
} from '@/types/api'

export interface BookingFilters {
  branch?: string
  status?: BookingStatus | ''
  paymentStatus?: PaymentStatus | ''
  date?: string
  from?: string
  to?: string
  operator?: string
  q?: string
  page?: number
  limit?: number
}

export interface BookingPatch {
  items?: QuoteItemInput[]
  date?: string
  time?: string
  address?: string
  reference?: string
  notes?: string
  discount?: number
  operators?: string[]
}

export interface ManualPaymentInput {
  amount: number
  method: PaymentMethod
  reference?: string
  note?: string
  proofUrl?: string
}

export interface PaymentFilters {
  status?: PaymentRecordStatus | ''
  method?: PaymentMethod | ''
  branch?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

class BookingsService extends APIBase {
  dashboard(q: { branch?: string; from?: string; to?: string }) {
    return this.get<Dashboard>('admin/dashboard', q)
  }

  list(q: BookingFilters) {
    return this.get<Paginated<Booking>>('admin/bookings', { ...q })
  }

  agenda(branch: string | undefined, date: string) {
    return this.get<Agenda>('admin/agenda', { branch, date })
  }

  create(body: AdminCreateBookingInput) {
    return this.post<Booking>('admin/bookings', body)
  }

  detail(id: string) {
    return this.get<BookingDetail>(`admin/bookings/${id}`)
  }

  update(id: string, body: BookingPatch) {
    return this.patch<BookingDetail>(`admin/bookings/${id}`, body)
  }

  setStatus(id: string, status: BookingStatus, note?: string) {
    return this.patch<BookingDetail>(`admin/bookings/${id}/status`, { status, note })
  }

  addPayment(id: string, body: ManualPaymentInput) {
    return this.post<Payment>(`admin/bookings/${id}/payments`, body)
  }

  payments(q: PaymentFilters) {
    return this.get<Paginated<Payment>>('admin/payments', { ...q })
  }

  reviewPayment(id: string, approved: boolean, note?: string) {
    return this.patch<Payment>(`admin/payments/${id}/review`, { approved, note })
  }

  receivables(branch?: string) {
    return this.get<Booking[]>('admin/receivables', { branch })
  }
}

export const bookingsService = new BookingsService()
