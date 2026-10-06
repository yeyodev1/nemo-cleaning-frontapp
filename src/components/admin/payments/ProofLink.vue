<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'

/** Miniatura del comprobante; al tocarla se abre grande. PDF = enlace. */
const props = defineProps<{ url: string; title?: string }>()
const open = ref(false)
const isPdf = computed(() => /\.pdf($|\?)/i.test(props.url))
</script>

<template>
  <a v-if="isPdf" :href="url" target="_blank" rel="noopener" class="proof proof--pdf">
    <AppIcon name="file" :size="20" /> Ver PDF
  </a>
  <button v-else type="button" class="proof" aria-label="Ver comprobante en grande" @click="open = true">
    <img :src="url" alt="Comprobante de transferencia" loading="lazy" />
  </button>
  <BaseSheet :open="open" :title="title || 'Comprobante'" wide @close="open = false">
    <img :src="url" alt="Comprobante de transferencia" class="proof__big" />
    <template #footer>
      <a :href="url" target="_blank" rel="noopener" class="btn btn--ghost"><AppIcon name="external" /> Abrir original</a>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.proof {
  display: block;
  width: 88px;
  height: 88px;
  border-radius: $radius-sm;
  overflow: hidden;
  border: 1px solid $line;
  background: $sky;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--pdf {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    font-size: $text-xs;
    font-weight: 700;
    color: $navy;
  }

  &__big {
    width: 100%;
    height: auto;
    border-radius: $radius-sm;
  }
}
</style>
