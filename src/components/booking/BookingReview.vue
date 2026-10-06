<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCatalogStore } from '@/stores/catalog'
import { draft } from '@/composables/booking/useBookingDraft'
import { longDate } from '@/utils/format'

defineEmits<{ edit: [step: number] }>()
const catalog = useCatalogStore()
const branch = computed(() => catalog.branchById(draft.branch))
</script>

<template>
  <dl class="review">
    <div class="review__row">
      <AppIcon name="pin" :size="18" />
      <dt class="sr-only">Sucursal y dirección</dt>
      <dd>
        <strong>{{ draft.address }}</strong>
        <small
          >{{ draft.reference }}<template v-if="draft.reference && branch"> · </template>Sucursal
          {{ branch?.name }}</small
        >
      </dd>
    </div>
    <div class="review__row">
      <AppIcon name="calendar" :size="18" />
      <dt class="sr-only">Fecha y hora</dt>
      <dd>
        <strong class="review__cap">{{ longDate(draft.date) }}</strong>
        <small>A las {{ draft.time }}</small>
      </dd>
    </div>
    <div class="review__row">
      <AppIcon name="user" :size="18" />
      <dt class="sr-only">Cliente</dt>
      <dd>
        <strong>{{ draft.customer.name }}</strong>
        <small>{{ draft.customer.phone }} · {{ draft.customer.email }}</small>
      </dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
.review {
  display: flex;
  flex-direction: column;
  border-radius: $radius-md;
  border: 1px solid $line;
  background: $surface;

  &__row {
    display: flex;
    gap: 0.75rem;
    padding: 0.8rem 1rem;

    & + & {
      border-top: 1px solid $line;
    }

    > svg {
      color: $aqua-ink;
      margin-top: 2px;
    }
  }

  dd {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: $text-sm;

    small {
      color: $ink-muted;
      font-size: $text-xs;
    }
  }

  &__cap::first-letter {
    text-transform: uppercase;
  }
}
</style>
