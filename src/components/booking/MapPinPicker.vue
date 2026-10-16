<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'

/**
 * Mapa para poner el punto exacto: se toca el mapa o se arrastra el pin.
 * Usa OpenStreetMap (sin API key). Sin punto, arranca centrado en Samborondón/Guayaquil.
 */
const props = defineProps<{ modelValue: { lat: number; lng: number } | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: { lat: number; lng: number }] }>()

const DEFAULT_CENTER: [number, number] = [-2.143, -79.87]
const el = ref<HTMLElement | null>(null)
let map: LeafletMap | null = null
let marker: Marker | null = null
let L: typeof import('leaflet') | null = null

const round = (n: number) => Math.round(n * 1e6) / 1e6

function place(lat: number, lng: number) {
  if (!map || !L) return
  if (!marker) {
    const icon = L.divIcon({ className: 'pin-icon', html: '<span></span>', iconSize: [30, 42], iconAnchor: [15, 42] })
    marker = L.marker([lat, lng], { draggable: true, icon, keyboard: false }).addTo(map)
    marker.on('dragend', () => {
      const p = marker!.getLatLng()
      emit('update:modelValue', { lat: round(p.lat), lng: round(p.lng) })
    })
  } else {
    marker.setLatLng([lat, lng])
  }
}

onMounted(async () => {
  L = await import('leaflet')
  if (!el.value) return
  const start = props.modelValue
  map = L.map(el.value, { zoomControl: true, attributionControl: true }).setView(start ? [start.lat, start.lng] : DEFAULT_CENTER, start ? 17 : 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)
  if (start) place(start.lat, start.lng)
  map.on('click', (e) => {
    place(e.latlng.lat, e.latlng.lng)
    emit('update:modelValue', { lat: round(e.latlng.lat), lng: round(e.latlng.lng) })
  })
})

// Si llega un punto de afuera (GPS del celular), se mueve el pin y el mapa.
watch(
  () => props.modelValue,
  (v) => {
    if (!v || !map) return
    const cur = marker?.getLatLng()
    if (cur && round(cur.lat) === v.lat && round(cur.lng) === v.lng) return
    place(v.lat, v.lng)
    map.setView([v.lat, v.lng], Math.max(map.getZoom(), 17))
  },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
  marker = null
})
</script>

<template>
  <div class="mpp">
    <div ref="el" class="mpp__map" role="application" aria-label="Mapa: toca para poner el punto"></div>
    <p class="mpp__hint">{{ modelValue ? 'Arrastra el pin para ajustarlo.' : 'Toca el mapa en el lugar exacto del servicio.' }}</p>
  </div>
</template>

<style scoped lang="scss">
.mpp {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &__map {
    width: 100%;
    height: 260px;
    border-radius: $radius-sm;
    background: $line;
    // Leaflet usa z-index altos: se aíslan para no tapar el header ni la barra fija.
    position: relative;
    z-index: 0;
    isolation: isolate;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-soft;
  }
}

:deep(.pin-icon) {
  background: none;
  border: 0;

  span {
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    background: $orange;
    border: 3px solid $navy;
    transform: rotate(-45deg);
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.35);
  }
}
</style>
