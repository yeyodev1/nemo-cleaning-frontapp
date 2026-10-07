<script setup lang="ts">
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import QRow from './QRow.vue'
import type { FortnightReport } from '@/types/finance'

defineProps<{ report: FortnightReport; cols: { q1: string; q2: string; total: string } }>()
</script>

<template>
  <SheetTable caption="Cobrado por cuenta">
    <thead>
      <tr>
        <th>Cuenta</th>
        <th class="num">{{ cols.q1 }}</th>
        <th class="num">{{ cols.q2 }}</th>
        <th class="num">{{ cols.total }}</th>
      </tr>
    </thead>
    <tbody>
      <QRow v-for="a in report.collected.byAccount" :key="a.account" :label="a.account" :value="a" />
      <tr v-if="!report.collected.byAccount.length"><td colspan="4" class="muted">No entró dinero en este mes.</td></tr>
      <QRow label="Total cobrado" :value="report.collected.total" kind="total" />
    </tbody>
  </SheetTable>
</template>
