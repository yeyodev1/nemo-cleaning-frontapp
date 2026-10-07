<script setup lang="ts">
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import { money, shortDate } from '@/utils/format'
import type { CommissionCell } from '@/types/operation'

/** Detalle diario de un operador: las columnas de la hoja FEE (PRODUCCIÓN, EXCEDENTE, FEE, FEE SUPERVISOR). */
defineProps<{ days: (CommissionCell & { date: string })[]; total?: { production: number; fee: number; supervisorFee: number } }>()
</script>

<template>
  <SheetTable caption="FEE diario del operador" compact>
    <thead>
      <tr>
        <th>Día</th>
        <th class="num">Producción</th>
        <th class="num">Excedente</th>
        <th class="num">%</th>
        <th class="num">FEE</th>
        <th class="num">FEE supervisor</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="d in days" :key="d.date">
        <td>{{ shortDate(d.date) }}</td>
        <td class="num">{{ money(d.production) }}</td>
        <td class="num" :class="d.excess > 0 ? 'pos' : 'muted'">{{ money(d.excess) }}</td>
        <td class="num">{{ d.percent ? `${d.percent} %` : '—' }}</td>
        <td class="num"><strong>{{ d.fee ? money(d.fee) : '—' }}</strong></td>
        <td class="num">{{ d.supervisorFee ? money(d.supervisorFee) : '—' }}</td>
      </tr>
    </tbody>
    <tfoot v-if="total">
      <tr class="is-total">
        <td>TOTAL</td>
        <td class="num">{{ money(total.production) }}</td>
        <td></td>
        <td></td>
        <td class="num">{{ money(total.fee) }}</td>
        <td class="num">{{ money(total.supervisorFee) }}</td>
      </tr>
    </tfoot>
  </SheetTable>
</template>
