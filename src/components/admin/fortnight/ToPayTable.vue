<script setup lang="ts">
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import QRow from './QRow.vue'
import { payStatus, payableCategory } from '@/config/financeLabels'
import { money } from '@/utils/format'
import type { FortnightReport } from '@/types/finance'

defineProps<{ report: FortnightReport; cols: { q1: string; q2: string; total: string } }>()
</script>

<template>
  <SheetTable caption="Pagos por realizar">
    <thead>
      <tr>
        <th>Beneficiario / concepto</th>
        <th class="num">{{ cols.q1 }}</th>
        <th class="num">{{ cols.q2 }}</th>
        <th class="num">Total</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      <tr class="is-section"><td colspan="5">Nómina</td></tr>
      <tr v-for="p in report.toPay.payroll" :key="p._id">
        <td>{{ p.name }} <small class="muted">· {{ p.position || 'Sin cargo' }}</small></td>
        <td class="num">{{ money(p.q1) }}</td>
        <td class="num">{{ money(p.q2) }}</td>
        <td class="num"><strong>{{ money(p.total) }}</strong></td>
        <td class="badges">
          <StatusBadge :tone="payStatus[p.q1Status].tone" :label="`Q1 ${payStatus[p.q1Status].label}`" />
          <StatusBadge :tone="payStatus[p.q2Status].tone" :label="`Q2 ${payStatus[p.q2Status].label}`" />
        </td>
      </tr>
      <tr v-if="!report.toPay.payroll.length"><td colspan="5" class="muted">Nómina del mes sin cargar (se abre en Nómina).</td></tr>
      <tr class="is-section"><td colspan="5">Otros pagos</td></tr>
      <tr v-for="p in report.toPay.payables" :key="p._id">
        <td>{{ p.beneficiary }} <small class="muted">· {{ payableCategory[p.category] }}</small></td>
        <td class="num">{{ p.q1 ? money(p.q1) : '—' }}</td>
        <td class="num">{{ p.q2 ? money(p.q2) : '—' }}</td>
        <td class="num"><strong>{{ money(p.total) }}</strong></td>
        <td><StatusBadge :tone="payStatus[p.status].tone" :label="payStatus[p.status].label" /></td>
      </tr>
      <tr v-if="!report.toPay.payables.length"><td colspan="5" class="muted">Sin pagos programados (se cargan en Pagos por realizar).</td></tr>
      <QRow label="Total por pagar" :value="report.toPay.total" kind="total" />
      <QRow label="Pagado" :value="report.toPay.paid" kind="sub" />
      <QRow label="Pendiente" :value="report.toPay.pending" kind="sub" />
    </tbody>
  </SheetTable>
</template>

<style scoped lang="scss">
.badges {
  display: flex;
  gap: 0.3rem;
}
</style>
