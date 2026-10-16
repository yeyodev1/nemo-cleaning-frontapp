<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { addDays, longDate, monthLabel, todayISO } from '@/utils/format'
import { agendaRange, type AgendaView } from '@/composables/admin/useAgenda'

/** Navegación de la agenda: avanza un día, una semana o un mes según la vista. */
const props = withDefaults(defineProps<{ view?: AgendaView }>(), { view: 'day' })
const model = defineModel<string>({ required: true })

const unit = computed(() => ({ day: 'Día', week: 'Semana', month: 'Mes' })[props.view])

function shift(dir: 1 | -1) {
  if (props.view === 'day') model.value = addDays(model.value, dir)
  else if (props.view === 'week') model.value = addDays(model.value, 7 * dir)
  else {
    const y = Number(model.value.slice(0, 4))
    const m = Number(model.value.slice(5, 7))
    const d = new Date(Date.UTC(y, m - 1 + dir, 1))
    model.value = d.toISOString().slice(0, 10)
  }
}

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-EC', { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)).replace(/\./g, '')

const label = computed(() => {
  if (props.view === 'day') return longDate(model.value)
  if (props.view === 'month') return monthLabel(model.value.slice(0, 7))
  const { from, to } = agendaRange('week', model.value)
  const sameMonth = from.slice(0, 7) === to.slice(0, 7)
  return `${fmt(from, sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' })} – ${fmt(to, { day: 'numeric', month: 'short', year: 'numeric' })}`
})

/** "Hoy" solo aparece si hoy no está a la vista. */
const showToday = computed(() => {
  const t = todayISO()
  if (props.view === 'day') return model.value !== t
  if (props.view === 'month') return model.value.slice(0, 7) !== t.slice(0, 7)
  const { from, to } = agendaRange('week', model.value)
  return t < from || t > to
})
</script>

<template>
  <div class="dnav">
    <button type="button" class="btn btn--ghost btn--icon" :aria-label="`${unit} anterior`" @click="shift(-1)">
      <AppIcon name="chevron-left" />
    </button>
    <label class="dnav__date">
      <span class="dnav__label">{{ label }}</span>
      <input v-model="model" type="date" aria-label="Elegir fecha" />
    </label>
    <button type="button" class="btn btn--ghost btn--icon" :aria-label="`${unit} siguiente`" @click="shift(1)">
      <AppIcon name="chevron-right" />
    </button>
    <button v-if="showToday" type="button" class="btn btn--soft btn--sm" @click="model = todayISO()">Hoy</button>
  </div>
</template>

<style scoped lang="scss">
.dnav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  &__date {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    input {
      max-width: 200px;
      min-height: 40px;
      padding-block: 0.35rem;
    }
  }

  &__label {
    font-weight: 800;
    font-size: $text-sm;
    // Puede ocupar dos líneas: truncado, con el botón "Hoy" a 390 px se perdía el año.
    line-height: 1.25;

    &::first-letter {
      text-transform: uppercase;
    }
  }
}
</style>
