<script setup lang="ts">
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import QRow from './QRow.vue'
import { expenseCategory } from '@/config/labels'
import type { FortnightReport } from '@/types/finance'

defineProps<{ report: FortnightReport; cols: { q1: string; q2: string; total: string } }>()
</script>

<template>
  <SheetTable caption="Gastos por categoría">
    <thead>
      <tr>
        <th>Concepto</th>
        <th class="num">{{ cols.q1 }}</th>
        <th class="num">{{ cols.q2 }}</th>
        <th class="num">{{ cols.total }}</th>
      </tr>
    </thead>
    <tbody>
      <QRow v-for="c in report.expenses.byCategory" :key="c.category" :label="expenseCategory[c.category] || c.category" :value="c" />
      <tr v-if="!report.expenses.byCategory.length">
        <td colspan="4" class="muted">Sin gastos en este mes. Se cargan en Gastos.</td>
      </tr>
      <QRow label="Total gastos desembolsados" :value="report.expenses.total" kind="total" />
    </tbody>
  </SheetTable>
</template>
