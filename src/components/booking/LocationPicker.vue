<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useGeoLocation } from '@/composables/booking/useGeoLocation'
import { MAPS_URL_RE, hasCoords, mapEmbedUrl, gpsUrl } from '@/utils/location'
import type { BookingLocation } from '@/types/api'

/**
 * Ubicación GPS del servicio. Dos caminos: el GPS del celular (si está en el lugar) o pegar el
 * enlace de Google Maps (si reserva desde otro sitio). `recommended` la destaca en Vía a la Costa.
 */
const props = defineProps<{ modelValue: BookingLocation | null; recommended?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: BookingLocation | null] }>()

const geo = useGeoLocation((loc) => emit('update:modelValue', loc))
const pasting = ref(!!props.modelValue?.url && !hasCoords(props.modelValue))
const link = ref(props.modelValue?.url ?? '')
const linkError = computed(() => (link.value.trim() && !MAPS_URL_RE.test(link.value.trim()) ? 'Pega un enlace de Google Maps (empieza con https://maps.app.goo.gl/…).' : ''))
const coords = computed(() => (hasCoords(props.modelValue) ? props.modelValue : null))

function saveLink() {
  const url = link.value.trim()
  if (!url || linkError.value) return
  emit('update:modelValue', { lat: null, lng: null, accuracy: 0, url })
}

function clear() {
  link.value = ''
  emit('update:modelValue', null)
}
</script>

<template>
  <section class="loc" :class="{ 'loc--rec': recommended, 'is-set': modelValue }" aria-labelledby="loc-title">
    <header class="loc__head">
      <span class="loc__icon"><AppIcon name="pin" :size="20" /></span>
      <div>
        <h3 id="loc-title" class="loc__title">
          Ubicación GPS <span v-if="recommended" class="loc__badge">Recomendado en Vía a la Costa</span>
        </h3>
        <p class="loc__sub">Así el equipo llega directo a tu puerta, sin buscar la dirección.</p>
      </div>
    </header>

    <!-- Ya hay ubicación -->
    <div v-if="modelValue" class="loc__done">
      <iframe v-if="coords" class="loc__map" :src="mapEmbedUrl(coords)" title="Vista previa de tu ubicación" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <p class="loc__ok">
        <AppIcon name="check-circle" :size="18" />
        <span>
          {{ coords ? 'Ubicación guardada' : 'Enlace de Google Maps guardado' }}
          <small v-if="coords && modelValue.accuracy">precisión aprox. {{ modelValue.accuracy }} m</small>
        </span>
      </p>
      <div class="loc__actions">
        <a :href="gpsUrl(modelValue)" target="_blank" rel="noopener" class="btn btn--ghost btn--sm"><AppIcon name="external" :size="16" /> Ver en Maps</a>
        <button v-if="coords" type="button" class="btn btn--ghost btn--sm" :disabled="geo.state.value === 'locating'" @click="geo.locate">
          <AppIcon name="refresh" :size="16" /> Volver a tomar
        </button>
        <button type="button" class="btn btn--ghost btn--sm" @click="clear"><AppIcon name="trash" :size="16" /> Quitar</button>
      </div>
    </div>

    <!-- Sin ubicación -->
    <template v-else>
      <button type="button" class="btn btn--primary loc__gps" :disabled="geo.state.value === 'locating'" @click="geo.locate">
        <AppIcon name="locate" :size="18" :class="{ spin: geo.state.value === 'locating' }" />
        {{ geo.state.value === 'locating' ? 'Buscando tu ubicación…' : 'Usar mi ubicación actual' }}
      </button>
      <p class="loc__hint">Úsalo solo si estás ahora en el lugar donde haremos la limpieza.</p>
      <p v-if="geo.error.value" class="loc__err" role="alert"><AppIcon name="alert" :size="15" /> {{ geo.error.value }}</p>

      <button v-if="!pasting" type="button" class="loc__link" @click="pasting = true">¿No estás en el lugar? Pega el enlace de Google Maps</button>
      <div v-else class="loc__paste">
        <label class="field">
          <span class="field__label">Enlace de Google Maps</span>
          <input v-model="link" type="url" inputmode="url" placeholder="https://maps.app.goo.gl/…" @keydown.enter.prevent="saveLink" />
          <span v-if="linkError" class="field__hint loc__err">{{ linkError }}</span>
          <span v-else class="field__hint">En Google Maps toca tu casa → Compartir → Copiar enlace.</span>
        </label>
        <button type="button" class="btn btn--ghost" :disabled="!link.trim() || !!linkError" @click="saveLink">Guardar enlace</button>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.loc {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: $radius-md;
  border: 1.5px solid $line;
  background: $surface;
  transition: border-color $dur $ease-out;

  &--rec {
    border-color: $sky-blue;
    background: $sky;
  }

  &.is-set {
    border-color: $success;
  }

  &__head {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  &__icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: $navy;
    color: #fff;
  }

  &__title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.5rem;
    font-size: $text-base;
    font-weight: 800;
    color: $navy;
  }

  &__badge {
    padding: 0.15rem 0.55rem;
    border-radius: $radius-pill;
    background: $orange-soft;
    color: $orange-ink;
    font-size: $text-xs;
    font-weight: 700;
  }

  &__sub,
  &__hint {
    font-size: $text-xs;
    color: $ink-soft;
    line-height: 1.5;
  }

  &__gps {
    width: 100%;
    min-height: $tap;

    .spin {
      animation: loc-spin 1s linear infinite;
    }
  }

  &__err {
    display: flex;
    gap: 0.35rem;
    align-items: flex-start;
    font-size: $text-xs;
    font-weight: 600;
    color: $danger;
    line-height: 1.5;

    svg {
      flex-shrink: 0;
      margin-top: 2px;
    }
  }

  &__link {
    align-self: flex-start;
    min-height: $tap;
    padding: 0;
    border: 0;
    background: none;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  &__paste {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    @include from('md') {
      flex-direction: row;
      align-items: flex-start;

      .field {
        flex: 1;
      }

      .btn {
        margin-top: 1.6rem;
      }
    }
  }

  &__done {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__map {
    width: 100%;
    height: 180px;
    border: 0;
    border-radius: $radius-sm;
    background: $line;
  }

  &__ok {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;

    svg {
      color: $success;
      flex-shrink: 0;
      margin-top: 1px;
    }

    span {
      display: flex;
      flex-direction: column;
    }

    small {
      font-size: $text-xs;
      font-weight: 500;
      color: $ink-muted;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

@keyframes loc-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loc__gps .spin {
    animation: none;
  }
}
</style>
