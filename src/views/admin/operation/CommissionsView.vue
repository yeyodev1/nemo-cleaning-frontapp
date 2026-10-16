<script setup lang="ts">
import { ref } from 'vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import CommissionGrid from '@/components/admin/operation/CommissionGrid.vue'
import CommissionGoalCalc from '@/components/admin/operation/CommissionGoalCalc.vue'
import CommissionHowTo from '@/components/admin/operation/CommissionHowTo.vue'

/**
 * Comisiones: la hoja (lo que se paga y usan los reportes), el cálculo por meta mensual
 * ((producción − meta) × % de la sucursal) y la explicación con sus parámetros.
 */
const tab = ref('calc')
</script>

<template>
  <section>
    <SegTabs
      v-model="tab"
      :tabs="[
        { value: 'calc', label: 'Cálculo por meta' },
        { value: 'manual', label: 'Hoja de comisiones' },
        { value: 'how', label: '¿Cómo se calcula?' },
      ]"
    />
    <Transition name="fade" mode="out-in">
      <CommissionGoalCalc v-if="tab === 'calc'" key="c" @how="tab = 'how'" />
      <CommissionGrid v-else-if="tab === 'manual'" key="m" />
      <CommissionHowTo v-else key="h" />
    </Transition>
  </section>
</template>
