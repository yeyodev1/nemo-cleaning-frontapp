import { site } from '@/config/site'
import { longDate, money, whatsappUrl } from './format'

/**
 * Mensajes de WhatsApp de la tienda y del panel. Todos en texto plano con el formato de WhatsApp
 * (*negrita*), sin emojis, y armados en un solo lugar para que el cliente y los asesores vean
 * siempre lo mismo.
 */

export interface MessageLine {
  name: string
  variant?: string
  quantity: number
  unit?: string
  subtotal?: number
}

export interface MessageOrder {
  code: string
  items: MessageLine[]
  date: string
  time: string
  total: number
  branchName?: string
  address?: string
  reference?: string
  zone?: string
  customerName?: string
  trackingUrl?: string
}

/** "sábado, 10 de octubre de 2026" → "sábado 10 de octubre" (más corto para el chat). */
function chatDate(iso: string): string {
  return longDate(iso).replace(/,/g, '').replace(/ de \d{4}$/, '')
}

function qty(l: MessageLine): string {
  return l.unit === 'm2' ? `${l.quantity} m²` : `x ${l.quantity}`
}

function lineText(l: MessageLine, prices = true): string {
  const name = l.variant ? `${l.name} · ${l.variant}` : l.name
  const price = prices && l.subtotal !== undefined ? ` — ${money(l.subtotal)}` : ''
  return `• ${name} ${qty(l)}${price}`
}

function placeText(o: MessageOrder): string[] {
  const out: string[] = []
  if (o.branchName) out.push(`*Sucursal:* ${o.branchName}`)
  const where = [o.address, o.zone && !o.address?.includes(o.zone) ? `(${o.zone})` : ''].filter(Boolean).join(' ')
  if (where) out.push(`*Dirección:* ${where}${o.reference ? ` — Ref.: ${o.reference}` : ''}`)
  return out
}

/** Cliente → Nemo: pedido creado en la web que termina en WhatsApp. */
export function webOrderMessage(o: MessageOrder): string {
  return compose([
    'Hola, Nemo Cleaning. Acabo de hacer un pedido en la web y quiero coordinar el pago por aquí.',
    '',
    `*Pedido ${o.code}*`,
    ...o.items.map((l) => lineText(l)),
    '',
    `*Fecha:* ${chatDate(o.date)}, ${o.time}`,
    ...placeText(o),
    `*Total:* ${money(o.total)}`,
    o.customerName && `*Nombre:* ${o.customerName}`,
    '',
    o.trackingUrl && `Seguimiento: ${o.trackingUrl}`,
  ])
}

/** Cliente → Nemo: resumen del carrito sin crear pedido ("¿Prefieres pedir por WhatsApp?"). */
export function cartMessage(c: { items: MessageLine[]; total: number; branchName?: string; date?: string; time?: string }): string {
  const when = c.date ? `${chatDate(c.date)}${c.time ? `, ${c.time}` : ''}` : ''
  return compose([
    'Hola, Nemo Cleaning. Quiero hacer este pedido:',
    '',
    ...c.items.map((l) => lineText(l)),
    `*Subtotal:* ${money(c.total)}`,
    c.branchName && `*Sucursal:* ${c.branchName}`,
    when && `*Fecha que me gustaría:* ${when}`,
    '',
    '¿Me ayudan a agendarlo?',
  ])
}

/** Une líneas: quita las opcionales vacías (null/false) y no deja dos líneas en blanco seguidas. */
function compose(lines: (string | null | false | undefined)[]): string {
  const out: string[] = []
  for (const l of lines) {
    if (l === null || l === false || l === undefined) continue
    if (l === '' && (out.length === 0 || out[out.length - 1] === '')) continue
    out.push(l)
  }
  while (out[out.length - 1] === '') out.pop()
  return out.join('\n')
}

function firstName(name?: string): string {
  return (name || '').trim().split(/\s+/)[0] || ''
}

/** Asesor → cliente: enlace de seguimiento para pagar con tarjeta (Payphone). */
export function paymentLinkMessage(o: { code: string; balance: number; customerName?: string; trackingUrl: string }): string {
  const hi = firstName(o.customerName)
  return [
    `Hola${hi ? ` ${hi}` : ''}, te escribimos de Nemo Cleaning.`,
    '',
    `Tu pedido *${o.code}* por *${money(o.balance)}* está listo para pagar con tarjeta (Visa o Mastercard), de forma segura con Payphone:`,
    o.trackingUrl,
    '',
    'Abre el enlace y toca "Pagar con tarjeta". Apenas se apruebe, tu pedido queda confirmado.',
  ].join('\n')
}

/** Asesor → cliente: confirmación del pedido rápido. */
export function confirmationMessage(o: MessageOrder & { paymentText?: string }): string {
  const hi = firstName(o.customerName)
  return compose([
    `Hola${hi ? ` ${hi}` : ''}, tu pedido en Nemo Cleaning está registrado.`,
    '',
    `*Pedido ${o.code}*`,
    ...o.items.map((l) => lineText(l, false)),
    '',
    `*Fecha:* ${chatDate(o.date)}, ${o.time}`,
    ...placeText(o),
    `*Total:* ${money(o.total)}`,
    o.paymentText && `*Pago:* ${o.paymentText}`,
    '',
    o.trackingUrl && `Sigue tu pedido aquí: ${o.trackingUrl}`,
    'Gracias por confiar en Nemo Cleaning.',
  ])
}

/** Asesor → cliente: saludo para retomar la conversación. */
export function greetingMessage(o: { code: string; customerName?: string }): string {
  const hi = firstName(o.customerName)
  return `Hola${hi ? ` ${hi}` : ''}, te escribimos de Nemo Cleaning por tu pedido ${o.code}.`
}

/** Enlace al WhatsApp oficial de Nemo (o al de la sucursal si lo trae el API). */
export function nemoWhatsappUrl(text: string, branchWhatsapp?: string): string {
  return whatsappUrl(branchWhatsapp || site.whatsapp, text)
}

/** Celular o tableta: allí wa.me abre la app y conviene navegar en la misma pestaña. */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

/**
 * Abre WhatsApp. En el celular navega (window.open lo bloquean tras un await); en escritorio
 * usa la pestaña que se abrió en el mismo clic (`pending`) o una nueva. Devuelve false si el
 * navegador la bloqueó, para mostrar el botón "Abrir WhatsApp".
 */
export function openWhatsApp(url: string, pending?: Window | null): boolean {
  if (isMobileDevice()) {
    window.location.href = url
    return true
  }
  if (pending && !pending.closed) {
    pending.location.href = url
    return true
  }
  const w = window.open(url, '_blank', 'noopener')
  return Boolean(w)
}

/** Copia al portapapeles con respaldo para navegadores sin la API moderna. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}
