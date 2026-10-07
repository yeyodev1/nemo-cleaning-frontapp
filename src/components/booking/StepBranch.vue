<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCatalogStore } from '@/stores/catalog'
import { draft } from '@/composables/booking/useBookingDraft'

const catalog = useCatalogStore()

function pick(id: string) {
  // Cambiar de sucursal invalida el horario elegido.
  if (draft.branch !== id) {
    draft.date = ''
    draft.time = ''
  }
  draft.branch = id
}
</script>

<template>
  <div class="branches" role="radiogroup" aria-label="Sucursal">
    <template v-if="catalog.loading && !catalog.branches.length">
      <span v-for="n in 2" :key="n" class="skeleton branches__ghost"></span>
    </template>
    <button
      v-for="b in catalog.branches"
      :key="b._id"
      type="button"
      role="radio"
      class="branch"
      :class="{ 'is-on': draft.branch === b._id }"
      :aria-checked="draft.branch === b._id"
      @click="pick(b._id)"
    >
      <span class="branch__icon"><AppIcon name="pin" :size="22" /></span>
      <span class="branch__info">
        <strong>{{ b.name }}</strong>
        <small v-if="b.address">{{ b.address }}</small>
        <small v-if="b.openingTime">Horario de reservas: {{ b.openingTime }} a {{ b.closingTime }}</small>
      </span>
      <span class="branch__check" aria-hidden="true"><AppIcon name="check" :size="16" /></span>
    </button>
    <p v-if="catalog.error" class="branches__err" role="alert">
      {{ catalog.error }}
      <button type="button" class="btn btn--ghost btn--sm" @click="catalog.load(true)">
        Reintentar
      </button>
    </p>
  </div>
</template>

<style scoped lang="scss">
.branches {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @include from('md') {
    flex-direction: row;

    > * {
      flex: 1;
    }
  }

  &__ghost {
    height: 104px;
  }

  &__err {
    color: $danger;
    font-weight: 600;
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }
}

.branch {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.1rem;
  min-height: 96px;
  text-align: left;
  border-radius: $radius-md;
  border: 2px solid $line;
  background: $surface;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s $ease;

  &:hover {
    border-color: $line-strong;
  }

  &.is-on {
    border-color: $navy;
    box-shadow: $shadow-md;
  }

  &__icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $orange, $navy);
    color: #fff;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    strong {
      font-size: $text-lg;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__check {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 2px solid $line-strong;
    color: transparent;
  }

  &.is-on &__check {
    background: $navy;
    border-color: $navy;
    color: #fff;
  }
}
</style>
