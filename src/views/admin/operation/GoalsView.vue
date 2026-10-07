<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import GoalCard from '@/components/admin/operation/GoalCard.vue'
import GoalSheet from '@/components/admin/operation/GoalSheet.vue'
import { useGoalEntry } from '@/composables/operation/useGoalEntry'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { pct } from '@/config/operationLabels'
import { errorMessage, money, monthLabel } from '@/utils/format'
import type { GoalRow } from '@/types/operation'

const toast = useToastStore()
const user = useUserStore()
const { month, data, loading, load, items, summary, statuses, commit } = useGoalEntry()
const canEdit = computed(() => user.isAdmin || user.user?.role === 'manager')
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
    <PageIntro text="Escribe la meta de cada operador por mes. La producción y el % de cumplimiento salen solos." />

    <div class="top">
      <MonthNav v-model="month" label="Mes" />
      <button v-if="canEdit" type="button" class="btn btn--ghost btn--sm" @click="copyOpen = true"><AppIcon name="copy" :size="16" /> Copiar del mes anterior</button>
    </div>

    <KpiRow v-if="data">
      <KpiCard label="Meta total" :value="money(summary.goalTotal)" icon="flag" />
      <KpiCard label="Producción operadores" :value="money(summary.production)" icon="chart" tone="aqua" :hint="`Empresa: ${money(summary.companyProduction)}`" />
      <KpiCard label="Cumplimiento" :value="pct(summary.compliance)" icon="star" :tone="(summary.compliance ?? 0) >= 1 ? 'success' : 'warning'" />
      <KpiCard label="Cumplen meta" :value="`${summary.meeting} de ${summary.meeting + summary.notMeeting}`" icon="check" tone="success" :hint="summary.withoutGoal ? `${summary.withoutGoal} sin meta` : ''" />
    </KpiRow>

    <p class="note"><AppIcon name="info" :size="16" /> Escribe la meta en cada tarjeta y pulsa Enter: se guarda sola y pasa al siguiente.<template v-if="data?.inProgress"> "En curso" = todavía puede llegar.</template></p>

    <div v-if="loading && !data" class="cards"><span v-for="i in 4" :key="i" class="skeleton" style="height: 170px"></span></div>
    <EmptyState v-else-if="!items.length" title="No hay operadores activos" text="Agrega a los lavadores en Personal para fijarles una meta." icon="users">
      <RouterLink to="/admin/personal" class="btn btn--primary">Ir a Personal</RouterLink>
    </EmptyState>
    <div v-else class="cards" data-grid>
      <GoalCard v-for="(r, i) in items" :key="r.operator" :row="r" :index="i" :status="statuses[r.operator] || ''" :editable="canEdit" @edit="editing = $event" @commit="commit(i, $event)" />
    </div>

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
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;

  > :first-child {
    flex: 1 1 260px;
    max-width: 360px;
  }
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
