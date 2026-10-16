<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { operatorService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { OperatorJob } from '@/types/api'

/**
 * Reportar una novedad del servicio: qué pasó y fotos (cosas en el carro, daños,
 * cómo estaba el lugar). Las fotos se suben al elegirlas; se envía todo junto.
 */
const props = defineProps<{ job: OperatorJob }>()
const emit = defineEmits<{ saved: [job: OperatorJob]; close: [] }>()
const toast = useToastStore()

const MAX = 8
const text = ref('')
const photos = ref<string[]>([])
const uploading = ref(0)
const sending = ref(false)
const input = ref<HTMLInputElement | null>(null)

async function onPick(e: Event) {
  const files = [...((e.target as HTMLInputElement).files || [])].slice(0, MAX - photos.value.length)
  ;(e.target as HTMLInputElement).value = ''
  for (const file of files) {
    uploading.value++
    operatorService
      .uploadPhoto(file)
      .then((r) => photos.value.push(r.url))
      .catch((err) => toast.error(errorMessage(err, 'No se pudo subir una foto')))
      .finally(() => uploading.value--)
  }
}

async function send() {
  if (!text.value.trim() && !photos.value.length) return toast.error('Escribe qué pasó o agrega una foto')
  sending.value = true
  try {
    emit('saved', await operatorService.addNovedad(props.job._id, { text: text.value.trim(), photos: photos.value }))
    toast.success('Novedad enviada a la oficina')
    text.value = ''
    photos.value = []
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="nc">
    <label class="field">
      <span class="field__label">¿Qué pasó?</span>
      <textarea v-model="text" rows="3" placeholder="Ej.: el carro tenía objetos de valor en el asiento; rayón en la puerta antes de empezar"></textarea>
    </label>

    <div class="nc__photos">
      <div v-for="(p, i) in photos" :key="p" class="nc__thumb">
        <img :src="p" alt="Foto de la novedad" />
        <button type="button" class="nc__remove" aria-label="Quitar foto" @click="photos.splice(i, 1)"><AppIcon name="x" :size="14" /></button>
      </div>
      <span v-for="n in uploading" :key="`u${n}`" class="nc__thumb nc__thumb--loading skeleton"></span>
      <button v-if="photos.length + uploading < MAX" type="button" class="nc__add" @click="input?.click()">
        <AppIcon name="camera" :size="24" />
        <span>Tomar foto</span>
      </button>
      <input ref="input" type="file" accept="image/*" capture="environment" multiple class="sr-only" @change="onPick" />
    </div>
    <p class="nc__hint">Si hay cosas en el carro o algún daño, toma foto antes de empezar.</p>

    <div class="nc__actions">
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn btn--primary" :disabled="sending || uploading > 0" @click="send">
        <AppIcon name="check" /> {{ uploading ? 'Subiendo fotos…' : sending ? 'Enviando…' : 'Enviar novedad' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.nc {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.9rem;
  border-radius: $radius-md;
  background: $orange-soft;

  &__photos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    gap: 0.5rem;
  }

  &__thumb {
    position: relative;
    aspect-ratio: 1;
    border-radius: $radius-sm;
    overflow: hidden;
    background: $line;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__remove {
    position: absolute;
    top: 4px;
    right: 4px;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgb(0 0 0 / 0.6);
    color: #fff;
  }

  &__add {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    aspect-ratio: 1;
    border-radius: $radius-sm;
    border: 2px dashed $orange-ink;
    background: $surface;
    color: $orange-ink;
    font-size: $text-xs;
    font-weight: 700;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-soft;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>
