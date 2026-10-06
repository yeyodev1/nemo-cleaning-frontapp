<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { bookingStatus, options, paymentStatus } from '@/config/labels'
import type { BookingFilters } from '@/services/bookings.service'

const filters = defineModel<BookingFilters>({ required: true })
const open = ref(false)
const statuses = options(bookingStatus)
const payments = options(paymentStatus)

function clear() {
  Object.assign(filters.value, { status: '', paymentStatus: '', from: '', to: '', q: '' })
}
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <label class="filters__search">
        <AppIcon name="search" :size="18" />
        <span class="sr-only">Buscar</span>
        <input v-model="filters.q" type="search" placeholder="Código, cliente, teléfono…" />
      </label>
      <button type="button" class="btn btn--ghost btn--icon filters__toggle" :aria-expanded="open" aria-label="Más filtros" @click="open = !open">
        <AppIcon name="filter" />
      </button>
    </div>
    <div class="filters__more" :class="{ 'is-open': open }">
      <label class="field">
        <span class="field__label">Estado</span>
        <select v-model="filters.status">
          <option value="">Todos</option>
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Pago</span>
        <select v-model="filters.paymentStatus">
          <option value="">Todos</option>
          <option v-for="s in payments" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Desde</span>
        <input v-model="filters.from" type="date" />
      </label>
      <label class="field">
        <span class="field__label">Hasta</span>
        <input v-model="filters.to" type="date" :min="filters.from" />
      </label>
      <button type="button" class="btn btn--soft btn--sm filters__clear" @click="clear">Limpiar</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__row {
    display: flex;
    gap: 0.5rem;
  }

  &__search {
    flex: 1;
    position: relative;
    display: block;

    svg {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: $ink-muted;
    }

    input {
      padding-left: 2.5rem;
    }
  }

  &__toggle {
    @include from('lg') {
      display: none;
    }
  }

  &__more {
    display: none;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;

    &.is-open {
      display: flex;
    }

    @include from('lg') {
      display: flex;
    }

    .field {
      flex: 1 1 150px;
    }
  }

  &__clear {
    min-height: $tap;
  }
}
</style>
