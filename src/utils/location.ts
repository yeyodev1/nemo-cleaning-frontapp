import type { BookingLocation } from '@/types/api'

/** Mismo filtro que el back (`booking.service.ts#parseLocation`): solo enlaces de Google Maps. */
export const MAPS_URL_RE = /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)\S*$/i

export function hasCoords(loc?: BookingLocation | null): loc is BookingLocation & { lat: number; lng: number } {
  return loc?.lat != null && loc?.lng != null
}

/** Enlace para abrir la ubicación: con coordenadas manda el GPS (más preciso que el enlace pegado). */
export function gpsUrl(loc?: BookingLocation | null): string {
  if (!loc) return ''
  if (hasCoords(loc)) return `https://www.google.com/maps?q=${loc.lat},${loc.lng}`
  return loc.url || ''
}

/** Indicaciones de manejo hasta el punto (botón "Cómo llegar" del lavador). */
export function directionsUrl(loc?: BookingLocation | null): string {
  if (!loc) return ''
  if (hasCoords(loc)) return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`
  return loc.url || ''
}

/** Vista previa del mapa sin API key (iframe de Google Maps). */
export function mapEmbedUrl(loc: { lat: number; lng: number }): string {
  return `https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=17&output=embed`
}
