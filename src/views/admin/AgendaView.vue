<script setup lang="ts">
import { computed, ref } from 'vue'
import DateNav from '@/components/admin/agenda/DateNav.vue'
import AgendaDayGrid from '@/components/admin/agenda/AgendaDayGrid.vue'
import AgendaWeek from '@/components/admin/agenda/AgendaWeek.vue'
import AgendaMonth from '@/components/admin/agenda/AgendaMonth.vue'
import BookingQuickSheet from '@/components/admin/agenda/BookingQuickSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { UNASSIGNED, useAgenda, type AgendaView } from '@/composables/admin/useAgenda'
import { useAgendaShot } from '@/composables/admin/useAgendaShot'
import { useAdminScope } from '@/stores/adminScope'
import { longDate, monthLabel } from '@/utils/format'
import type { Booking } from '@/types/api'

const scope = useAdminScope()
const { date, view, range, loading, error, load, operatorFilter, team, bookings, cancelled, byDate, columns, replace, openDay } = useAgenda()
const selected = ref<Booking | null>(null)
const shotEl = ref<HTMLElement | null>(null)
const shot = useAgendaShot(shotEl)

const VIEWS: { value: AgendaView; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
]

function onUpdated(b: Booking) {
  replace(b)
  selected.value = null
}

function toggleOperator(id: string) {
  const list = operatorFilter.value
  operatorFilter.value = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-EC', { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)).replace(/\./g, '')

/** Título que sale en la imagen: período, sucursal y filtro. */
const period = computed(() => {
  if (view.value === 'day') return longDate(date.value)
  if (view.value === 'month') return monthLabel(date.value.slice(0, 7))
  return `Semana del ${fmt(range.value.from, { day: 'numeric', month: 'short' })} al ${fmt(range.value.to, { day: 'numeric', month: 'short', year: 'numeric' })}`
})
const branchLabel = computed(() => (scope.branch ? scope.branchName(scope.branch) : 'Todas las sucursales'))
const filterLabel = computed(() =>
  operatorFilter.value.length
    ? operatorFilter.value.map((id) => (id === UNASSIGNED ? 'Sin asignar' : team.value.find((o) => o._id === id)?.name || '')).join(', ')
    : '',
)

function download() {
  const name = `agenda-${view.value === 'day' ? date.value : view.value === 'week' ? `semana-${range.value.from}` : date.value.slice(0, 7)}.png`
  shot.capture(name)
}
</script>

<template>
  <div class="agenda">
    <div class="agenda__bar">
      <DateNav v-model="date" :view="view" />
      <div class="agenda__actions">
        <div class="agenda__views" role="tablist" aria-label="Vista de la agenda">
          <button
            v-for="v in VIEWS"
            :key="v.value"
            type="button"
            role="tab"
            class="agenda__view"
            :class="{ 'is-on': view === v.value }"
            :aria-selected="view === v.value"
            @click="view = v.value"
          >
            {{ v.label }}
          </button>
        </div>
        <button type="button" class="btn btn--ghost btn--sm" :disabled="shot.busy.value || loading" @click="download">
          <AppIcon name="image" :size="16" /> {{ shot.busy.value ? 'Creando imagen…' : 'Descargar imagen' }}
        </button>
        <RouterLink to="/admin/pedidos/nuevo" class="btn btn--primary btn--sm"><AppIcon name="plus" :size="16" /> Agendar</RouterLink>
      </div>
    </div>

    <div v-if="team.length" class="agenda__filters" aria-label="Filtrar por operador">
      <span class="agenda__filters-label">Equipo:</span>
      <button type="button" class="agenda__chip" :class="{ 'is-on': !operatorFilter.length }" @click="operatorFilter = []">Todos</button>
      <button
        v-for="o in team"
        :key="o._id"
        type="button"
        class="agenda__chip"
        :class="{ 'is-on': operatorFilter.includes(o._id) }"
        :style="{ '--op': o.color || '#1E2D3A' }"
        :aria-pressed="operatorFilter.includes(o._id)"
        @click="toggleOperator(o._id)"
      >
        <span class="agenda__dot"></span>{{ o.name }}
      </button>
      <button
        type="button"
        class="agenda__chip"
        :class="{ 'is-on': operatorFilter.includes(UNASSIGNED) }"
        :aria-pressed="operatorFilter.includes(UNASSIGNED)"
        @click="toggleOperator(UNASSIGNED)"
      >
        Sin asignar
      </button>
    </div>

    <p v-if="!scope.branch && scope.canSeeAll" class="agenda__hint"><AppIcon name="info" :size="16" /> Viendo todas las sucursales. Elige una arriba para ver solo su agenda.</p>

    <div v-if="error" class="card agenda__error" role="alert">
      <AppIcon name="alert" /> <span>{{ error }}</span>
      <button type="button" class="btn btn--ghost btn--sm" @click="load">Reintentar</button>
    </div>

    <div v-else-if="loading && !bookings.length && !team.length" class="agenda__list">
      <span v-for="n in 3" :key="n" class="skeleton" style="height: 96px"></span>
    </div>

    <!-- Todo lo de este bloque sale en la imagen descargada. -->
    <div v-else ref="shotEl" class="agenda__shot" :class="{ 'is-loading': loading }">
      <header class="agenda__title">
        <div>
          <strong>Agenda Nemo Cleaning · {{ period }}</strong>
          <small>{{ branchLabel }}<template v-if="filterLabel"> · {{ filterLabel }}</template> · {{ bookings.length }} servicio{{ bookings.length === 1 ? '' : 's' }}</small>
        </div>
      </header>

      <template v-if="view === 'day'">
        <AgendaDayGrid v-if="columns.length" :date="date" :columns="columns" @open="selected = $event" />
        <div v-else class="card empty">
          <AppIcon name="calendar" :size="28" style="margin: 0 auto 0.5rem" />
          No hay servicios agendados para este día.
        </div>
      </template>
      <AgendaWeek v-else-if="view === 'week'" :from="range.from" :by-date="byDate" @open="selected = $event" @day="openDay" />
      <AgendaMonth v-else :from="range.from" :month="date.slice(0, 7)" :by-date="byDate" @open="selected = $event" @day="openDay" />
    </div>

    <p v-if="cancelled.length" class="agenda__cancelled">{{ cancelled.length }} cancelado{{ cancelled.length === 1 ? '' : 's' }} {{ view === 'day' ? 'este día' : view === 'week' ? 'esta semana' : 'en estas fechas' }}.</p>

    <BookingQuickSheet :booking="selected" @close="selected = null" @updated="onUpdated" />
  </div>
</template>

<style scoped lang="scss">
.agenda {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__bar {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;

    > :first-child {
      flex: 1 1 280px;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  &__views {
    display: inline-flex;
    padding: 3px;
    border-radius: $radius-pill;
    background: $navy-soft;
  }

  &__view {
    min-height: 36px;
    padding: 0 1rem;
    border-radius: $radius-pill;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;

    &.is-on {
      background: $navy;
      color: #fff;
      box-shadow: $shadow-sm;
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
  }

  &__filters-label {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
    text-transform: uppercase;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 36px;
    padding: 0 0.8rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;

    &.is-on {
      border-color: $navy;
      background: $navy-soft;
      color: $navy;
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--op);
  }

  &__hint {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: $danger;
    flex-wrap: wrap;

    span {
      flex: 1;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__shot {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: $paper;
    transition: opacity 0.2s;

    &.is-loading {
      opacity: 0.6;
    }

    // Durante la captura: sin scroll interno, para que salgan todas las columnas.
    &.is-capturing {
      width: max-content;
      min-width: 100%;
      padding: 1rem;
      background: #fff;

      :deep(.dg) {
        overflow: visible;
      }
    }
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    div {
      display: flex;
      flex-direction: column;
    }

    strong {
      font-size: $text-base;
      color: $navy;

      &::first-letter {
        text-transform: uppercase;
      }
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__cancelled {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
