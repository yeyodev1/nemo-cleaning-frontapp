<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import MoneyCell from '@/components/admin/grid/MoneyCell.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { MONTHS_SHORT } from '@/composables/admin/useMonthGrid'
import { money } from '@/utils/format'
import type { CellStatus, GridRow } from '@/types/grid'

/**
 * Hoja anual como la del Excel: filas = colaborador, columnas = ENE…DIC, totales por fila
 * y por mes que se recalculan al escribir. En celular: chips de mes + lista con un campo
 * por persona (mismo guardado y mismo Enter → siguiente).
 */
const props = defineProps<{
  rows: GridRow[]
  monthTotals: number[]
  total: number
  year: number
  wide: boolean
  editable: boolean
  status: (r: GridRow, i: number) => CellStatus
  rowTotal: (r: GridRow) => number
  /** Mes resaltado (el actual) y el elegido en celular. */
  current?: number
  showBranch?: boolean
  caption: string
}>()
const month = defineModel<number>('month', { required: true })
const emit = defineEmits<{ commit: [row: GridRow, i: number, value: number | null]; remove: [row: GridRow] }>()

// Al abrir, el mes elegido queda a la vista (en celular el chip; en escritorio la columna).
const root = ref<HTMLElement | null>(null)
function reveal() {
  nextTick(() => {
    const el = root.value?.querySelector<HTMLElement>(props.wide ? 'th.is-now' : '.chip.is-on')
    const box = el?.closest<HTMLElement>(props.wide ? '.sheet' : '.chips')
    if (el && box) box.scrollLeft = Math.max(0, el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2)
  })
}
onMounted(reveal)
watch(() => [props.wide, props.year, props.rows.length > 0], reveal)

const sub = (r: GridRow) => [r.position, props.showBranch ? r.branchName : ''].filter(Boolean).join(' · ')
const lockedHint = (r: GridRow, i: number) => (r.locked?.[i] ? ' (tiene pagos de quincena)' : '')
</script>

<template>
  <div ref="root" data-grid>
    <SheetTable v-if="wide" :caption="caption" compact>
      <thead>
        <tr>
          <th>Colaborador</th>
          <th v-for="(m, i) in MONTHS_SHORT" :key="m" class="num" :class="{ 'is-now': i === current }">{{ m }}</th>
          <th class="num">Total {{ year }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, ri) in rows" :key="r.key">
          <td>
            <span class="who">
              <span class="who__txt">
                <strong>{{ r.name }}</strong>
                <small v-if="sub(r)">{{ sub(r) }}</small>
              </span>
              <button v-if="editable" type="button" class="who__rm" :aria-label="`Quitar a ${r.name} de ${year}`" @click="emit('remove', r)">
                <AppIcon name="trash" :size="14" />
              </button>
            </span>
          </td>
          <td v-for="(m, i) in MONTHS_SHORT" :key="m" class="cell" :class="{ 'is-now': i === current }">
            <MoneyCell
              :model-value="r.months[i] ?? null"
              :label="`${r.name}, ${m} ${year}${lockedHint(r, i)}`"
              :row="ri"
              :col="i"
              :status="status(r, i)"
              :disabled="!editable"
              compact
              @commit="emit('commit', r, i, $event)"
            />
          </td>
          <td class="num"><strong>{{ money(rowTotal(r)) }}</strong></td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="is-total">
          <td>TOTAL</td>
          <td v-for="(m, i) in MONTHS_SHORT" :key="m" class="num">{{ monthTotals[i] ? money(monthTotals[i]) : '—' }}</td>
          <td class="num">{{ money(total) }}</td>
        </tr>
      </tfoot>
    </SheetTable>

    <div v-else class="mobile">
      <div class="chips" role="tablist" aria-label="Mes">
        <button
          v-for="(m, i) in MONTHS_SHORT"
          :key="m"
          type="button"
          role="tab"
          class="chip"
          :class="{ 'is-on': i === month, 'has-data': monthTotals[i] }"
          :aria-selected="i === month"
          @click="month = i"
        >
          {{ m }}
        </button>
      </div>
      <ul class="list">
        <li v-for="(r, ri) in rows" :key="r.key" class="item">
          <span class="item__who">
            <strong>{{ r.name }}</strong>
            <small>{{ sub(r) || ' ' }}<template v-if="rowTotal(r)"> · Año {{ money(rowTotal(r)) }}</template></small>
          </span>
          <MoneyCell
            class="item__cell"
            :model-value="r.months[month] ?? null"
            :label="`${r.name}, ${MONTHS_SHORT[month]} ${year}${lockedHint(r, month)}`"
            :row="ri"
            :col="0"
            :status="status(r, month)"
            :disabled="!editable"
            @commit="emit('commit', r, month, $event)"
          />
          <button v-if="editable" type="button" class="btn btn--ghost btn--icon item__rm" :aria-label="`Quitar a ${r.name} de ${year}`" @click="emit('remove', r)">
            <AppIcon name="trash" :size="16" />
          </button>
        </li>
      </ul>
      <p class="mtotal">
        <span>Total {{ MONTHS_SHORT[month] }} {{ year }}</span>
        <strong>{{ money(monthTotals[month]) }}</strong>
      </p>
      <p class="ytotal">Total del año: {{ money(total) }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.who {
  display: flex;
  align-items: center;
  gap: 0.35rem;

  &__txt {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    small {
      color: $ink-muted;
      font-size: 0.72rem;
    }
  }

  &__rm {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: $radius-sm;
    color: $ink-muted;
    opacity: 0.55;

    &:hover,
    &:focus-visible {
      opacity: 1;
      color: $danger;
      background: $danger-bg;
    }
  }
}

td.cell {
  padding: 0.3rem 0.3rem;
}

.is-now {
  box-shadow: inset 0 -3px 0 $orange;
}

.mobile {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chips {
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
}

.chip {
  flex: 0 0 auto;
  min-width: 52px;
  min-height: 40px;
  padding: 0 0.7rem;
  border-radius: $radius-pill;
  border: 1px solid $line;
  background: $surface;
  font-weight: 700;
  font-size: $text-xs;
  color: $ink-soft;

  &.has-data {
    border-color: rgba($sky-blue, 0.8);
  }

  &.is-on {
    background: $navy;
    border-color: $navy;
    color: #fff;
  }
}

.list {
  list-style: none;
  @include card(0.2rem 0.85rem);
}

.item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0 0.8rem;

  + .item {
    border-top: 1px solid $line;
  }

  &__who {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    small {
      color: $ink-muted;
      font-size: $text-xs;
    }
  }

  &__cell {
    flex: 0 0 8.5rem;
  }

  &__rm {
    flex: 0 0 auto;
    color: $ink-muted;
    border-color: transparent;
  }
}

.mtotal {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  @include card(0.8rem 1rem);
  background: $navy-soft;
  font-weight: 700;
  color: $navy;

  strong {
    font-size: $text-lg;
    font-variant-numeric: tabular-nums;
  }
}

.ytotal {
  font-size: $text-sm;
  color: $ink-muted;
  text-align: right;
}
</style>
