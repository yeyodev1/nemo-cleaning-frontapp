<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import { MONTHS_SHORT, pct } from '@/config/financeLabels'
import { money } from '@/utils/format'
import type { AnnualStatement, StatementMonth } from '@/types/finance'

const props = defineProps<{ data: AnnualStatement; current: number }>()
const emit = defineEmits<{ pick: [month: number] }>()

// En celular la tabla no cabe: se desplaza sola hasta el mes elegido (sin mover la página).
const root = ref<HTMLElement | null>(null)
async function reveal() {
  await nextTick()
  const th = root.value?.querySelector<HTMLElement>('.mbtn.is-on')?.closest('th')
  const box = th?.closest<HTMLElement>('.sheet')
  if (!th || !box) return
  const first = box.querySelector<HTMLElement>('th')?.offsetWidth ?? 0
  const visible = th.offsetLeft >= box.scrollLeft + first && th.offsetLeft + th.offsetWidth <= box.scrollLeft + box.clientWidth
  if (visible) return
  box.scrollTo({ left: Math.max(0, th.offsetLeft - first - 80), behavior: 'smooth' })
}
onMounted(reveal)
watch(() => props.current, reveal)

type K = keyof StatementMonth
const rows: { key: K; label: string; kind?: string; ratio?: boolean; signed?: boolean }[] = [
  { key: 'sales', label: 'Ventas / Producción', kind: 'key' },
  { key: 'salaries', label: 'Sueldos' },
  { key: 'variable', label: 'Gastos variables' },
  { key: 'fixed', label: 'Gastos fijos' },
  { key: 'commissions', label: 'Comisiones' },
  { key: 'totalExpenses', label: 'Total gastos', kind: 'total' },
  { key: 'net', label: 'UTILIDAD NETA', kind: 'key', signed: true },
  { key: 'margin', label: 'Margen neto', ratio: true },
  { key: 'expenseRatio', label: 'Gastos / ventas', ratio: true },
  { key: 'collected', label: 'Cobrado (informativo)', kind: 'sub' },
]

function cell(r: (typeof rows)[number], m: StatementMonth) {
  const v = m[r.key] as number
  if (r.ratio) return m.sales ? pct(v) : '—'
  return v ? money(v) : '—'
}
function cls(r: (typeof rows)[number], m: StatementMonth) {
  const v = m[r.key] as number
  return { neg: (r.signed || r.ratio) && v < 0, pos: r.signed && v > 0 }
}
</script>

<template>
  <div ref="root">
  <SheetTable caption="Estado de resultados mensual">
    <thead>
      <tr>
        <th>Concepto</th>
        <th v-for="(m, i) in MONTHS_SHORT" :key="m" class="num">
          <button type="button" class="mbtn" :class="{ 'is-on': current === i + 1 }" @click="emit('pick', i + 1)">{{ m }}</button>
        </th>
        <th class="num">Total {{ data.year }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in rows" :key="r.key" :class="r.kind ? `is-${r.kind}` : ''">
        <td>{{ r.label }}</td>
        <td v-for="m in data.months" :key="m.month" class="num" :class="[cls(r, m), { 'is-cur': current === m.month }]">
          {{ cell(r, m) }}<sup v-if="r.key === 'salaries' && m.sales && !m.payrollLoaded" title="Nómina del mes sin cargar">*</sup>
        </td>
        <td class="num" :class="cls(r, data.total)"><strong>{{ cell(r, data.total) }}</strong></td>
      </tr>
    </tbody>
  </SheetTable>
  </div>
</template>

<style scoped lang="scss">
.mbtn {
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;

  &.is-on {
    background: $orange;
    color: $navy;
  }

  &:focus-visible {
    outline: 2px solid #fff;
  }
}

td.is-cur {
  box-shadow: inset 0 0 0 9999px rgba($orange, 0.07);
}

sup {
  color: $warning;
  font-weight: 800;
}
</style>
