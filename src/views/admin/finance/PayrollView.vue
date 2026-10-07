<script setup lang="ts">
import { ref } from 'vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import PayrollPayments from '@/components/admin/payroll/PayrollPayments.vue'
import PayrollSalaries from '@/components/admin/payroll/PayrollSalaries.vue'

/**
 * Nómina en dos hojas como el Excel: "Sueldos base" (hoja Nómina, grilla ENE…DIC que
 * gerencia escribe) y "Pagos por quincena" (hoja Nómina Quincenal, sale del sueldo del mes).
 */
const tab = ref('sueldos')
</script>

<template>
  <section>
    <SegTabs v-model="tab" :tabs="[{ value: 'sueldos', label: 'Sueldos base' }, { value: 'pagos', label: 'Pagos por quincena' }]" />
    <Transition name="fade" mode="out-in">
      <PayrollSalaries v-if="tab === 'sueldos'" key="s" />
      <PayrollPayments v-else key="p" />
    </Transition>
  </section>
</template>
