<script setup lang="ts">
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { payStatus } from '@/config/financeLabels'
import { money, shortDate } from '@/utils/format'
import type { PayrollList, PayrollRow } from '@/types/finance'

defineProps<{ data: PayrollList }>()
const emit = defineEmits<{ edit: [row: PayrollRow] }>()
</script>

<template>
  <SheetTable caption="Control de pago de nómina por quincena">
    <thead>
      <tr>
        <th>Colaborador</th>
        <th class="num">Sueldo</th>
        <th class="num">Anticipos</th>
        <th class="num">Q1 esperado</th>
        <th>Q1 pagado</th>
        <th class="num">Q2 esperado</th>
        <th>Q2 pagado</th>
        <th class="num">Saldo pendiente</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in data.items" :key="r._id">
        <td>
          <!-- La primera columna queda fija: tocar el nombre abre el pago sin desplazar la tabla. -->
          <button type="button" class="who" @click="emit('edit', r)">
            <strong>{{ r.name }} <AppIcon name="edit" :size="13" /></strong>
            <small class="muted pos-line">{{ r.position || 'Sin cargo' }}</small>
          </button>
        </td>
        <td class="num">{{ money(r.salary) }}</td>
        <td class="num" :class="{ muted: !r.advances }">{{ r.advances ? `− ${money(r.advances)}` : '—' }}</td>
        <td class="num">{{ money(r.q1.expected) }}</td>
        <td>
          <span class="paid">
            <StatusBadge :tone="payStatus[r.q1.status].tone" :label="payStatus[r.q1.status].label" />
            <span v-if="r.q1.paid">{{ money(r.q1.paid) }}<small v-if="r.q1.date" class="muted"> · {{ shortDate(r.q1.date) }}</small></span>
          </span>
        </td>
        <td class="num">{{ money(r.q2.expected) }}</td>
        <td>
          <span class="paid">
            <StatusBadge :tone="payStatus[r.q2.status].tone" :label="payStatus[r.q2.status].label" />
            <span v-if="r.q2.paid">{{ money(r.q2.paid) }}<small v-if="r.q2.date" class="muted"> · {{ shortDate(r.q2.date) }}</small></span>
          </span>
        </td>
        <td class="num" :class="{ neg: r.pending > 0 }"><strong>{{ money(r.pending) }}</strong></td>
        <td>
          <button type="button" class="btn btn--soft btn--sm" @click="emit('edit', r)"><AppIcon name="wallet" :size="16" /> Pagar</button>
        </td>
      </tr>
      <tr class="is-total">
        <td>Total nómina</td>
        <td class="num">{{ money(data.totals.salary) }}</td>
        <td class="num">{{ data.totals.advances ? `− ${money(data.totals.advances)}` : '—' }}</td>
        <td></td>
        <td>{{ money(data.totals.paidQ1) }}</td>
        <td></td>
        <td>{{ money(data.totals.paidQ2) }}</td>
        <td class="num">{{ money(data.totals.pending) }}</td>
        <td></td>
      </tr>
    </tbody>
  </SheetTable>
</template>

<style scoped lang="scss">
.who {
  font: inherit;
  text-align: left;
  color: $navy;

  svg {
    color: $ink-muted;
  }

  @include from('md') {
    strong {
      white-space: nowrap;
    }
  }
}

.pos-line {
  display: block;
  font-size: 0.72rem;
}

.paid {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
