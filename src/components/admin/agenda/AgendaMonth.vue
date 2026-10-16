<script setup lang="ts">
import { computed } from 'vue'
import { addDays, todayISO } from '@/utils/format'
import type { Booking } from '@/types/api'

/** Calendario del mes (6 semanas, lunes a domingo). Tocar un día abre su agenda. */
const props = defineProps<{ from: string; month: string; byDate: Map<string, Booking[]> }>()
defineEmits<{ day: [iso: string]; open: [b: Booking] }>()

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_CHIPS = 3
const today = todayISO()

const cells = computed(() =>
  Array.from({ length: 42 }, (_, i) => {
    const iso = addDays(props.from, i)
    const items = props.byDate.get(iso) || []
    return { iso, num: Number(iso.slice(8)), inMonth: iso.slice(0, 7) === props.month, items, more: Math.max(0, items.length - MAX_CHIPS) }
  }),
)
const total = computed(() => cells.value.filter((c) => c.inMonth).reduce((s, c) => s + c.items.length, 0))
</script>

<template>
  <div class="month">
    <p class="month__total">{{ total }} servicio{{ total === 1 ? '' : 's' }} este mes</p>
    <div class="month__grid" role="grid">
      <span v-for="w in WEEKDAYS" :key="w" class="month__wd" role="columnheader">{{ w }}</span>
      <div
        v-for="c in cells"
        :key="c.iso"
        class="month__cell"
        :class="{ 'is-out': !c.inMonth, 'is-today': c.iso === today, 'has-items': c.items.length }"
        role="gridcell"
      >
        <button type="button" class="month__day" :aria-label="`Ver el día ${c.iso}: ${c.items.length} servicio(s)`" @click="$emit('day', c.iso)">
          <span class="month__num">{{ c.num }}</span>
          <span v-if="c.items.length" class="month__count">{{ c.items.length }}</span>
        </button>
        <div class="month__chips">
          <button
            v-for="b in c.items.slice(0, MAX_CHIPS)"
            :key="b._id"
            type="button"
            class="month__chip"
            :style="{ '--op': b.operators[0]?.color || '#C8CDD4' }"
            :title="`${b.time} · ${b.customer?.name || ''}`"
            @click="$emit('open', b)"
          >
            <strong>{{ b.time }}</strong> {{ b.customer?.name }}
          </button>
          <button v-if="c.more" type="button" class="month__more" @click="$emit('day', c.iso)">+{{ c.more }} más</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.month {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__total {
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-muted;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    border: 1px solid $line;
    border-radius: $radius-md;
    overflow: hidden;
    background: $line;
    gap: 1px;
  }

  &__wd {
    padding: 0.45rem 0.25rem;
    background: $navy;
    color: #fff;
    font-size: $text-xs;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
  }

  &__cell {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-height: 64px;
    padding: 0.25rem;
    background: $surface;
    min-width: 0;

    @include from('lg') {
      min-height: 118px;
      padding: 0.35rem;
    }

    &.is-out {
      background: $paper;

      .month__num {
        color: $ink-muted;
        font-weight: 500;
      }
    }

    &.is-today {
      box-shadow: inset 0 0 0 2px $orange;
    }
  }

  &__day {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
    width: 100%;
    min-height: 32px;
    padding: 0 0.2rem;
    border-radius: $radius-sm;

    &:hover {
      background: $navy-soft;
    }
  }

  &__num {
    font-size: $text-sm;
    font-weight: 800;
    color: $navy;

    .is-today & {
      color: $orange-ink;
    }
  }

  &__count {
    min-width: 1.35rem;
    padding: 0 0.35rem;
    border-radius: $radius-pill;
    background: $navy;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    text-align: center;
  }

  // En celular solo número + contador; los nombres desde escritorio.
  &__chips {
    display: none;
    flex-direction: column;
    gap: 0.15rem;

    @include from('lg') {
      display: flex;
    }
  }

  &__chip {
    display: block;
    width: 100%;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    border-left: 3px solid var(--op);
    background: $sky;
    font-size: 0.72rem;
    text-align: left;
    color: $ink;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    strong {
      color: $navy;
      font-variant-numeric: tabular-nums;
    }

    &:hover {
      background: $navy-soft;
    }
  }

  &__more {
    font-size: 0.72rem;
    font-weight: 700;
    color: $navy;
    text-align: left;
    padding: 0 0.35rem;
  }
}
</style>
