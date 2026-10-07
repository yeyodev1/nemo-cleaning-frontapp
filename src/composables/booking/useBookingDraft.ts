import { reactive, watch } from 'vue'
import { DRAFT_KEY } from '@/config/site'
import { readJSON, removeKey, writeJSON } from '@/utils/storage'
import { todayISO } from '@/utils/format'
import type { InvoiceData, PaymentMethod } from '@/types/api'
import type { Cart } from './cart'

/**
 * Borrador del asistente /reservar. Estado de módulo: sobrevive al cambiar de
 * paso y se guarda en localStorage para no perder el pedido si se recarga.
 */
export interface BookingDraft {
  step: number
  branch: string
  cart: Cart
  date: string
  time: string
  address: string
  /** Urbanización / zona (lista de la sucursal o escrita en "Otra"). */
  zone: string
  reference: string
  notes: string
  customer: { name: string; email: string; phone: string; documentId: string }
  invoice: InvoiceData
  paymentMethod: PaymentMethod | ''
  transferProofUrl: string
}

function empty(): BookingDraft {
  return {
    step: 1,
    branch: '',
    cart: {},
    date: '',
    time: '',
    address: '',
    zone: '',
    reference: '',
    notes: '',
    customer: { name: '', email: '', phone: '', documentId: '' },
    invoice: { required: false, name: '', documentId: '', email: '', address: '' },
    paymentMethod: '',
    transferProofUrl: '',
  }
}

function restore(): BookingDraft {
  const base = empty()
  const saved = readJSON<Partial<BookingDraft>>(DRAFT_KEY, {})
  const draft: BookingDraft = {
    ...base,
    ...saved,
    customer: { ...base.customer, ...(saved.customer || {}) },
    invoice: { ...base.invoice, ...(saved.invoice || {}) },
    cart: { ...(saved.cart || {}) },
  }
  // Una fecha que ya pasó no sirve: se pide de nuevo.
  if (draft.date && draft.date < todayISO()) {
    draft.date = ''
    draft.time = ''
  }
  return draft
}

export const draft = reactive<BookingDraft>(restore())

watch(draft, (v) => writeJSON(DRAFT_KEY, v), { deep: true })

export function resetDraft() {
  Object.assign(draft, empty())
  removeKey(DRAFT_KEY)
}
