import { computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import type { LineCopy } from '@/config/landing'

/** Servicios reales (API) de una línea del catálogo y su precio de entrada ("desde $X"). */
export function useLineServices(line: () => LineCopy) {
  const catalog = useCatalogStore()
  const inLine = computed(() => catalog.services.filter((s) => line().categories.includes(s.category)))
  const services = computed(() => inLine.value.filter((s) => !s.isExtra))
  const extras = computed(() => inLine.value.filter((s) => s.isExtra))
  // Los servicios por m² no entran al "desde": $1,10/m² junto a $8 por servicio confundiría.
  const fromPrice = computed(() => {
    const prices = services.value.filter((s) => s.unit !== 'm2' && s.price > 0).map((s) => s.price)
    return prices.length ? Math.min(...prices) : null
  })
  // "Qué incluye": el primer punto de cada servicio tal cual viene del catálogo, sin repetir
  // (sillas, sofás y colchones comparten "Eliminación de ácaros…").
  const highlights = computed(() => {
    const seen = new Set<string>()
    const out: { service: string; feature: string }[] = []
    for (const s of services.value) {
      const feature = s.features[0]
      if (!feature) continue
      const key = feature.toLowerCase().split(/\s+/).slice(0, 3).join(' ')
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ service: s.name, feature })
      if (out.length === 3) break
    }
    return out
  })
  return { catalog, services, extras, fromPrice, highlights }
}
