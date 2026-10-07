<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import MoneyCell from '@/components/admin/grid/MoneyCell.vue'
import { goalStatus, pct, positionLabel } from '@/config/operationLabels'
import { money } from '@/utils/format'
import type { GoalRow } from '@/types/operation'
import type { CellStatus } from '@/types/grid'

/**
 * Una fila de "Metas Mensuales": la meta se escribe aquí mismo (se guarda sola, Enter pasa al
 * siguiente operador); producción, % y excedente/faltante salen solos.
 */
const props = defineProps<{ row: GoalRow; index: number; status: CellStatus; editable: boolean }>()
const emit = defineEmits<{ edit: [row: GoalRow]; commit: [value: number | null] }>()
const st = computed(() => goalStatus[props.row.status])
</script>

<template>
  <article class="gc" :class="`gc--${row.status}`">
    <header class="gc__head">
      <span class="gc__who">
        <span class="gc__dot" :style="{ background: row.color || '#12263F' }"></span>
        <span>
          <strong>{{ row.name }}</strong>
          <small v-if="row.position">{{ positionLabel[row.position as keyof typeof positionLabel] }}</small>
        </span>
      </span>
      <StatusBadge :tone="st.tone" :label="st.label" />
    </header>

    <div class="gc__nums">
      <label class="gc__goal">
        <small>Meta del mes</small>
        <MoneyCell :model-value="row.goal || null" :label="`Meta de ${row.name}`" :row="index" :col="0" :status="status" :disabled="!editable" placeholder="$0.00" @commit="emit('commit', $event)" />
      </label>
      <span><small>Producción</small><strong class="money">{{ money(row.production) }}</strong></span>
      <span><small>Cumplimiento</small><strong>{{ pct(row.compliance) }}</strong></span>
    </div>
    <template v-if="row.goal">
      <div class="gc__bar" role="progressbar" :aria-valuenow="Math.round((row.compliance || 0) * 100)" aria-valuemin="0" aria-valuemax="100">
        <span :style="{ transform: `scaleX(${Math.min(1, row.compliance || 0)})` }"></span>
      </div>
      <p class="gc__diff" :class="row.diff >= 0 ? 'is-pos' : 'is-neg'">
        {{ row.diff >= 0 ? 'Excedente' : 'Le faltan' }} {{ money(Math.abs(row.diff)) }}
      </p>
    </template>
    <p v-if="row.notes" class="gc__notes">{{ row.notes }}</p>

    <button v-if="editable && row.goal" type="button" class="btn btn--ghost btn--sm gc__btn" @click="emit('edit', row)">{{ row.notes ? 'Editar observación' : 'Agregar observación' }}</button>
  </article>
</template>

<style scoped lang="scss">
.gc {
  @include card(1rem);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  &__who {
    display: flex;
    gap: 0.55rem;
    align-items: center;

    > span:last-child {
      display: flex;
      flex-direction: column;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__nums {
    display: grid;
    grid-template-columns: minmax(8.5rem, 1.3fr) repeat(2, minmax(0, 1fr));
    align-items: end;
    gap: 0.5rem;

    span {
      display: flex;
      flex-direction: column;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__bar {
    height: 8px;
    border-radius: $radius-pill;
    background: $line;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      background: $navy;
      transform-origin: left center;
      transition: transform $dur-slow $ease-out;
    }
  }

  &--meets &__bar span {
    background: $success;
  }

  &--misses &__bar span {
    background: $danger;
  }

  &__diff {
    font-size: $text-sm;
    font-weight: 700;

    &.is-pos {
      color: $success;
    }

    &.is-neg {
      color: $danger;
    }
  }

  &__goal :deep(input) {
    min-width: 0;
  }

  &__notes {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__notes {
    font-style: italic;
  }

  &__btn {
    align-self: flex-start;
  }
}
</style>
