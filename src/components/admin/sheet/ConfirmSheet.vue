<script setup lang="ts">
import BaseSheet from '@/components/ui/BaseSheet.vue'

/** Confirmación dentro de la UI (en vez de window.confirm), con el detalle de lo que pasará. */
defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; busy?: boolean }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>

<template>
  <BaseSheet :open="open" :title="title" @close="emit('close')">
    <p class="msg">{{ message }}</p>
    <slot />
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="button" class="btn" :class="danger ? 'btn--danger' : 'btn--primary'" :disabled="busy" @click="emit('confirm')">
        {{ busy ? 'Un momento…' : confirmLabel || 'Confirmar' }}
      </button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.msg {
  color: $ink-soft;
  line-height: 1.55;
}
</style>
