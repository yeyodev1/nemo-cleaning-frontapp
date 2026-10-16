<script setup lang="ts">
import { computed } from 'vue'
import { todayISO } from '@/utils/format'
import { itemLabel } from '@/utils/pricing'
import type { Booking } from '@/types/api'

/**
 * Día en calendario: horas a la izquierda y una columna por persona del equipo.
 * Cada servicio es un bloque a su hora, alto según su duración.
 */
interface Column {
  id: string
  name: string
  color: string
  items: Booking[]
}
const props = defineProps<{ date: string; columns: Column[] }>()
defineEmits<{ open: [b: Booking] }>()

const HOUR_PX = 64
const MIN_BLOCK_MIN = 45

const toMin = (t: string) => {
  const [h = 0, m = 0] = t.split(':').map(Number)
  return h * 60 + m
}
const fmtHour = (h: number) => `${String(h).padStart(2, '0')}:00`

const all = computed(() => props.columns.flatMap((c) => c.items))
const startHour = computed(() => Math.min(7, ...all.value.map((b) => Math.floor(toMin(b.time) / 60))))
const endHour = computed(() =>
  Math.max(19, ...all.value.map((b) => Math.ceil((toMin(b.time) + Math.max(b.durationMinutes || 60, MIN_BLOCK_MIN)) / 60))),
)
const hours = computed(() => Array.from({ length: endHour.value - startHour.value }, (_, i) => startHour.value + i))

/** Bloques con posición; si dos se cruzan en la misma columna, se reparten el ancho. */
function layout(items: Booking[]) {
  const sorted = [...items].sort((a, b) => toMin(a.time) - toMin(b.time))
  const laneEnds: number[] = []
  const placed = sorted.map((b) => {
    const start = toMin(b.time)
    const end = start + Math.max(b.durationMinutes || 60, MIN_BLOCK_MIN)
    let lane = laneEnds.findIndex((e) => e <= start)
    if (lane === -1) lane = laneEnds.push(end) - 1
    else laneEnds[lane] = end
    return { b, start, end, lane }
  })
  const lanes = Math.max(1, laneEnds.length)
  return placed.map((p) => ({
    ...p,
    style: {
      top: `${((p.start - startHour.value * 60) / 60) * HOUR_PX}px`,
      height: `${((p.end - p.start) / 60) * HOUR_PX - 4}px`,
      left: `calc(${(p.lane / lanes) * 100}% + 3px)`,
      width: `calc(${100 / lanes}% - 6px)`,
    },
  }))
}

const cols = computed(() => props.columns.map((c) => ({ ...c, blocks: layout(c.items) })))
const bodyHeight = computed(() => `${hours.value.length * HOUR_PX}px`)

/** Línea de "ahora" solo si es hoy y cae dentro del horario visible. */
const nowTop = computed(() => {
  if (props.date !== todayISO()) return null
  const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Guayaquil', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  const min = toMin(t) - startHour.value * 60
  if (min < 0 || min > hours.value.length * 60) return null
  return `${(min / 60) * HOUR_PX}px`
})
</script>

<template>
  <div class="dg" :style="{ '--cols': cols.length }">
    <div class="dg__inner">
      <div class="dg__head">
        <span class="dg__corner">Hora</span>
        <span v-for="c in cols" :key="c.id" class="dg__colhead" :style="{ '--op': c.color }">
          <span class="dg__dot"></span>
          <span class="dg__name">{{ c.name }}</span>
          <small>{{ c.items.length ? `${c.items.length} serv.` : 'Libre' }}</small>
        </span>
      </div>
      <div class="dg__body" :style="{ height: bodyHeight }">
        <div class="dg__gutter">
          <span v-for="h in hours" :key="h" class="dg__hour">{{ fmtHour(h) }}</span>
        </div>
        <div v-for="c in cols" :key="c.id" class="dg__col">
          <span v-for="h in hours" :key="h" class="dg__slot"></span>
          <button
            v-for="p in c.blocks"
            :key="p.b._id"
            type="button"
            class="dg__block"
            :class="`is-${p.b.status}`"
            :style="{ ...p.style, '--op': p.b.operators[0]?.color || c.color }"
            @click="$emit('open', p.b)"
          >
            <strong>{{ p.b.time }} · {{ p.b.customer?.name }}</strong>
            <span>{{ p.b.items.map(itemLabel).join(', ') }}</span>
            <small v-if="p.b.zone || p.b.address">{{ p.b.zone || p.b.address }}</small>
          </button>
        </div>
        <span v-if="nowTop" class="dg__now" :style="{ top: nowTop }"><span>Ahora</span></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$hour: 64px;
$gutter: 56px;

.dg {
  overflow-x: auto;
  border: 1px solid $line;
  border-radius: $radius-md;
  background: $surface;

  &__inner {
    min-width: calc(#{$gutter} + var(--cols) * 170px);
  }

  &__head {
    position: sticky;
    top: 0;
    z-index: 3;
    display: grid;
    grid-template-columns: $gutter repeat(var(--cols), minmax(170px, 1fr));
    background: $navy;
    color: #fff;
  }

  &__corner {
    position: sticky;
    left: 0;
    z-index: 1;
    display: grid;
    place-items: center;
    background: $navy;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    opacity: 0.8;
  }

  &__colhead {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.6rem;
    border-left: 1px solid rgb(255 255 255 / 0.15);
    min-width: 0;

    small {
      margin-left: auto;
      font-size: 0.7rem;
      opacity: 0.8;
      white-space: nowrap;
    }
  }

  &__dot {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--op);
    box-shadow: 0 0 0 2px #fff;
  }

  &__name {
    font-size: $text-sm;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__body {
    position: relative;
    display: grid;
    grid-template-columns: $gutter repeat(var(--cols), minmax(170px, 1fr));
  }

  &__gutter {
    position: sticky;
    left: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    background: $paper;
    border-right: 1px solid $line;
  }

  &__hour {
    height: $hour;
    flex-shrink: 0;
    padding: 0.2rem 0.35rem 0;
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-soft;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  &__col {
    position: relative;
    display: flex;
    flex-direction: column;
    border-left: 1px solid $line;
  }

  &__slot {
    height: $hour;
    flex-shrink: 0;
    border-bottom: 1px solid $line;
    background: linear-gradient(to bottom, transparent 49.5%, rgb(0 0 0 / 0.04) 50%, transparent 50.5%);
  }

  &__block {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.35rem 0.45rem;
    overflow: hidden;
    border-radius: 8px;
    border-left: 4px solid var(--op);
    background: color-mix(in srgb, var(--op) 14%, #fff);
    box-shadow: $shadow-sm;
    text-align: left;
    line-height: 1.25;

    &:hover {
      box-shadow: $shadow-md;
      z-index: 1;
    }

    strong {
      font-size: $text-xs;
      color: $ink;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span,
    small {
      font-size: 0.72rem;
      color: $ink-soft;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.is-completed {
      opacity: 0.7;

      strong::after {
        content: ' ✓';
        color: $success;
      }
    }

    &.is-pending {
      border-style: dashed;
      border-left-style: solid;
      border-width: 1px 1px 1px 4px;
      border-color: var(--op);
    }
  }

  &__now {
    position: absolute;
    left: $gutter;
    right: 0;
    height: 2px;
    background: $danger;
    z-index: 2;
    pointer-events: none;

    span {
      position: absolute;
      left: 4px;
      top: -9px;
      padding: 0 0.3rem;
      border-radius: 4px;
      background: $danger;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
    }
  }
}
</style>
