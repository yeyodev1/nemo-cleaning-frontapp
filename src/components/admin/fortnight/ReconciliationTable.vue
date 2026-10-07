<script setup lang="ts">
import { computed } from 'vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import QRow from './QRow.vue'
import type { FortnightReport } from '@/types/finance'

const props = defineProps<{ report: FortnightReport; cols: { q1: string; q2: string; total: string } }>()
const r = computed(() => props.report.reconciliation)
const has = (k: 'barter' | 'lost' | 'tips') => r.value[k].total !== 0
const squared = computed(() => r.value.difference.total === 0 && r.value.difference.q1 === 0 && r.value.difference.q2 === 0)
</script>

<template>
  <SheetTable caption="Resumen de producción e ingresos">
    <thead>
      <tr>
        <th>Concepto</th>
        <th class="num">{{ cols.q1 }}</th>
        <th class="num">{{ cols.q2 }}</th>
        <th class="num">{{ cols.total }}</th>
      </tr>
    </thead>
    <tbody>
      <QRow label="Producción total" :value="r.production" kind="key" :hint="`${report.bookings} servicios`" />
      <QRow label="Transferencias y tarjeta recibidas" :value="r.received" />
      <QRow v-for="a in r.receivedByAccount" :key="a.account" :label="a.account" :value="a" kind="sub" />
      <QRow label="Efectivo disponible" :value="r.cashAvailable" hint="Efectivo cobrado menos lo que salió de caja" />
      <QRow label="Efectivo desembolsado" :value="r.cashDisbursed" hint="Gastos de caja menor pagados en efectivo" />
      <QRow label="Valores por confirmar" :value="r.toConfirm" hint="Transferencias con comprobante sin revisar" />
      <QRow label="Valores por cobrar" :value="r.toCollect" />
      <QRow v-if="has('barter')" label="Canje" :value="r.barter" hint="Servicios sin cobro" />
      <QRow v-if="has('lost')" label="Perdidas" :value="r.lost" hint="No se cobrarán" />
      <QRow v-if="has('tips')" label="Propinas cobradas con el pago" :value="r.tips" negative hint="Entraron a cuenta pero no son producción" />
      <QRow label="Diferencia de conciliación" :value="r.difference" kind="total" signed />
    </tbody>
  </SheetTable>
  <p class="note" :class="squared ? 'note--ok' : 'note--bad'">
    <template v-if="squared">Cuadra: todo lo producido está cobrado, por cobrar o justificado.</template>
    <template v-else>
      No cuadra: hay pagos registrados por más del valor del servicio. Revisa los pedidos del mes con saldo a favor.
    </template>
    <small>Diferencia = recibido en cuentas + efectivo disponible + desembolsado + por confirmar/cobrar + canje + perdidas − producción − propinas cobradas con el pago.</small>
  </p>
</template>

<style scoped lang="scss">
.note {
  margin-top: 0.6rem;
  padding: 0.75rem 0.9rem;
  border-radius: $radius-sm;
  font-size: $text-sm;
  font-weight: 600;

  small {
    display: block;
    margin-top: 0.25rem;
    font-weight: 500;
    color: $ink-muted;
  }

  &--ok {
    background: $success-bg;
    color: $success;
  }

  &--bad {
    background: $danger-bg;
    color: $danger;
  }
}
</style>
