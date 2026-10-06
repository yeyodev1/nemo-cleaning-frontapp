<script setup lang="ts">
import { computed } from 'vue'
import { money, shortDate } from '@/utils/format'

/** Barras SVG simples: ingreso aprobado por día. Escala en viewBox, ancho fluido. */
const props = defineProps<{ data: { date: string; amount: number }[] }>()

const H = 160
const max = computed(() => Math.max(1, ...props.data.map((d) => d.amount)))
const total = computed(() => props.data.reduce((a, d) => a + d.amount, 0))
const best = computed(() => props.data.reduce<{ date: string; amount: number } | null>((b, d) => (!b || d.amount > b.amount ? d : b), null))
const W = computed(() => Math.max(props.data.length * 14, 140))
const bars = computed(() =>
  props.data.map((d, i) => {
    const h = Math.max(d.amount > 0 ? 3 : 1, (d.amount / max.value) * (H - 10))
    return { ...d, x: i * 14 + 2, y: H - h, h }
  }),
)
const summary = computed(
  () =>
    `Ingresos de ${props.data.length} días: total ${money(total.value)}` +
    (best.value && best.value.amount > 0 ? `; mejor día ${shortDate(best.value.date)} con ${money(best.value.amount)}` : ''),
)
</script>

<template>
  <figure class="chart">
    <figcaption class="sr-only">{{ summary }}</figcaption>
    <svg v-if="data.length" :viewBox="`0 0 ${W} ${H + 18}`" preserveAspectRatio="none" class="chart__svg" role="img" :aria-label="summary">
      <line :x1="0" :x2="W" :y1="H" :y2="H" class="chart__axis" />
      <g v-for="b in bars" :key="b.date">
        <rect :x="b.x" :y="b.y" width="10" :height="b.h" rx="3" class="chart__bar" :class="{ 'is-zero': !b.amount }">
          <title>{{ shortDate(b.date) }}: {{ money(b.amount) }}</title>
        </rect>
      </g>
    </svg>
    <p v-else class="empty">Sin ingresos en el período.</p>
    <div v-if="data.length" class="chart__legend">
      <span>{{ shortDate(data[0]?.date) }}</span>
      <span>{{ shortDate(data[data.length - 1]?.date) }}</span>
    </div>
  </figure>
</template>

<style scoped lang="scss">
.chart {
  &__svg {
    width: 100%;
    height: 180px;
  }

  &__axis {
    stroke: $line;
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  &__bar {
    fill: $navy;
    transition: fill 0.2s;

    &:hover {
      fill: $aqua;
    }

    &.is-zero {
      fill: $line-strong;
    }
  }

  &__legend {
    display: flex;
    justify-content: space-between;
    font-size: $text-xs;
    color: $ink-muted;
    margin-top: 0.25rem;
  }
}
</style>
