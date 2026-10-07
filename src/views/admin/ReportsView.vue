<script setup lang="ts">
import ProductionReport from '@/components/admin/reports/ProductionReport.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUserStore } from '@/stores/user'

// El estado de resultados pasó a Finanzas → Estado de resultados (ventas = producción, como el Excel).
const user = useUserStore()
</script>

<template>
  <section>
    <RouterLink v-if="user.isAdmin" to="/admin/finanzas/estado-de-resultados" class="moved">
      <AppIcon name="chart" :size="18" /> El estado de resultados ahora está en Finanzas → Estado de resultados
      <AppIcon name="arrow-right" :size="16" />
    </RouterLink>
    <ProductionReport />
  </section>
</template>

<style scoped lang="scss">
.moved {
  @include card(0.75rem 0.9rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: $text-sm;
  font-weight: 700;
  color: $navy;
  background: $info-bg;
  border-color: transparent;
}
</style>
