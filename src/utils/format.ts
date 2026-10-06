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
