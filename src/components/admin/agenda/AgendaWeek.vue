<script setup lang="ts">
import { computed } from 'vue'
import { addDays, todayISO } from '@/utils/format'
import { itemLabel } from '@/utils/pricing'
import { bookingStatus } from '@/config/labels'
import type { Booking } from '@/types/api'

/** Semana de lunes a domingo: una columna por día con sus servicios en orden de hora. */
const props = defineProps<{ from: string; byDate: Map<string, Booking[]> }>()
defineEmits<{ open: [b: Booking]; day: [iso: string] }>()

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-EC', { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)).replace(/\./g, '')

const today = todayISO()
const days = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(props.from, i)
    return { iso, weekday: fmt(iso, { weekday: 'short' }), num: fmt(iso, { day: 'numeric' }), items: props.byDate.get(iso) || [] }
  }),
)
</script>

<template>
  <div class="week">
    <section v-for="d in days" :key="d.iso" class="week__day" :class="{ 'is-today': d.iso === today, 'is-past': d.iso < today }">
      <button type="button" class="week__head" :aria-label="`Ver el día ${d.weekday} ${d.num}`" @click="$emit('day', d.iso)">
        <span class="week__wd">{{ d.weekday }}</span>
        <span class="week__num">{{ d.num }}</span>
        <span v-if="d.items.length" class="week__count">{{ d.items.length }}</span>
      </button>
      <div class="week__list">
        <button
          v-for="b in d.items"
          :key="b._id"
          type="button"
          class="week__item"
          :class="`is-${bookingStatus[b.status].tone}`"
          :style="{ '--op': b.operators[0]?.color || '#C8CDD4' }"
          @click="$emit('open', b)"
        >
          <strong>{{ b.time }}</strong>
          <span class="week__name">{{ b.customer?.name }}</span>
          <small>{{ b.items.map(itemLabel).join(', ') }}</small>
          <small v-if="b.operators.length" class="week__ops">{{ b.operators.map((o) => o.name).join(', ') }}</small>
          <small v-else class="week__ops week__ops--none">Sin asignar</small>
        </button>
        <p v-if="!d.items.length" class="week__free">Libre</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.week {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @include from('lg') {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.5rem;
  }

  &__day {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.6rem;
    border: 1px solid $line;
    border-radius: $radius-md;
    background: $sky;
    min-width: 0;

    @include from('lg') {
      min-height: 420px;
    }

    &.is-today {
      border-color: $orange;
      box-shadow: 0 0 0 1px $orange;
    }

    &.is-past {
      opacity: 0.75;
    }
  }

  &__head {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    min-height: $tap;
    padding: 0 0.25rem;
    border-radius: $radius-sm;
    text-align: left;

    &:hover {
      background: $navy-soft;
    }
  }

  &__wd {
    font-size: $text-xs;
    font-weight: 700;
    text-transform: uppercase;
    color: $ink-muted;
  }

  &__num {
    font-size: $text-lg;
    font-weight: 800;
    color: $navy;

    .is-today & {
      color: $orange-ink;
    }
  }

  &__count {
    margin-left: auto;
    min-width: 1.5rem;
    padding: 0 0.4rem;
    border-radius: $radius-pill;
    background: $navy;
    color: #fff;
    font-size: $text-xs;
    font-weight: 700;
    text-align: center;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.45rem 0.55rem;
    border-radius: $radius-sm;
    border: 1px solid $line;
    border-left: 4px solid var(--op);
    background: $surface;
    text-align: left;
    min-width: 0;
    box-shadow: $shadow-sm;

    &:hover {
      box-shadow: $shadow-md;
    }

    strong {
      font-size: $text-xs;
      color: $navy;
      font-variant-numeric: tabular-nums;
    }

    small {
      font-size: $text-xs;
      color: $ink-soft;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.is-success {
      background: $success-bg;
    }
  }

  &__name {
    font-size: $text-sm;
    font-weight: 700;
    color: $ink;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__ops--none {
    color: $danger !important;
    font-weight: 700;
  }

  &__free {
    font-size: $text-xs;
    color: $ink-muted;
    text-align: center;
    padding: 0.5rem 0;
  }
}
</style>
