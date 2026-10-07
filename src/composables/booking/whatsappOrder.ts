import { useCatalogStore } from '@/stores/catalog'
import { localLines, type Cart } from './cart'
import { cartMessage, nemoWhatsappUrl, webOrderMessage } from '@/utils/whatsapp'
import type { CreateBookingResult } from '@/types/api'

/** Enlace de seguimiento público del pedido (el mismo que llega por correo). */
export function trackingLink(code: string, token: string): string {
  return `${window.location.origin}/pedido/${encodeURIComponent(code)}?token=${encodeURIComponent(token)}`
}

/** Texto y wa.me del pedido creado con "Coordinar y pagar por WhatsApp". */
export function orderWhatsapp(result: CreateBookingResult) {
  const catalog = useCatalogStore()
  const b = result.booking
  const text = webOrderMessage({
    code: b.code,
    items: b.items.map((i) => ({ name: i.name, variant: i.variant, quantity: i.quantity, unit: i.unit, subtotal: i.subtotal })),
    date: b.date,
    time: b.time,
    total: b.total,
    branchName: catalog.branchById(String(b.branch))?.name,
    address: b.address,
    reference: b.reference,
    zone: b.zone,
    customerName: b.customer?.name,
    trackingUrl: trackingLink(b.code, result.accessToken),
  })
  return { text, url: nemoWhatsappUrl(text) }
}

/** "¿Prefieres pedir por WhatsApp?": el carrito actual como mensaje, sin crear pedido. */
export function cartWhatsapp(input: { cart: Cart; branch?: string; date?: string; time?: string }) {
  const catalog = useCatalogStore()
  const lines = localLines(input.cart, catalog.services)
  const text = cartMessage({
    items: lines.map((l) => ({ name: l.name, variant: l.variant, quantity: l.quantity, unit: l.unit, subtotal: l.subtotal })),
    total: lines.reduce((s, l) => s + l.subtotal, 0),
    branchName: input.branch ? catalog.branchById(input.branch)?.name : undefined,
    date: input.date,
    time: input.time,
  })
  return { text, url: nemoWhatsappUrl(text) }
}
