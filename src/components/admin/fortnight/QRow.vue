<script setup lang="ts">
import { money } from '@/utils/format'
import type { QTotals } from '@/types/finance'

/** Fila Concepto | Q1 | Q2 | Total. `negative` pinta el monto como resta. */
const props = defineProps<{ label: string; value: QTotals; kind?: 'sub' | 'total' | 'key'; hint?: string; negative?: boolean; signed?: boolean }>()

function cls(v: number) {
  if (!v && props.kind !== 'total' && props.kind !== 'key') return 'muted'
  if (props.signed) return v < 0 ? 'neg' : v > 0 ? 'pos' : ''
  return v < 0 ? 'neg' : ''
}
// Como en el Excel, un cero en una fila de detalle se ve vacío ("—") para que resalte lo que sí tiene valor.
function fmt(v: number) {
  if (!v && props.kind !== 'total' && props.kind !== 'key') return '—'
  return props.negative && v ? `− ${money(v)}` : money(v)
}
</script>

<template>
  <tr :class="kind ? `is-${kind}` : ''">
    <td>
      {{ label }}
      <small v-if="hint" class="qrow__hint">{{ hint }}</small>
    </td>
    <td class="num" :class="cls(value.q1)">{{ fmt(value.q1) }}</td>
    <td class="num" :class="cls(value.q2)">{{ fmt(value.q2) }}</td>
    <td class="num" :class="cls(value.total)"><strong>{{ fmt(value.total) }}</strong></td>
  </tr>
</template>

<style scoped lang="scss">
.qrow__hint {
  display: block;
  font-size: 0.72rem;
  font-weight: 500;
  color: $ink-muted;
}
</style>
