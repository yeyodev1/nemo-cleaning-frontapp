<script setup lang="ts">
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import QRow from './QRow.vue'
import { pct } from '@/config/financeLabels'
import type { FortnightReport } from '@/types/finance'

defineProps<{ report: FortnightReport; cols: { q1: string; q2: string; total: string } }>()
</script>

<template>
  <SheetTable caption="Utilidad y liquidez">
    <thead>
      <tr>
        <th>Concepto</th>
        <th class="num">{{ cols.q1 }}</th>
        <th class="num">{{ cols.q2 }}</th>
        <th class="num">{{ cols.total }}</th>
      </tr>
    </thead>
    <tbody>
      <tr class="is-section"><td colspan="4">4. Utilidad</td></tr>
      <QRow label="Producción" :value="report.reconciliation.production" />
      <template v-if="report.profit.expenses">
        <QRow label="Gastos del periodo" :value="report.profit.expenses" negative hint="Incluye los pagos por realizar ya pagados" />
        <QRow label="Nómina del mes" :value="report.profit.payroll!" negative hint="Sueldos esperados (sale de Nómina)" />
        <QRow label="Pagos por realizar pendientes" :value="report.profit.payablesPending!" negative hint="Solo lo que falta pagar; sin Nómina" />
      </template>
      <QRow label="Costos totales" :value="report.profit.totalCosts" negative kind="sub" hint="Cada pago cuenta una sola vez" />
      <QRow label="Utilidad bruta" :value="report.profit.profit" kind="key" signed />
      <tr>
        <td>Margen de utilidad</td>
        <td class="num">{{ pct(report.profit.margin.q1) }}</td>
        <td class="num">{{ pct(report.profit.margin.q2) }}</td>
        <td class="num"><strong>{{ pct(report.profit.margin.total) }}</strong></td>
      </tr>
      <tr class="is-section"><td colspan="4">5. Control de liquidez (no es utilidad contable)</td></tr>
      <QRow label="Disponible en cuentas" :value="report.liquidity.inAccounts" />
      <QRow label="Menos pagos pendientes" :value="report.liquidity.pendingPayments" negative />
      <QRow label="Saldo disponible después de pagar" :value="report.liquidity.available" kind="total" signed />
    </tbody>
  </SheetTable>
</template>
