<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import { useReport } from '@/composables/admin/useReport'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { addDays, dateTime, errorMessage, shortDate, todayISO, weekdayOf } from '@/utils/format'
import type { NovedadRow } from '@/types/operation'

/** Hoja "NOVEDADES DE LA SEMANA": lunes a domingo, con flechas para ir a otras semanas. */
const scope = useAdminScope()
const toast = useToastStore()
const monday = (d: string) => addDays(d, -((weekdayOf(d) + 6) % 7))
const from = ref(monday(todayISO()))
const to = computed(() => addDays(from.value, 6))
const branch = toRef(scope, 'branch')
const { data, loading, load } = useReport(() => operationService.novedades({ from: from.value, to: to.value, branch: scope.query }), [from, branch])

const items = computed(() => data.value?.items || [])
const byOperator = computed(() => {
  const map = new Map<string, number>()
  for (const n of items.value) map.set(n.operator?.name || 'Sin operador', (map.get(n.operator?.name || 'Sin operador') || 0) + 1)
  return [...map.entries()].sort((a, b) => b[1] - a[1])
})
const isThisWeek = computed(() => from.value === monday(todayISO()))

const removing = ref<NovedadRow | null>(null)
const busy = ref(false)
async function remove() {
  if (!removing.value) return
  busy.value = true
  try {
    await operationService.deleteNovedad(removing.value.bookingId, removing.value._id)
    toast.success('Novedad eliminada')
    removing.value = null
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section>
    <PageIntro text="Quejas e incidencias de los servicios de la semana: qué pasó, con qué cliente y con qué operador. Se anotan desde la Base o desde el pedido." />

    <div class="week">
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Semana anterior" @click="from = addDays(from, -7)"><AppIcon name="chevron-left" /></button>
      <strong class="week__label">{{ isThisWeek ? 'Esta semana' : 'Semana' }} · {{ shortDate(from) }} al {{ shortDate(to) }}</strong>
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Semana siguiente" :disabled="isThisWeek" @click="from = addDays(from, 7)"><AppIcon name="chevron-right" /></button>
    </div>

    <KpiRow v-if="data">
      <KpiCard label="Novedades" :value="items.length" icon="alert" tone="warning" />
      <KpiCard label="Operador con más" :value="byOperator[0]?.[0] || '—'" icon="user" :hint="byOperator[0] ? `${byOperator[0][1]} novedad(es)` : 'Sin novedades'" />
    </KpiRow>

    <div v-if="loading && !data" class="list"><span v-for="i in 3" :key="i" class="skeleton" style="height: 90px"></span></div>
    <EmptyState v-else-if="!items.length" title="Sin novedades esta semana" text="Para anotar una, abre la Base de producción, toca el servicio y escribe la novedad." icon="check">
      <RouterLink to="/admin/produccion" class="btn btn--primary"><AppIcon name="list" /> Ir a la Base</RouterLink>
    </EmptyState>
    <TransitionGroup v-else name="fade-up" tag="ul" class="list">
      <li v-for="n in items" :key="n._id" class="nov">
        <div class="nov__head">
          <strong>{{ n.customer || 'Cliente' }}</strong>
          <span v-if="n.operator" class="nov__op"><span class="nov__dot" :style="{ background: n.operator.color || '#12263F' }"></span>{{ n.operator.name }}</span>
        </div>
        <p class="nov__text">{{ n.text }}</p>
        <div class="nov__foot">
          <RouterLink :to="`/admin/pedidos/${n.bookingId}`">{{ n.code }} · servicio del {{ shortDate(n.date) }}</RouterLink>
          <span>{{ n.by?.name }} · {{ dateTime(n.at) }}</span>
          <button type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar novedad" @click="removing = n"><AppIcon name="trash" :size="16" /></button>
        </div>
      </li>
    </TransitionGroup>

    <ConfirmSheet
      :open="!!removing"
      title="Eliminar novedad"
      :message="removing ? `Se borra la novedad de ${removing.customer || 'este cliente'}: “${removing.text}”.` : ''"
      confirm-label="Eliminar"
      danger
      :busy="busy"
      @close="removing = null"
      @confirm="remove"
    />
  </section>
</template>

<style scoped lang="scss">
.week {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  @include card(0.4rem);

  &__label {
    font-size: $text-sm;
    text-align: center;
  }
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.nov {
  @include card(0.9rem 1rem);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &__head {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__op {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-soft;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &__text {
    color: $ink;
    line-height: 1.5;
  }

  &__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.75rem;
    font-size: $text-xs;
    color: $ink-muted;

    a {
      color: $navy;
      font-weight: 600;
    }

    .btn {
      margin-left: auto;
    }
  }
}
</style>
