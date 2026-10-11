import { ref } from 'vue'
import type { BookingLocation } from '@/types/api'

export type GeoState = 'idle' | 'locating' | 'error'

/**
 * GPS del celular para la ubicación del servicio. Pide alta precisión (en Vía a la Costa las
 * casas no siempre tienen dirección clara) y explica en español por qué falló, sin tecnicismos.
 */
export function useGeoLocation(onFound: (loc: BookingLocation) => void) {
  const state = ref<GeoState>('idle')
  const error = ref('')
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  function locate() {
    if (!supported) {
      state.value = 'error'
      error.value = 'Tu navegador no permite compartir la ubicación. Pega el enlace de Google Maps.'
      return
    }
    state.value = 'locating'
    error.value = ''
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.value = 'idle'
        onFound({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 0),
          url: '',
        })
      },
      (e) => {
        state.value = 'error'
        error.value =
          e.code === e.PERMISSION_DENIED
            ? 'No diste permiso para usar tu ubicación. Actívalo en el candado de la barra del navegador o pega el enlace de Google Maps.'
            : e.code === e.TIMEOUT
              ? 'El GPS tardó demasiado. Intenta otra vez cerca de una ventana o pega el enlace de Google Maps.'
              : 'No pudimos obtener tu ubicación. Intenta otra vez o pega el enlace de Google Maps.'
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    )
  }

  return { state, error, supported, locate }
}
