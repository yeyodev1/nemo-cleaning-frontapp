import APIBase from './httpBase'
import type {
  Availability,
  Booking,
  Branch,
  CreateBookingInput,
  CreateBookingResult,
  OfficeQuote,
  OfficeQuoteInput,
  PayphoneConfirmResult,
  PayphoneInit,
  PublicSettings,
  QuoteItemInput,
  QuoteResult,
  Service,
  ServiceCategory,
} from '@/types/api'

class PublicService extends APIBase {
  branches() {
    return this.get<Branch[]>('public/branches')
  }

  services(category?: ServiceCategory) {
    return this.get<Service[]>('public/services', { category })
  }

  settings() {
    return this.get<PublicSettings>('public/settings')
  }

  availability(branch: string, date: string) {
    return this.get<Availability>('public/availability', { branch, date })
  }

  quote(items: QuoteItemInput[]) {
    return this.post<QuoteResult>('public/quote', { items })
  }

  createBooking(body: CreateBookingInput) {
    return this.post<CreateBookingResult>('public/bookings', body)
  }

  booking(code: string, token: string) {
    return this.get<Booking>(`public/bookings/${encodeURIComponent(code)}`, { token })
  }

  uploadBookingProof(code: string, token: string, file: File) {
    return this.upload<Booking>(`public/bookings/${encodeURIComponent(code)}/transfer-proof`, file, { token })
  }

  cancelBooking(code: string, token: string) {
    return this.post<Booking>(`public/bookings/${encodeURIComponent(code)}/cancel`, {}, { token })
  }

  restartPayphone(code: string, token: string) {
    return this.post<PayphoneInit>(`public/bookings/${encodeURIComponent(code)}/payphone`, {}, { token })
  }

  confirmPayphone(id: string, clientTransactionId: string) {
    return this.post<PayphoneConfirmResult>('public/payphone/confirm', { id, clientTransactionId })
  }

  createOfficeQuote(body: OfficeQuoteInput) {
    return this.post<OfficeQuote>('public/office-quotes', body)
  }

  /** Comprobante subido ANTES de crear el pedido (transferencia). */
  uploadProof(file: File) {
    return this.upload<{ url: string }>('public/uploads/proof', file)
  }
}

export const publicService = new PublicService()
