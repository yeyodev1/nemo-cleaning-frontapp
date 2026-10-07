<script setup lang="ts">
import { useAdminScope } from '@/stores/adminScope'

const scope = useAdminScope()
</script>

<template>
  <label v-if="scope.visibleBranches.length" class="branch">
    <span class="sr-only">Sucursal</span>
    <select
      :value="scope.branch"
      :disabled="!scope.canSeeAll && scope.visibleBranches.length < 2"
      @change="scope.setBranch(($event.target as HTMLSelectElement).value)"
    >
      <option v-if="scope.canSeeAll" value="">Todas las sucursales</option>
      <option v-for="b in scope.visibleBranches" :key="b._id" :value="b._id">{{ b.name }}</option>
    </select>
  </label>
</template>

<style scoped lang="scss">
.branch select {
  min-height: 40px;
  padding-block: 0.4rem;
  font-size: 16px;
  font-weight: 700;
  color: $navy;
  background-color: $navy-soft;
  border-color: transparent;
  border-radius: $radius-pill;
  max-width: 46vw;
  // En móvil el nombre no cabe completo: puntos suspensivos en vez de cortar la palabra.
  text-overflow: ellipsis;
  white-space: nowrap;

  @include from('md') {
    max-width: 240px;
  }
}
</style>
