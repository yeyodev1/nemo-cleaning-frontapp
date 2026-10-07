<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import GoalCard from '@/components/admin/operation/GoalCard.vue'
import GoalSheet from '@/components/admin/operation/GoalSheet.vue'
import { useReport } from '@/composables/admin/useReport'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { pct } from '@/config/operationLabels'
import { errorMessage, money, monthISO, monthLabel } from '@/utils/format'
import type { GoalRow } from '@/types/operation'

const scope = useAdminScope()
const toast = useToastStore()
const month = ref(monthISO())
const branch = toRef(scope, 'branch')
const { data, loading, load } = useReport(() => operationService.goals(month.value, scope.query), [month, branch])

// Primero quienes tienen meta (de menor a mayor cumplimiento: los que necesitan atención arriba).
const items = computed(() =>
  [...(data.value?.items || [])].sort((a, b) => Number(!a.goal) - Number(!b.goal) || (a.compliance ?? 0) - (b.compliance ?? 0)),
)
const summary = computed(() => data.value?.summary)
const prevMonth = computed(() => {
  const [y = 2026, m = 1] = month.value.split('-').map(Number)
  return new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7)
})

const editing = ref<GoalRow | null>(null)
function onSaved() {
  editing.value = null
  load()
}

const copyOpen = ref(false)
const copying = ref(false)
async function copy() {
  copying.value = true
  try {
    const r = await operationService.copyGoals(prevMonth.value, month.value)
    toast.success(`${r.copied} meta(s) copiadas`)
    copyOpen.value = false
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    copying.value = false
  }
}
</script>

<template>
  <section>
    <PageIntro text="Meta de producción de cada operador en el mes. La producción real sale sola de los servicios registrados; aquí ves quién cumple y cuánto le falta.">
      <button type="button" class="btn btn--ghost" @click="copyOpen = true"><AppIcon name="copy" /> Copiar metas del mes anterior</button>
    </PageIntro>

    <div class="top"><MonthNav v-model="month" label="Mes a revisar" /></div>

    <KpiRow v-if="summary">
      <KpiCard label="Meta total" :value="money(summary.goalTotal)" icon="flag" />
      <KpiCard label="Producción operadores" :value="money(summary.production)" icon="chart" tone="aqua" :hint="`Empresa: ${money(summary.companyProduction)}`" />
      <KpiCard label="Cumplimiento" :value="pct(summary.compliance)" icon="star" :tone="(summary.compliance ?? 0) >= 1 ? 'success' : 'warning'" />
      <KpiCard label="Cumplen meta" :value="`${summary.meeting} de ${summary.meeting + summary.notMeeting}`" icon="check" tone="success" :hint="summary.withoutGoal ? `${summary.withoutGoal} sin meta` : ''" />
    </KpiRow>

    <p v-if="data?.inProgress && summary?.goalTotal" class="note"><AppIcon name="info" :size="16" /> El mes está en curso: "En curso" significa que todavía puede llegar a la meta.</p>

    <div v-if="loading && !data" class="cards"><span v-for="i in 4" :key="i" class="skeleton" style="height: 170px"></span></div>
    <EmptyState v-else-if="!items.length" title="No hay operadores activos" text="Agrega a los lavadores en Personal para fijarles una meta." icon="users">
      <RouterLink to="/admin/personal" class="btn btn--primary">Ir a Personal</RouterLink>
    </EmptyState>
    <TransitionGroup v-else name="fade-up" tag="div" class="cards">
      <GoalCard v-for="r in items" :key="r.operator" :row="r" @edit="editing = $event" />
    </TransitionGroup>

    <GoalSheet :row="editing" :month="month" @close="editing = null" @saved="onSaved" />
    <ConfirmSheet
      :open="copyOpen"
      title="Copiar metas"
      :message="`Se copian las metas de ${monthLabel(prevMonth)} a ${monthLabel(month)}. Las metas que ya tengas en ${monthLabel(month)} no se tocan.`"
      confirm-label="Copiar metas"
      :busy="copying"
      @close="copyOpen = false"
      @confirm="copy"
    />
  </section>
</template>

<style scoped lang="scss">
.top {
  max-width: 360px;
  margin-bottom: 1rem;
}

.note {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  font-size: $text-sm;
  color: $ink-soft;
  margin-bottom: 0.85rem;
}

.cards {
  @include flex-cards(300px, 0.75rem);
}
</style>
