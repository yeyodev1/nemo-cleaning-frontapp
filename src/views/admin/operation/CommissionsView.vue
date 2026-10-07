<script setup lang="ts">
import { ref } from 'vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import CommissionGrid from '@/components/admin/operation/CommissionGrid.vue'
import FeeReference from '@/components/admin/operation/FeeReference.vue'

/**
 * Comisiones como la hoja del Excel: gerencia escribe el monto de cada colaborador por mes
 * (eso usan los reportes). La calculadora FEE queda aparte, solo como referencia.
 */
const tab = ref('manual')
</script>

<template>
  <section>
    <SegTabs v-model="tab" :tabs="[{ value: 'manual', label: 'Comisiones' }, { value: 'fee', label: 'FEE (referencia)' }]" />
    <Transition name="fade" mode="out-in">
      <CommissionGrid v-if="tab === 'manual'" key="m" />
      <FeeReference v-else key="f" />
    </Transition>
  </section>
</template>
