import type { CustomerAccount } from '@/types/api'
import { draft } from './useBookingDraft'

/**
 * Con sesión de cliente, el asistente arranca con sus datos. El correo es
 * siempre el de la cuenta (el pedido se asocia a ella); lo demás solo se
 * llena si el borrador lo tiene vacío, para no pisar lo que ya escribió.
 */
export function prefillFromAccount(c: CustomerAccount) {
  draft.customer.email = c.email
  if (!draft.customer.name.trim()) draft.customer.name = c.name
  if (!draft.customer.phone.trim()) draft.customer.phone = c.phone
  if (!draft.customer.documentId.trim()) draft.customer.documentId = c.documentId
  if (!draft.address.trim()) draft.address = c.address
}
