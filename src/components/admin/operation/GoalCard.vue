<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { goalStatus, pct, positionLabel } from '@/config/operationLabels'
import { money } from '@/utils/format'
import type { GoalRow } from '@/types/operation'

/** Una fila de "Metas Mensuales": meta, producción real, % y excedente/faltante. */
const props = defineProps<{ row: GoalRow }>()
const emit = defineEmits<{ edit: [row: GoalRow] }>()
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

    <template v-if="row.goal">
      <div class="gc__nums">
        <span><small>Producción</small><strong class="money">{{ money(row.production) }}</strong></span>
        <span><small>Meta</small><strong class="money">{{ money(row.goal) }}</strong></span>
        <span><small>Cumplimiento</small><strong>{{ pct(row.compliance) }}</strong></span>
      </div>
      <div class="gc__bar" role="progressbar" :aria-valuenow="Math.round((row.compliance || 0) * 100)" aria-valuemin="0" aria-valuemax="100">
        <span :style="{ transform: `scaleX(${Math.min(1, row.compliance || 0)})` }"></span>
      </div>
      <p class="gc__diff" :class="row.diff >= 0 ? 'is-pos' : 'is-neg'">
        {{ row.diff >= 0 ? 'Excedente' : 'Le faltan' }} {{ money(Math.abs(row.diff)) }}
      </p>
    </template>
    <p v-else class="gc__none">Producción del mes: <strong class="money">{{ money(row.production) }}</strong>. Aún sin meta.</p>
    <p v-if="row.notes" class="gc__notes">{{ row.notes }}</p>

    <button type="button" class="btn btn--ghost btn--sm gc__btn" @click="emit('edit', row)">{{ row.goal ? 'Cambiar meta' : 'Fijar meta' }}</button>
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.4rem;

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

  &__none,
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
