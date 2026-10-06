<script setup lang="ts">
import { computed, ref } from 'vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import IncomeStatement from '@/components/admin/reports/IncomeStatement.vue'
import ProductionReport from '@/components/admin/reports/ProductionReport.vue'
import { useUserStore } from '@/stores/user'

// El estado de resultados es solo de gerencia; el manager ve producción.
const user = useUserStore()
const tab = ref(user.isAdmin ? 'pyg' : 'produccion')
const tabs = computed(() => [
  ...(user.isAdmin ? [{ value: 'pyg', label: 'Estado de resultados' }] : []),
  { value: 'produccion', label: 'Producción' },
])
</script>

<template>
  <section>
    <SegTabs v-if="tabs.length > 1" v-model="tab" :tabs="tabs" />
    <IncomeStatement v-if="tab === 'pyg' && user.isAdmin" />
    <ProductionReport v-else />
  </section>
</template>
