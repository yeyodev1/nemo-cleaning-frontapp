import APIBase from './httpBase'
import type {
  Booking,
  Branch,
  Customer,
  CustomerDetail,
  OfficeQuote,
  OfficeQuoteStatus,
  Paginated,
  Role,
  Service,
  Settings,
  User,
} from '@/types/api'

export type ServiceInput = Omit<Service, '_id'>
export type BranchInput = Omit<Branch, '_id'>
export type UserInput = Omit<User, '_id' | 'createdAt'>
export type CustomerInput = Partial<Omit<Customer, '_id' | 'createdAt' | 'totalOrders' | 'totalSpent'>>

/** Algunos listados pueden venir paginados o como arreglo: se normaliza a arreglo. */
function asArray<T>(data: T[] | Paginated<T>): T[] {
  return Array.isArray(data) ? data : data.items
}

class ManagementService extends APIBase {
  // Catálogo
  async services() {
    return asArray(await this.get<Service[] | Paginated<Service>>('admin/services'))
  }
  createService(body: ServiceInput) {
    return this.post<Service>('admin/services', body)
  }
  updateService(id: string, body: Partial<ServiceInput>) {
    return this.patch<Service>(`admin/services/${id}`, body)
  }
  deactivateService(id: string) {
    return this.delete<Service>(`admin/services/${id}`)
  }

  // Sucursales
  async branches() {
    return asArray(await this.get<Branch[] | Paginated<Branch>>('admin/branches'))
  }
  createBranch(body: Partial<BranchInput>) {
    return this.post<Branch>('admin/branches', body)
  }
  updateBranch(id: string, body: Partial<BranchInput>) {
    return this.patch<Branch>(`admin/branches/${id}`, body)
  }

  // Personal
  async users(role?: Role) {
    return asArray(await this.get<User[] | Paginated<User>>('admin/users', { role, limit: 100 }))
  }
  createUser(body: UserInput) {
    return this.post<User>('admin/users', body)
  }
  updateUser(id: string, body: Partial<UserInput>) {
    return this.patch<User>(`admin/users/${id}`, body)
  }

  // Clientes
  customers(q: { q?: string; page?: number; limit?: number }) {
    return this.get<Paginated<Customer>>('admin/customers', q)
  }
  customer(id: string) {
    return this.get<CustomerDetail>(`admin/customers/${id}`)
  }
  createCustomer(body: CustomerInput) {
    return this.post<Customer>('admin/customers', body)
  }
  updateCustomer(id: string, body: CustomerInput) {
    return this.patch<Customer>(`admin/customers/${id}`, body)
  }

  // Cotizaciones de oficina
  officeQuotes(q: { status?: OfficeQuoteStatus | ''; branch?: string; page?: number }) {
    return this.get<Paginated<OfficeQuote>>('admin/office-quotes', q)
  }
  officeQuote(id: string) {
    return this.get<OfficeQuote>(`admin/office-quotes/${id}`)
  }
  updateOfficeQuote(id: string, body: { status?: OfficeQuoteStatus; notes?: string }) {
    return this.patch<OfficeQuote>(`admin/office-quotes/${id}`, body)
  }
  convertOfficeQuote(id: string, body: { date: string; time: string; address?: string; operators?: string[] }) {
    return this.post<Booking>(`admin/office-quotes/${id}/convert`, body)
  }

  // Configuración
  settings() {
    return this.get<Settings>('admin/settings')
  }
  updateSettings(body: Partial<Settings>) {
    return this.patch<Settings>('admin/settings', body)
  }

  // Archivos (Cloudinary)
  uploadFile(file: File) {
    return this.upload<{ url: string }>('admin/uploads', file)
  }
}

export const managementService = new ManagementService()

class OperatorService extends APIBase {
  bookings(date?: string) {
    return this.get<Booking[]>('operator/bookings', { date })
  }
  setStatus(id: string, status: 'on_the_way' | 'in_progress' | 'completed', note?: string) {
    return this.patch<Booking>(`operator/bookings/${id}/status`, { status, note })
  }
}

export const operatorService = new OperatorService()
