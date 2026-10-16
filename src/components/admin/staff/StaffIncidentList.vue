<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { staffIncidentLabel } from '@/config/operationLabels'
import { dateTime, longDate } from '@/utils/format'
import type { StaffIncident } from '@/types/operation'

/** Historial de novedades del personal. `showPerson` = muestra a quién (lista general). */
defineProps<{ items: StaffIncident[]; showPerson?: boolean; canDelete?: (i: StaffIncident) => boolean }>()
defineEmits<{ remove: [item: StaffIncident] }>()
</script>

<template>
  <ul class="sil">
    <li v-for="i in items" :key="i._id" class="sil__item" :class="`is-${staffIncidentLabel[i.type].tone}`">
      <span class="sil__icon"><AppIcon :name="staffIncidentLabel[i.type].icon" :size="20" /></span>
      <div class="sil__body">
        <p class="sil__title">
          <RouterLink v-if="showPerson" :to="`/admin/personal/${i.user._id}`" class="sil__person">{{ i.user.name }}</RouterLink>
          <strong>{{ staffIncidentLabel[i.type].label }}</strong>
        </p>
        <p v-if="i.text" class="sil__text">{{ i.text }}</p>
        <small><span class="sil__date">{{ longDate(i.date) }}</span> · registró {{ i.by?.name || '—' }} · {{ dateTime(i.createdAt) }}</small>
      </div>
      <button v-if="canDelete?.(i)" type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar novedad" @click="$emit('remove', i)">
        <AppIcon name="trash" :size="16" />
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.sil {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 0.8rem 0.6rem 0.8rem 0.8rem;
    border-radius: $radius-md;
    border: 1px solid $line;
    background: $surface;
    border-left: 4px solid $navy;

    &.is-warning {
      border-left-color: $warning;
    }

    &.is-danger {
      border-left-color: $danger;
    }
  }

  &__icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: $navy-soft;
    color: $navy;

    .is-warning & {
      background: $warning-bg;
      color: $warning;
    }

    .is-danger & {
      background: $danger-bg;
      color: $danger;
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__title {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: baseline;
  }

  &__person {
    font-weight: 800;
    color: $navy;
  }

  &__text {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__date::first-letter {
    text-transform: uppercase;
  }
}
</style>
