<script setup lang="ts">
import { computed } from 'vue'
import { money, shortDate } from '@/utils/format'

/** Barras verticales simples (SVG) de monto por día. */
const props = defineProps<{ days: { date: string; amount: number }[] }>()
const W = 600
const H = 160
const max = computed(() => Math.max(1, ...props.days.map((d) => d.amount)))
const bw = computed(() => (props.days.length ? W / props.days.length : W))
</script>

<template>
  <figure class="chart">
    <svg :viewBox="`0 0 ${W} ${H + 4}`" preserveAspectRatio="none" role="img" aria-label="Ingresos por día">
      <g v-for="(d, i) in days" :key="d.date">
        <rect
          :x="i * bw + bw * 0.15"
          :y="H - (d.amount / max) * H"
          :width="bw * 0.7"
          :height="Math.max(2, (d.amount / max) * H)"
          rx="3"
          class="chart__bar"
        >
          <title>{{ shortDate(d.date) }}: {{ money(d.amount) }}</title>
        </rect>
      </g>
    </svg>
    <figcaption v-if="days.length" class="chart__axis">
      <span>{{ shortDate(days[0]?.date) }}</span><span>{{ shortDate(days[days.length - 1]?.date) }}</span>
    </figcaption>
  </figure>
</template>

<style scoped lang="scss">
.chart {
  svg {
    width: 100%;
    height: 160px;
  }

  &__bar {
    fill: $orange;

    &:hover {
      fill: $navy;
    }
  }

  &__axis {
    display: flex;
    justify-content: space-between;
    font-size: $text-xs;
    color: $ink-muted;
    margin-top: 0.3rem;
  }
}
</style>
