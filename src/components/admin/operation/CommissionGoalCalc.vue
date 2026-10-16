<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { errorMessage, money, monthISO, monthLabel } from '@/utils/format'
import type { GoalCommissionRow, GoalCommissionSheet } from '@/types/operation'
import type { GridRow } from '@/types/grid'

/**
 * Comisión por meta mensual: (producción del mes − meta) × % de la sucursal.
 * Por operador muestra su avance, el cálculo escrito y "Pasar a Comisiones".
 */
const emit = defineEmits<{ how: [] }>()
const scope = useAdminScope()
const toast = useToastStore()
const me = useUserStore()
const month = ref(monthISO())
const sheet = ref<GoalCommissionSheet | null>(null)
const loading = ref(false)
const manual = ref<GridRow[]>([])
const busy = ref('')

async function load() {
  loading.value = true
  try {
    const [s, m] = await Promise.all([
      operationService.commissionGoalSheet(month.value, scope.query),
      operationService.commissionEntries(Number(month.value.slice(0, 4)), scope.query).catch(() => ({ rows: [] as GridRow[] })),
    ])
    sheet.value = s
    manual.value = m.rows
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    loading.value = false
  }
}
watch([month, toRef(scope, 'branch')], load, { immediate: true })

const idx = computed(() => Number(month.value.slice(5, 7)) - 1)
function written(op: string, branch: string) {
  const row = manual.value.find((r) => r.user === op && (r.branch === branch || !r.branch))
  return row ? row.months[idx.value] : null
}
const isWritten = (r: GoalCommissionRow) => r.branches.every((b) => written(r.operator, b.branch) === b.commission)

async function pass(r: GoalCommissionRow) {
  busy.value = r.operator
  try {
    for (const b of r.branches) await operationService.saveCommissionEntry({ user: r.operator, month: month.value, amount: b.commission, branch: b.branch || undefined })
    toast.success(`Comisión de ${r.name} en ${monthLabel(month.value)}: ${money(r.commission)}`)
    await load()
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <div class="gc">
    <div class="gc__top">
      <MonthNav v-model="month" />
      <div v-if="sheet" class="gc__pcts">
        <span v-for="p in sheet.percents" :key="p.branch" class="gc__pct"><b>{{ p.percent }} %</b> {{ p.name }}</span>
        <button type="button" class="btn btn--ghost btn--sm" @click="emit('how')"><AppIcon name="settings" :size="15" /> Cambiar</button>
      </div>
    </div>

    <p class="gc__rule"><AppIcon name="info" :size="18" /> <span>Comisión = <b>(producción del mes − meta del mes)</b> × <b>% de la sucursal</b>. Si no llega a la meta, no hay comisión.</span></p>

    <KpiRow v-if="sheet">
      <KpiCard label="Comisión del mes" :value="money(sheet.summary.commission)" icon="wallet" tone="success" :hint="`${sheet.summary.overGoal} pasaron su meta`" />
      <KpiCard label="Producción" :value="money(sheet.summary.production)" icon="chart" />
      <KpiCard label="Sin meta" :value="String(sheet.summary.withoutGoal)" icon="flag" :tone="sheet.summary.withoutGoal ? 'warning' : 'success'" :hint="sheet.summary.withoutGoal ? 'Ponla en Metas mensuales' : 'Todos tienen meta'" />
    </KpiRow>

    <p v-if="sheet?.summary.withoutGoal" class="gc__warn">
      <AppIcon name="alert" :size="18" />
      <span>{{ sheet.summary.withoutGoal }} operador(es) no tienen meta en {{ monthLabel(month) }}: sin meta no se calcula su comisión.</span>
      <RouterLink to="/admin/metas" class="btn btn--soft btn--sm">Poner metas</RouterLink>
    </p>

    <div v-if="loading && !sheet" class="skeleton" style="height: 300px"></div>
    <div v-else-if="!sheet?.items.length" class="card empty">
      <AppIcon name="wallet" :size="28" style="margin: 0 auto 0.5rem" />
      Aún no hay producción de operadores ni metas en {{ monthLabel(month) }}.
    </div>
    <ul v-else class="gc__list">
      <li v-for="r in sheet.items" :key="r.operator" class="gc__card" :style="{ '--op': r.color || '#1E2D3A' }">
        <div class="gc__head">
          <span class="gc__avatar">{{ r.name.charAt(0) }}</span>
          <div class="gc__who">
            <strong>{{ r.name }}</strong>
            <small v-if="r.goal !== null">Meta {{ money(r.goal) }} · produjo {{ money(r.production) }}</small>
            <small v-else class="gc__nogoal">Sin meta este mes · produjo {{ money(r.production) }}</small>
          </div>
          <div class="gc__total" :class="{ 'is-zero': !r.commission }">
            <small>Comisión</small>
            <strong>{{ money(r.commission) }}</strong>
          </div>
        </div>

        <div v-if="r.goal !== null" class="gc__bar" :aria-label="`Avance ${r.progress} % de la meta`">
          <span class="gc__fill" :class="{ 'is-over': (r.progress || 0) >= 100 }" :style="{ width: `${Math.min(100, r.progress || 0)}%` }"></span>
          <b>{{ r.progress }} %</b>
        </div>
        <p v-if="r.goal !== null && r.excess <= 0" class="gc__left">Le faltan {{ money(r.goal - r.production) }} para llegar a la meta.</p>

        <ul v-if="r.excess > 0" class="gc__calc">
          <li v-for="b in r.branches" :key="b.branch">
            <span>{{ b.name }}</span>
            <span class="gc__formula">{{ money(b.excess) }} sobre la meta × {{ b.percent }} %</span>
            <b>{{ money(b.commission) }}</b>
          </li>
        </ul>

        <div v-if="me.isAdmin && r.commission > 0" class="gc__actions">
          <button type="button" class="btn btn--soft btn--sm" :disabled="busy === r.operator || isWritten(r)" @click="pass(r)">
            <AppIcon :name="isWritten(r) ? 'check' : 'copy'" :size="15" />
            {{ isWritten(r) ? 'Ya está en Comisiones' : busy === r.operator ? 'Pasando…' : 'Pasar a Comisiones' }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.gc {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;

  &__top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__pcts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
  }

  &__pct {
    padding: 0.35rem 0.75rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
    font-size: $text-sm;

    b {
      font-size: $text-base;
    }
  }

  &__rule,
  &__warn {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.8rem 1rem;
    border-radius: $radius-md;
    font-size: $text-sm;

    span {
      flex: 1 1 240px;
    }
  }

  &__rule {
    background: $sky;
    color: $ink;
  }

  &__warn {
    background: $warning-bg;
    color: $warning;
  }

  &__list {
    list-style: none;
    display: grid;
    gap: 0.75rem;

    @include from('lg') {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem;
    border-radius: $radius-md;
    border: 1px solid $line;
    border-top: 4px solid var(--op);
    background: $surface;
    box-shadow: $shadow-sm;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  &__avatar {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--op);
    color: #fff;
    font-weight: 800;
  }

  &__who {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__nogoal {
    color: $warning !important;
    font-weight: 700;
  }

  &__total {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }

    strong {
      font-size: $text-xl;
      color: $success;
    }

    &.is-zero strong {
      color: $ink-muted;
    }
  }

  &__bar {
    position: relative;
    height: 22px;
    border-radius: $radius-pill;
    background: $line;
    overflow: hidden;

    b {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: $text-xs;
      color: $ink;
    }
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: $radius-pill;
    background: $warning;
    opacity: 0.55;

    &.is-over {
      background: $success;
    }
  }

  &__left {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__calc {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    li {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.25rem 0.6rem;
      padding: 0.5rem 0.7rem;
      border-radius: $radius-sm;
      background: $success-bg;
      font-size: $text-sm;
    }

    b {
      margin-left: auto;
      color: $success;
    }
  }

  &__formula {
    color: $ink-soft;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
