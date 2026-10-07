<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import MonthNav from '@/components/admin/sheet/MonthNav.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import SheetTable from '@/components/admin/sheet/SheetTable.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import CommissionDaily from '@/components/admin/operation/CommissionDaily.vue'
import CommissionRulesSheet from '@/components/admin/operation/CommissionRulesSheet.vue'
import AdjustmentSheet from '@/components/admin/operation/AdjustmentSheet.vue'
import { describeTiers, useCommissions } from '@/composables/operation/useCommissions'
import { managementService } from '@/services/management.service'
import { useUserStore } from '@/stores/user'
import { money, shortDate } from '@/utils/format'
import type { OperatorOption } from '@/types/operation'

const c = useCommissions()
const user = useUserStore()
const staff = ref<OperatorOption[]>([])
if (user.isAdmin) managementService.users().then((u) => (staff.value = u.filter((x) => x.active).map((x) => ({ _id: x._id, name: x.name, color: x.color, branches: x.branches })))).catch(() => {})

const rule = computed(() => c.data.value?.rule)
const s = computed(() => c.data.value?.summary)
const opChoices = computed(() => (c.data.value?.operators || []).map((o) => ({ value: o._id, label: o.name, color: o.color })))
const rulesOpen = ref(false)
const adjOpen = ref(false)
const removing = ref<{ _id: string; name: string; amount: number } | null>(null)
const busy = ref(false)

async function confirmRemove() {
  if (!removing.value) return
  busy.value = true
  if (await c.removeAdjustment(removing.value._id)) removing.value = null
  busy.value = false
}
function reload(kind: 'rules' | 'adj') {
  if (kind === 'rules') rulesOpen.value = false
  else adjOpen.value = false
  c.load()
}
</script>

<template>
  <section>
    <PageIntro text="FEE diario: lo que gana cada operador sobre lo que produce por encima de la base del día, y el FEE del supervisor. Se calcula solo con la producción registrada, igual que las hojas FEE del Excel.">
      <template v-if="user.isAdmin">
        <button type="button" class="btn btn--ghost" @click="rulesOpen = true"><AppIcon name="settings" /> Reglas del FEE</button>
        <button type="button" class="btn btn--primary" @click="adjOpen = true"><AppIcon name="plus" /> Ajuste manual</button>
      </template>
    </PageIntro>

    <div class="top"><MonthNav v-model="c.month.value" /></div>

    <KpiRow v-if="s">
      <KpiCard label="FEE operadores" :value="money(s.operators)" icon="users" :hint="`Q1 ${money(s.q1.operators)} · Q2 ${money(s.q2.operators)}`" />
      <KpiCard label="FEE supervisor" :value="money(s.supervisor)" icon="user" tone="aqua" :hint="`Q1 ${money(s.q1.supervisor)} · Q2 ${money(s.q2.supervisor)}`" />
      <KpiCard label="Total comisiones" :value="money(s.total)" icon="wallet" tone="warning" />
      <KpiCard label="Producción" :value="money(s.production)" icon="chart" tone="success" hint="De los operadores del mes" />
    </KpiRow>

    <details v-if="rule" class="how">
      <summary><AppIcon name="info" :size="16" /> ¿Cómo se calcula?</summary>
      <p>Base diaria <strong>{{ money(rule.dailyBase) }}</strong>. Excedente = producción del día − base. Si hay excedente, el operador gana:</p>
      <ul><li v-for="t in describeTiers(rule.tiers)" :key="t">{{ t }}</li></ul>
      <p>El supervisor gana <strong>{{ rule.supervisorPercent }} %</strong> del excedente de cada operador que supervisa.</p>
      <p v-for="e in rule.exceptions" :key="e.operator" class="how__exc">{{ e.name }}: {{ describeTiers(e.tiers).join(' · ') }}<template v-if="e.note"> ({{ e.note }})</template></p>
    </details>

    <div v-if="c.loading.value && !c.data.value" class="skeleton" style="height: 320px"></div>
    <EmptyState v-else-if="!c.data.value?.operators.length" title="Sin comisiones este mes" text="Las comisiones aparecen solas cuando registras la producción del día con su operador." icon="wallet">
      <RouterLink to="/admin/produccion/registrar" class="btn btn--primary"><AppIcon name="plus" /> Registrar producción</RouterLink>
    </EmptyState>
    <template v-else-if="c.data.value">
      <h2 class="h">Por operador</h2>
      <SheetTable caption="FEE por operador y quincena" compact>
        <thead>
          <tr><th>Operador</th><th class="num">Producción</th><th class="num">FEE Q1</th><th class="num">FEE Q2</th><th class="num">Ajustes</th><th class="num">Total a pagar</th></tr>
        </thead>
        <tbody>
          <tr v-for="t in c.data.value.totals" :key="t.operator">
            <td>{{ t.name }}</td>
            <td class="num">{{ money(t.production) }}</td>
            <td class="num">{{ money(t.q1.fee + t.q1.adjustments) }}</td>
            <td class="num">{{ money(t.q2.fee + t.q2.adjustments) }}</td>
            <td class="num" :class="{ neg: t.adjustments < 0 }">{{ t.adjustments ? money(t.adjustments) : '—' }}</td>
            <td class="num"><strong>{{ money(t.total) }}</strong></td>
          </tr>
          <tr v-for="sp in c.data.value.supervisors" :key="sp.supervisor || 'none'" class="is-sub">
            <td>FEE supervisor · {{ sp.name }}</td>
            <td></td>
            <td class="num">{{ money(sp.q1) }}</td>
            <td class="num">{{ money(sp.q2) }}</td>
            <td></td>
            <td class="num"><strong>{{ money(sp.total) }}</strong></td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="is-total"><td>TOTAL</td><td class="num">{{ money(s?.production) }}</td><td class="num">{{ money(s?.q1.total) }}</td><td class="num">{{ money(s?.q2.total) }}</td><td></td><td class="num">{{ money(s?.total) }}</td></tr>
        </tfoot>
      </SheetTable>

      <h2 class="h">Detalle por día</h2>
      <ChoiceChips v-model="c.operator.value" :options="opChoices" label="Operador" small class="ops" />
      <CommissionDaily :days="c.days.value" :total="c.selectedTotals.value" />

      <template v-if="c.data.value.adjustments.length">
        <h2 class="h">Ajustes manuales</h2>
        <ul class="adj">
          <li v-for="a in c.data.value.adjustments" :key="a._id">
            <span><strong>{{ a.name }}</strong> · {{ shortDate(a.date) }} · {{ a.kind === 'supervisor' ? 'FEE supervisor' : 'FEE' }}<small>{{ a.note }}</small></span>
            <strong class="money" :class="{ neg: a.amount < 0 }">{{ money(a.amount) }}</strong>
            <button v-if="user.isAdmin" type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar ajuste" @click="removing = a"><AppIcon name="trash" :size="16" /></button>
          </li>
        </ul>
      </template>
    </template>

    <CommissionRulesSheet :open="rulesOpen" :rule="rule || null" :operators="staff" @close="rulesOpen = false" @saved="reload('rules')" />
    <AdjustmentSheet :open="adjOpen" :operators="staff" :month="c.month.value" @close="adjOpen = false" @saved="reload('adj')" />
    <ConfirmSheet
      :open="!!removing"
      title="Eliminar ajuste"
      :message="removing ? `Se quita el ajuste de ${money(removing.amount)} a ${removing.name}. El total del mes se recalcula.` : ''"
      confirm-label="Eliminar"
      danger
      :busy="busy"
      @close="removing = null"
      @confirm="confirmRemove"
    />
  </section>
</template>

<style scoped lang="scss">
.top {
  max-width: 360px;
  margin-bottom: 1rem;
}

.h {
  font-size: $text-base;
  color: $navy;
  margin: 1.4rem 0 0.6rem;
}

.ops {
  margin-bottom: 0.7rem;
}

.how {
  @include card(0.8rem 1rem);
  margin-bottom: 0.5rem;
  font-size: $text-sm;
  color: $ink-soft;

  summary {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 32px;
    font-weight: 700;
    color: $navy;
    cursor: pointer;
  }

  p,
  ul {
    margin-top: 0.5rem;
  }

  ul {
    padding-left: 1.2rem;
  }

  &__exc {
    font-style: italic;
  }
}

.adj {
  list-style: none;
  @include card(0.3rem 0.9rem);

  li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    font-size: $text-sm;

    + li {
      border-top: 1px solid $line;
    }

    > span {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    small {
      color: $ink-muted;
    }
  }
}

.neg {
  color: $danger;
}
</style>
