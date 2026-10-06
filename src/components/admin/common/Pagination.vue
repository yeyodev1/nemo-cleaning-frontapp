<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{ page: number; pages: number; total?: number }>()
const emit = defineEmits<{ go: [page: number] }>()
</script>

<template>
  <nav v-if="pages > 1" class="pager" aria-label="Paginación">
    <button type="button" class="btn btn--ghost btn--icon" :disabled="page <= 1" aria-label="Página anterior" @click="emit('go', page - 1)">
      <AppIcon name="chevron-left" />
    </button>
    <span class="pager__info">Página {{ page }} de {{ pages }}<template v-if="total"> · {{ total }} en total</template></span>
    <button type="button" class="btn btn--ghost btn--icon" :disabled="page >= pages" aria-label="Página siguiente" @click="emit('go', page + 1)">
      <AppIcon name="chevron-right" />
    </button>
  </nav>
</template>

<style scoped lang="scss">
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;

  &__info {
    font-size: $text-sm;
    color: $ink-muted;
    font-weight: 600;
  }
}
</style>
