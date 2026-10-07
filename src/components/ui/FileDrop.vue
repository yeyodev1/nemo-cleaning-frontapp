<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'

/**
 * Selector de archivo (imagen o PDF ≤ 8 MB) con vista previa. No sube nada:
 * el padre recibe el File en `pick` y decide a qué endpoint mandarlo.
 */
const props = withDefaults(
  defineProps<{ label?: string; url?: string; busy?: boolean; accept?: string; maxMb?: number }>(),
  { label: 'Subir comprobante', accept: 'image/*,application/pdf', maxMb: 8 },
)
const emit = defineEmits<{ pick: [file: File]; error: [message: string] }>()
const input = ref<HTMLInputElement | null>(null)
const localName = ref('')

const isPdf = computed(() => /\.pdf($|\?)/i.test(props.url || '') || localName.value.toLowerCase().endsWith('.pdf'))

function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > props.maxMb * 1024 * 1024) {
    emit('error', `El archivo pesa más de ${props.maxMb} MB`)
    return
  }
  localName.value = file.name
  emit('pick', file)
  if (input.value) input.value.value = ''
}
</script>

<template>
  <div class="drop" :class="{ 'drop--done': url }">
    <label class="drop__zone">
      <input ref="input" type="file" class="sr-only" :accept="accept" :disabled="busy" @change="onChange" />
      <span class="drop__icon"><AppIcon :name="busy ? 'refresh' : url ? 'check' : 'upload'" :size="22" /></span>
      <span class="drop__text">
        <strong>{{ busy ? 'Subiendo…' : url ? 'Archivo cargado' : label }}</strong>
        <small>{{ url ? 'Toca para reemplazarlo' : `Imagen o PDF, máximo ${maxMb} MB` }}</small>
      </span>
    </label>
    <a v-if="url" :href="url" target="_blank" rel="noopener" class="drop__preview">
      <img v-if="!isPdf" :src="url" alt="Vista previa del archivo" />
      <span v-else class="drop__pdf"><AppIcon name="file" :size="22" /> Ver PDF</span>
    </a>
  </div>
</template>

<style scoped lang="scss">
.drop {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__zone {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    min-height: 72px;
    padding: 0.9rem 1rem;
    border: 2px dashed $line-strong;
    border-radius: $radius-md;
    background: $sky;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;

    &:hover,
    &:focus-within {
      border-color: $navy;
      background: $navy-soft;
    }
  }

  &--done &__zone {
    border-style: solid;
    border-color: $orange;
    background: $orange-soft;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $surface;
    color: $navy;
    box-shadow: $shadow-sm;
  }

  &--done &__icon {
    color: $orange-ink;
  }

  &__text {
    display: flex;
    flex-direction: column;
    line-height: 1.3;

    strong {
      font-size: $text-sm;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__preview {
    align-self: flex-start;
    border-radius: $radius-sm;
    overflow: hidden;
    border: 1px solid $line;

    img {
      max-height: 160px;
      width: auto;
    }
  }

  &__pdf {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.9rem;
    font-weight: 700;
    color: $navy;
  }
}
</style>
