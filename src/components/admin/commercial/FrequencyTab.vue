<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import HBar from '@/components/admin/finance/HBar.vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import FilterBar from '@/components/admin/finance/FilterBar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useReport } from '@/composables/admin/useReport'
import { pct } from '@/config/financeLabels'
import { addDays, money, shortDate, todayISO, whatsappUrl } from '@/utils/format'

/** Frecuencia x Clientes y, con `potential`, el ranking de Clientes Potenciales Plan Mensual. */
const props = defineProps<{ potential?: boolean }>()
const scope = useAdminScope()
const to = ref(todayISO())
const from = ref(addDays(todayISO(), -364))
const branch = toRef(scope, 'branch')
const { data, loading } = useReport(() => ledgerService.frequency(from.value, to.value, scope.query), [from, to, branch])
const max = computed(() => Math.max(0, ...(data.value?.buckets.map((b) => b.customers) ?? [])))
const invite = (name: string, phone: string) =>
  whatsappUrl(phone, `Hola ${name}, te escribimos de Nemo Cleaning. Como nos visitas seguido, queremos contarte de nuestros planes mensuales.`)
</script>

<template>
  <div>
    <FilterBar>
      <label class="field"><span class="field__label">Desde</span><input v-model="from" type="date" /></label>
      <label class="field"><span class="field__label">Hasta</span><input v-model="to" type="date" /></label>
    </FilterBar>
    <div v-if="loading && !data" class="skeleton" style="height: 200px"></div>
    <EmptyState v-else-if="data && !data.totalCustomers" title="Sin servicios en este rango" text="Amplía las fechas para ver cuántas veces vuelven tus clientes." icon="users" />
    <template v-else-if="data && !props.potential">
      <article class="box">
        <h3>¿Cuántas veces vuelven? <small>{{ data.totalCustomers }} clientes · {{ data.totalServices }} servicios</small></h3>
        <div class="bars">
          <HBar v-for="b in [...data.buckets].reverse()" :key="b.key" :label="b.label" :value="b.customers" :max="max" :display="`${b.customers} · ${pct(b.share)}`" />
        </div>
      </article>
    </template>
    <template v-else-if="data">
      <p class="hint">Clientes con 2 o más servicios en el rango, de más a menos frecuentes: los candidatos para ofrecerles plan mensual.</p>
      <EmptyState v-if="!data.potential.length" title="Aún no hay clientes recurrentes" text="Cuando alguien repita el servicio aparecerá aquí." icon="star" />
      <SheetTable v-else caption="Clientes potenciales para plan mensual">
        <thead><tr><th>Cliente</th><th class="num">Veces</th><th class="num">Total</th><th>Último servicio</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(p, i) in data.potential" :key="p.customer._id">
            <td><span class="rank">{{ i + 1 }}</span> <RouterLink :to="`/admin/clientes/${p.customer._id}`">{{ p.customer.name }}</RouterLink></td>
            <td class="num"><strong>{{ p.count }}</strong></td>
            <td class="num">{{ money(p.amount) }}</td>
            <td>{{ shortDate(p.last) }}</td>
            <td>
              <a v-if="p.customer.phone" :href="invite(p.customer.name, p.customer.phone)" target="_blank" rel="noopener" class="btn btn--ghost btn--sm">
                <AppIcon name="whatsapp" :size="16" /> Ofrecer plan
              </a>
            </td>
          </tr>
        </tbody>
      </SheetTable>
    </template>
  </div>
</template>

<style scoped lang="scss">
.box {
  @include card(1rem 1.1rem);

  h3 {
    font-size: $text-base;
    margin-bottom: 0.7rem;

    small {
      color: $ink-muted;
      font-weight: 500;
      font-size: $text-xs;
    }
  }
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.hint {
  font-size: $text-sm;
  color: $ink-muted;
  margin-bottom: 0.75rem;
}

.rank {
  display: inline-flex;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: $navy-soft;
  color: $navy;
  font-size: 0.72rem;
  font-weight: 800;
  align-items: center;
  justify-content: center;
}

a:not(.btn) {
  font-weight: 700;
  color: $navy;
}
</style>
