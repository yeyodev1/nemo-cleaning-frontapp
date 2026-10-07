import APIBase from './httpBase'
import type { CustomerAccount, CustomerBooking, CustomerProfileInput, Paginated } from '@/types/api'

/** "Mi cuenta" del cliente: usa su propio token, nunca el del personal. */
class CustomerService extends APIBase {
  protected authAs = 'customer' as const

  requestCode(email: string) {
    return this.post<{ ok: true }>('customer-auth/request-code', { email })
  }

  verify(email: string, code: string) {
    return this.post<{ token: string; customer: CustomerAccount }>('customer-auth/verify', { email, code })
  }

  me() {
    return this.get<CustomerAccount>('customer/me')
  }

  updateMe(body: CustomerProfileInput) {
    return this.patch<CustomerAccount>('customer/me', body)
  }

  bookings(page = 1, limit = 10) {
    return this.get<Paginated<CustomerBooking>>('customer/bookings', { page, limit })
  }
}

export const customerService = new CustomerService()
