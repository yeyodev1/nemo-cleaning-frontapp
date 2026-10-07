// Formato de dinero y fechas. El API manda centavos enteros y fechas "YYYY-MM-DD".

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

/** 1500 → "$15.00" */
export function money(cents: number | null | undefined): string {
  return usd.format((cents || 0) / 100)
}

/** "15.5" → 1550. Acepta coma decimal. */
export function toCents(value: string | number): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

export function fromCents(cents: number | null | undefined): string {
  return ((cents || 0) / 100).toFixed(2)
}

const TZ = 'America/Guayaquil'

/** "2026-10-10" → [2026, 10, 10] sin índices indefinidos. */
function parts(iso: string): [number, number, number] {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number)
  return [y, m, d]
}

/** Fecha de hoy en Guayaquil como "YYYY-MM-DD" (no la del navegador en UTC). */
export function todayISO(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = parts(iso)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

export function monthISO(offset = 0): string {
  const [y, m] = parts(todayISO())
  const dt = new Date(Date.UTC(y, m - 1 + offset, 1))
  return dt.toISOString().slice(0, 7)
}

export function monthRange(month: string): { from: string; to: string } {
  const [y, m] = parts(`${month}-01`)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` }
}

function isoToDate(iso: string) {
  const [y, m, d] = parts(iso.slice(0, 10))
  return new Date(Date.UTC(y, m - 1, d, 12))
}

/** "2026-10-10" → "sáb 10 oct" */
export function shortDate(iso?: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('es-EC', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(isoToDate(iso))
    .replace(/\./g, '')
}

/** "2026-10-10" → "sábado, 10 de octubre de 2026" */
export function longDate(iso?: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(isoToDate(iso))
}

export function weekdayOf(iso: string): number {
  return isoToDate(iso).getUTCDay()
}

export function monthLabel(month: string): string {
  return new Intl.DateTimeFormat('es-EC', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    isoToDate(`${month}-01`),
  )
}

/** Timestamp ISO completo → "10 oct, 14:32" en hora de Guayaquil. */
export function dateTime(iso?: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  })
    .format(new Date(iso))
    .replace(/\./g, '')
}

/** "0991234567" → "593991234567" para wa.me y tel:. */
export function intlPhone(phone?: string): string {
  const digits = (phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('593')) return digits
  if (digits.startsWith('0')) return `593${digits.slice(1)}`
  return digits
}

export function whatsappUrl(phone: string | undefined, text = ''): string {
  const n = intlPhone(phone)
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Guayaquil, Ecuador`)}`
}

export function errorMessage(e: unknown, fallback = 'Ocurrió un error. Inténtalo de nuevo.'): string {
  return (e as { message?: string })?.message || fallback
}

/** Quincena del mes calendario: Q1 = días 1–15, Q2 = 16–fin. → "Q2 · 16 al 31 de octubre" */
export function fortnightLabel(month: string, q: 1 | 2, short = false): string {
  const last = monthRange(month).to.slice(8, 10)
  const name = new Intl.DateTimeFormat('es-EC', { month: short ? 'short' : 'long', timeZone: 'UTC' })
    .format(isoToDate(`${month}-01`))
    .replace(/\./g, '')
  return q === 1 ? `Q1 · 1 al 15 de ${name}` : `Q2 · 16 al ${Number(last)} de ${name}`
}

/** 13674 → "13,674" (mismo separador que `money()`). */
const intFmt = new Intl.NumberFormat('en-US')
export function num(n: number | null | undefined): string {
  return intFmt.format(n || 0)
}

/**
 * Pedidos sin cobro pedido a pedido (igual que el back): "Plan mensual" (prepagado), "Canje" y
 * "Cortesía". No son deuda: en vez de "Por pagar" se muestra la forma de pago.
 */
export function settledLabel(b: { paymentAccount?: string; paymentConfirmation?: string }): string {
  const a = (b.paymentAccount || '').trim()
  if (/^(plan mensual|canje|cortes[ií]a)$/i.test(a)) return a
  if (b.paymentConfirmation === 'exchange') return 'Canje'
  return ''
}

/**
 * Lo que se escribe en una celda de dinero → centavos. "" = celda vacía (null);
 * NaN = texto inválido. Acepta "$1,234.56", "1234.56" y "142,28" (coma decimal).
 */
export function parseMoney(text: string): number | null {
  let t = text.replace(/[$\s]/g, '')
  if (!t) return null
  if (t.includes(',') && t.includes('.')) t = t.replace(/,/g, '')
  else if (/^-?\d+,\d{1,2}$/.test(t)) t = t.replace(',', '.')
  else t = t.replace(/,/g, '')
  if (!/^-?\d*(\.\d*)?$/.test(t) || t === '-' || t === '.') return NaN
  return Math.round(parseFloat(t) * 100)
}

/** Centavos → texto para editar ("1234.5" → "1234.50"; vacío si no hay valor). */
export function editMoney(cents: number | null | undefined): string {
  return cents === null || cents === undefined ? '' : (cents / 100).toFixed(2)
}

/** "hace 5 min", "hace 2 h", "hace 3 días": cuánto lleva esperando un pedido. */
export function timeAgo(iso?: string, now = Date.now()): string {
  if (!iso) return ''
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000))
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return `hace ${d} ${d === 1 ? 'día' : 'días'}`
}
