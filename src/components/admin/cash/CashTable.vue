<script setup lang="ts">
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { expenseCategory } from '@/config/labels'
import { cashConcept } from '@/config/financeLabels'
import { money, shortDate } from '@/utils/format'
import type { CashConcept, CashRegister, CashRow } from '@/types/finance'
import type { ExpenseCategory } from '@/types/api'

defineProps<{ data: CashRegister; showDate: boolean }>()
const emit = defineEmits<{ remove: [row: CashRow] }>()

function concept(r: CashRow) {
  if (r.source === 'payment') return 'Producción'
  if (r.source === 'expense') return expenseCategory[r.concept as ExpenseCategory] || r.concept
  return cashConcept[r.concept as CashConcept]?.label || r.concept
}
</script>

<template>
  <SheetTable caption="Registro de caja">
    <thead>
      <tr>
        <th>Concepto</th>
        <th class="num">Ingreso</th>
        <th class="num">Egreso</th>
        <th class="num">Saldo</th>
        <th>Operador</th>
        <th>Detalle</th>
        <th><span class="sr-only">Acciones</span></th>
      </tr>
    </thead>
    <tbody>
      <tr class="is-section">
        <td>Saldo inicial</td><td></td><td></td>
        <td class="num">{{ money(data.opening) }}</td>
        <td colspan="3"><span class="plain">Lo que quedó en caja antes del {{ shortDate(data.from) }}</span></td>
      </tr>
      <tr v-for="r in data.rows" :key="r.key">
        <td>
          <strong>{{ concept(r) }}</strong>
          <small v-if="showDate" class="muted d">{{ shortDate(r.date) }}</small>
          <small v-if="r.source !== 'manual'" class="muted d">automático</small>
        </td>
        <td class="num pos">{{ r.in ? money(r.in) : '' }}</td>
        <td class="num neg">{{ r.out ? money(r.out) : '' }}</td>
        <td class="num" :class="{ neg: r.balance < 0 }"><strong>{{ money(r.balance) }}</strong></td>
        <td>{{ r.operator || '—' }}</td>
        <td class="detail">
          <RouterLink v-if="r.source === 'payment'" :to="`/admin/pedidos/${r.id}`">{{ r.detail }}</RouterLink>
          <template v-else>{{ r.detail }}</template>
        </td>
        <td>
          <button v-if="r.source === 'manual'" type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar movimiento" @click="emit('remove', r)">
            <AppIcon name="trash" :size="17" />
          </button>
        </td>
      </tr>
      <tr v-if="!data.rows.length"><td colspan="7" class="muted">Sin movimientos en este periodo.</td></tr>
      <tr class="is-total">
        <td>Saldo final</td>
        <td class="num">{{ money(data.totalIn) }}</td>
        <td class="num">{{ money(data.totalOut) }}</td>
        <td class="num" :class="{ neg: data.closing < 0 }">{{ money(data.closing) }}</td>
        <td colspan="3"></td>
      </tr>
    </tbody>
  </SheetTable>
</template>

<style scoped lang="scss">
.d {
  display: block;
  font-size: 0.72rem;
}

.plain {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  color: $ink-muted;
}

.detail {
  white-space: normal !important;
  min-width: 14rem;
  color: $ink-soft;
}
</style>
