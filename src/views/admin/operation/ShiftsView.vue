<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import WeeklyOffSheet from '@/components/admin/operation/WeeklyOffSheet.vue'
import { useShifts } from '@/composables/operation/useShifts'
import { shiftLabel } from '@/config/operationLabels'
import { todayISO } from '@/utils/format'

const s = useShifts()
const today = todayISO()
const quickOpen = ref(false)
const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
// Nombre corto para la columna: la menor cantidad de palabras que no se repite ("Jose", "Jose Luis").
const shortName = computed(() => {
  const ops = s.data.value?.operators || []
  const out: Record<string, string> = {}
  for (const o of ops) {
    const words = o.name.split(/\s+/)
    let n = 1
    while (n < words.length && ops.some((x) => x._id !== o._id && x.name.split(/\s+/).slice(0, n).join(' ') === words.slice(0, n).join(' '))) n++
    out[o._id] = words.slice(0, n).join(' ')
  }
  return out
})
// Si se sale de la pantalla con cambios en cola, se guardan igual.
onBeforeUnmount(() => s.flush())

function onWeekly(op: string, weekday: number) {
  s.weeklyOff(op, weekday)
  quickOpen.value = false
}
function onReset(op: string) {
  s.allActive(op)
  quickOpen.value = false
}
</script>

<template>
  <section>
    <PageIntro text="Quién trabaja cada día, como la hoja Calendario. Toca una casilla para cambiarla: Activo → Libre → Medio día. La web solo ofrece horarios con operadores activos (medio día = solo turnos antes de las 13:00).">
      <button type="button" class="btn btn--ghost" :disabled="!s.data.value?.operators.length" @click="quickOpen = true"><AppIcon name="calendar" /> Día libre fijo</button>
    </PageIntro>

    <div class="top">
      <MonthNav v-model="s.month.value" />
      <ul class="legend" aria-label="Leyenda">
        <li v-for="(l, k) in shiftLabel" :key="k"><span class="cell" :class="`cell--${k}`">{{ l.short }}</span> {{ l.label }}</li>
        <li class="legend__save" :class="{ 'is-on': s.saving.value }" aria-live="polite">{{ s.saving.value ? 'Guardando…' : 'Cambios guardados' }}</li>
      </ul>
    </div>

    <div v-if="s.loading.value && !s.data.value" class="skeleton" style="height: 420px"></div>
    <EmptyState v-else-if="!s.data.value?.operators.length" title="No hay operadores activos" text="Agrega a los lavadores en Personal (no necesitan correo) y aquí aparecerá su calendario." icon="users">
      <RouterLink to="/admin/personal" class="btn btn--primary">Ir a Personal</RouterLink>
    </EmptyState>
    <div v-else-if="s.data.value" class="grid" tabindex="0" role="region" aria-label="Calendario de turnos">
      <table>
        <thead>
          <tr>
            <th scope="col">Día</th>
            <th v-for="o in s.data.value.operators" :key="o._id" scope="col">
              <span class="op"><span class="op__dot" :style="{ background: o.color || '#12263F' }"></span>{{ shortName[o._id] }}</span>
            </th>
            <th scope="col" class="num">Activos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in s.data.value.days" :key="d.date" :class="{ 'is-today': d.date === today, 'is-sun': d.weekday === 0 }">
            <th scope="row">{{ weekdays[d.weekday] }} {{ d.date.slice(8) }}</th>
            <td v-for="o in s.data.value.operators" :key="o._id">
              <button
                type="button"
                class="cell"
                :class="`cell--${s.statusOf(o._id, d.date)}`"
                :aria-label="`${o.name}, ${d.date}: ${shiftLabel[s.statusOf(o._id, d.date)].label}. Tocar para cambiar`"
                @click="s.cycle(o._id, d.date)"
              >
                {{ shiftLabel[s.statusOf(o._id, d.date)].short }}
              </button>
            </td>
            <td class="num count">
              {{ s.activeByDay.value[d.date]?.active }}<small v-if="s.activeByDay.value[d.date]?.half"> +{{ s.activeByDay.value[d.date]?.half }}½</small>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <WeeklyOffSheet :open="quickOpen" :operators="s.data.value?.operators || []" @close="quickOpen = false" @weekly="onWeekly" @reset="onReset" />
  </section>
</template>

<style scoped lang="scss">
.top {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;

  > :first-child {
    max-width: 360px;
    flex: 1 1 320px;
  }

  @include from('md') {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  font-size: $text-xs;
  color: $ink-soft;

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .cell {
    width: 26px;
    height: 26px;
    min-height: 0;
    cursor: default;
  }

  &__save {
    color: $success;
    transition: color $dur-fast ease;

    &.is-on {
      color: $ink-muted;
    }
  }
}

.grid {
  @include card(0);
  overflow: auto;
  max-height: 70vh;
  overscroll-behavior: contain;

  table {
    border-collapse: separate;
    border-spacing: 0;
    font-size: $text-sm;
    min-width: 100%;
  }

  th,
  td {
    padding: 0.3rem;
    border-bottom: 1px solid $line;
    text-align: center;
    background: $surface;
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: $navy;
    color: #fff;
    font-size: $text-xs;
    padding: 0.55rem 0.4rem;
    white-space: nowrap;
  }

  tbody th {
    position: sticky;
    left: 0;
    z-index: 1;
    text-align: left;
    white-space: nowrap;
    padding-left: 0.75rem;
    font-weight: 600;
    box-shadow: 1px 0 0 $line;
  }

  thead th:first-child {
    left: 0;
    z-index: 3;
  }

  tr.is-sun th,
  tr.is-sun td {
    background: $sky;
  }

  tr.is-today th {
    color: $orange-ink;
    font-weight: 800;
  }

  .num {
    text-align: right;
    padding-right: 0.75rem;
  }

  .count {
    font-weight: 700;

    small {
      color: $warning;
      font-weight: 600;
    }
  }
}

.op {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 0 1.5px #fff;
  }
}

.cell {
  width: 44px;
  height: 40px;
  border-radius: $radius-sm;
  font-weight: 800;
  font-size: $text-sm;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color $dur-fast ease,
    color $dur-fast ease,
    transform $dur-fast $ease-out;

  &:active {
    transform: scale(0.92);
  }

  &--active {
    background: $success-bg;
    color: $success;
  }

  &--off {
    background: $line;
    color: $ink-muted;
  }

  &--half {
    background: $warning-bg;
    color: $warning;
  }
}
</style>
