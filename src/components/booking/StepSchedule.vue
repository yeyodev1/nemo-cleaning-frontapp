<script setup lang="ts">
import { computed, toRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCatalogStore } from '@/stores/catalog'
import { draft } from '@/composables/booking/useBookingDraft'
import { useAvailability } from '@/composables/booking/useAvailability'
import { longDate, todayISO, addDays } from '@/utils/format'

const catalog = useCatalogStore()
const branch = computed(() => catalog.branchById(draft.branch))
const { dates, slots, loading, error, reload } = useAvailability(branch, toRef(draft, 'date'))

const fmtDay = new Intl.DateTimeFormat('es-EC', { weekday: 'short', timeZone: 'UTC' })
const fmtMonth = new Intl.DateTimeFormat('es-EC', { month: 'short', timeZone: 'UTC' })
function parts(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`)
  return {
    wd: fmtDay.format(d).replace('.', ''),
    day: d.getUTCDate(),
    month: fmtMonth.format(d).replace('.', ''),
  }
}
const today = todayISO()
const tomorrow = addDays(today, 1)

function pickDate(d: string) {
  if (draft.date !== d) draft.time = ''
  draft.date = d
}
const freeCount = computed(() => slots.value.filter((s) => s.available).length)
</script>

<template>
  <div class="sched">
    <div class="sched__strip" role="radiogroup" aria-label="Día">
      <button
        v-for="d in dates"
        :key="d"
        type="button"
        role="radio"
        class="day"
        :class="{ 'is-on': draft.date === d }"
        :aria-checked="draft.date === d"
        :aria-label="longDate(d)"
        @click="pickDate(d)"
      >
        <span class="day__wd">{{
          d === today ? 'Hoy' : d === tomorrow ? 'Mañana' : parts(d).wd
        }}</span>
        <strong class="day__num">{{ parts(d).day }}</strong>
        <span class="day__mo">{{ parts(d).month }}</span>
      </button>
    </div>

    <section v-if="draft.date" class="sched__slots" aria-live="polite">
      <h3 class="sched__label">
        <AppIcon name="clock" :size="18" /> Horarios para el {{ longDate(draft.date) }}
      </h3>
      <div v-if="loading" class="slots">
        <span v-for="n in 8" :key="n" class="skeleton slots__ghost"></span>
      </div>
      <p v-else-if="error" class="sched__msg sched__msg--err" role="alert">
        {{ error }}
        <button type="button" class="btn btn--ghost btn--sm" @click="reload">Reintentar</button>
      </p>
      <p v-else-if="!freeCount" class="sched__msg">
        Este día ya no tiene horarios libres. Prueba con otro día.
      </p>
      <div v-else class="slots" role="radiogroup" aria-label="Hora">
        <button
          v-for="s in slots"
          :key="s.time"
          type="button"
          role="radio"
          class="slot"
          :class="{ 'is-on': draft.time === s.time }"
          :disabled="!s.available"
          :aria-checked="draft.time === s.time"
          @click="draft.time = s.time"
        >
          {{ s.time }}
        </button>
      </div>
    </section>
    <p v-else class="sched__msg">Elige un día para ver las horas disponibles.</p>
  </div>
</template>

<style scoped lang="scss">
.sched {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__strip {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 4px 2px 10px;
    margin-inline: -1rem;
    padding-inline: 1rem;
    scroll-snap-type: x proximity;
    scrollbar-width: thin;

    @include from('md') {
      margin-inline: 0;
      padding-inline: 2px;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: $text-sm;
    margin-bottom: 0.75rem;
    color: $navy;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  &__msg {
    padding: 1rem;
    border-radius: $radius-md;
    background: $sky;
    color: $ink-soft;
    font-size: $text-sm;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;

    &--err {
      background: $danger-bg;
      color: $danger;
    }
  }
}

.day {
  flex-shrink: 0;
  scroll-snap-align: start;
  width: 64px;
  min-height: 80px;
  border-radius: $radius-md;
  border: 1.5px solid $line;
  background: $surface;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: all 0.2s $ease;

  &__wd,
  &__mo {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: capitalize;
    color: $ink-muted;
  }

  &__num {
    font-size: 1.35rem;
    line-height: 1.1;
  }

  &.is-on {
    background: $navy;
    border-color: $navy;
    color: #fff;
    box-shadow: $shadow-navy;

    .day__wd,
    .day__mo {
      color: rgba(#fff, 0.8);
    }
  }
}

.slots {
  @include flex-cards(84px, 0.5rem);

  > * {
    flex-grow: 0;
  }

  &__ghost {
    height: $tap;
    width: 84px;
  }
}

.slot {
  min-height: $tap;
  min-width: 84px;
  border-radius: $radius-sm;
  border: 1.5px solid $line;
  background: $surface;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: all 0.2s $ease;

  &:hover:not(:disabled) {
    border-color: $navy;
  }

  &:disabled {
    background: $sky;
    color: $ink-muted;
    text-decoration: line-through;
    opacity: 0.7;
  }

  &.is-on {
    background: $orange;
    border-color: $orange;
    color: $navy-ink;
  }
}
</style>
