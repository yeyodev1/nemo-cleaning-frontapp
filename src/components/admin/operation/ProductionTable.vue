<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'
import WaTag from '@/components/admin/common/WaTag.vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import { paymentConfirmation } from '@/config/operationLabels'
import { money, shortDate } from '@/utils/format'
import type { ProductionList, ProductionRow } from '@/types/operation'

/** La Base en escritorio: mismas columnas del Excel y totales al pie. */
defineProps<{ data: ProductionList }>()
const emit = defineEmits<{ select: [row: ProductionRow] }>()
const services = (r: ProductionRow) => r.items.map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ''}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(' + ')
</script>

<template>
  <SheetTable caption="Base de producción" compact>
    <thead>
      <tr>
        <th>Cliente</th>
        <th>Fecha</th>
        <th>Operador</th>
        <th>Urbanización</th>
        <th>Servicios</th>
        <th class="num">Total</th>
        <th>Pagos</th>
        <th>Confirmación</th>
        <th class="num">Propina</th>
        <th>Observaciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in data.items" :key="r._id" class="row" tabindex="0" @click="emit('select', r)" @keydown.enter="emit('select', r)">
        <td><strong>{{ r.customer?.name || '—' }}</strong><br /><small class="muted">{{ r.code }}</small> <WaTag v-if="r.source === 'whatsapp'" compact /></td>
        <td>{{ shortDate(r.date) }}</td>
        <td>{{ r.operators.map((o) => o.name).join(', ') || '—' }}</td>
        <td>{{ r.zone || '—' }}</td>
        <td class="svc">{{ services(r) }}</td>
        <td class="num"><strong>{{ money(r.total) }}</strong></td>
        <td>{{ r.paymentAccount || '—' }}</td>
        <td><StatusBadge :tone="paymentConfirmation[r.paymentConfirmation].tone" :label="paymentConfirmation[r.paymentConfirmation].label" /></td>
        <td class="num">{{ r.tip ? money(r.tip) : '' }}</td>
        <td class="obs">{{ r.notes }}<span v-if="r.novedades" class="nov">{{ r.novedades }} novedad{{ r.novedades > 1 ? 'es' : '' }}</span></td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="is-total">
        <td>TOTAL · {{ data.totals.count }} servicios</td>
        <td colspan="4"></td>
        <td class="num">{{ money(data.totals.production) }}</td>
        <td colspan="2">Por cobrar {{ money(data.totals.receivable) }}</td>
        <td class="num">{{ money(data.totals.tip) }}</td>
        <td></td>
      </tr>
    </tfoot>
  </SheetTable>
</template>

<style scoped lang="scss">
.row {
  cursor: pointer;

  &:hover td,
  &:focus-visible td {
    background: $sky;
  }
}

.svc,
.obs {
  white-space: normal !important;
  min-width: 12rem;
  max-width: 18rem;
}

.nov {
  display: inline-block;
  margin-left: 0.3rem;
  padding: 0 0.4rem;
  border-radius: $radius-pill;
  background: $warning-bg;
  color: $warning;
  font-size: $text-xs;
  font-weight: 700;
}
</style>
