<script setup lang="ts">
import { computed } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import IncomeChart from '@/components/admin/dashboard/IncomeChart.vue'
import RankList from '@/components/admin/dashboard/RankList.vue'
import AlertCards from '@/components/admin/dashboard/AlertCards.vue'
import BookingRow from '@/components/admin/bookings/BookingRow.vue'
import { useDashboard } from '@/composables/admin/useDashboard'
import { fortnightLabel, money, monthISO, monthLabel, shortDate } from '@/utils/format'

const { range, data, loading, error, load } = useDashboard()

const services = computed(() => (data.value?.topServices || []).map((s) => ({ name: s.name, count: s.quantity, amount: s.amount })))
const operators = computed(() =>
  (data.value?.byOperator || []).slice(0, 6).map((s) => ({ name: s.name, count: s.bookings, amount: s.amount })),
)
const month = monthISO()
const prod = computed(() => data.value?.production)
const rangeLabel = computed(() => `${shortDate(range.value.from)} – ${shortDate(range.value.to)}`)
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
</script>

<template>
  <div class="dash" :class="{ 'is-stale': loading && !!data }" :aria-busy="loading">
    <div class="dash__actions">
      <RouterLink to="/admin/produccion/registrar" class="btn btn--primary"><AppIcon name="plus" /> Registrar servicio</RouterLink>
      <RouterLink to="/admin/pedidos/nuevo" class="btn btn--ghost"><AppIcon name="calendar" /> Agendar pedido</RouterLink>
    </div>

    <div v-if="error" class="card dash__error" role="alert">
      <AppIcon name="alert" /> <span>{{ error }}</span>
      <button type="button" class="btn btn--ghost btn--sm" @click="load">Reintentar</button>
    </div>

    <template v-if="loading && !data">
      <div class="dash__kpis">
        <span v-for="n in 4" :key="n" class="skeleton dash__ghost"></span>
      </div>
      <span class="skeleton dash__ghost dash__ghost--tall"></span>
    </template>

    <template v-else-if="data">
      <section v-if="prod" aria-labelledby="prod">
        <h2 id="prod" class="dash__h">Producción</h2>
        <p class="dash__sub">Lo facturado por servicios realizados (no es lo cobrado).</p>
        <div class="dash__kpis">
          <KpiCard label="Hoy" :value="money(prod.today.amount)" :hint="count(prod.today.bookings, 'servicio', 'servicios')" icon="clock" tone="aqua" />
          <KpiCard
            label="Esta quincena"
            :value="money(prod.fortnightToDate.amount)"
            :hint="fortnightLabel(month, prod.fortnight, true)"
            icon="layers"
          />
          <KpiCard
            label="Este mes"
            :value="money(prod.monthToDate.amount)"
            :hint="`${monthLabel(month)} · ${count(prod.monthToDate.bookings, 'servicio', 'servicios')}`"
            icon="chart"
            tone="success"
          />
          <KpiCard label="Ticket promedio" :value="money(data.period.averageTicket)" :hint="rangeLabel" icon="tag" />
        </div>
      </section>

      <AlertCards :data="data" />

      <section aria-labelledby="hoy">
        <div class="dash__head">
          <h2 id="hoy" class="dash__h">Hoy en agenda</h2>
          <RouterLink to="/admin/agenda" class="btn btn--soft btn--sm">Ver agenda</RouterLink>
        </div>
        <div class="dash__today card">
          <span><strong>{{ data.today.bookings }}</strong> pedidos</span>
          <span><strong>{{ data.today.completed }}</strong> terminados</span>
          <span><strong>{{ data.today.pending }}</strong> sin confirmar</span>
          <span><strong class="money">{{ money(data.today.income) }}</strong> cobrado</span>
        </div>
      </section>

      <div class="dash__cols">
        <RankList title="Mejores operadores" :subtitle="`Producción · ${rangeLabel}`" :rows="operators" count-label="servicios" count-label-one="servicio" />
        <RankList title="Servicios más vendidos" :subtitle="rangeLabel" :rows="services" count-label="unidades" count-label-one="unidad" />
      </div>

      <section class="card dash__money" aria-labelledby="caja">
        <div class="dash__money-head">
          <div>
            <h2 id="caja" class="dash__h">Cobrado y gastos</h2>
            <p class="dash__sub">Dinero que entró (pagos aprobados) y gastos del periodo elegido.</p>
          </div>
          <div class="dash__range">
            <label class="field">
              <span class="field__label">Desde</span>
              <input v-model="range.from" type="date" />
            </label>
            <label class="field">
              <span class="field__label">Hasta</span>
              <input v-model="range.to" type="date" :min="range.from" />
            </label>
          </div>
        </div>
        <div class="dash__kpis">
          <KpiCard label="Cobrado" :value="money(data.period.income)" icon="wallet" tone="aqua" />
          <KpiCard label="Gastos" :value="money(data.period.expenses)" icon="receipt" tone="danger" />
          <KpiCard
            label="Cobrado − gastos"
            :value="money(data.period.net)"
            icon="cash"
            :tone="data.period.net >= 0 ? 'success' : 'danger'"
          />
        </div>
        <h3 class="dash__h dash__h--chart">Cobrado por día</h3>
        <IncomeChart :data="data.incomeByDay" />
      </section>

      <section>
        <h2 class="dash__h">Próximos servicios</h2>
        <div v-if="data.upcoming.length" class="dash__list">
          <BookingRow v-for="b in data.upcoming" :key="b._id" :booking="b" />
        </div>
        <p v-else class="card empty">No hay servicios agendados. Los pedidos de la web y los que agendes aparecen aquí.</p>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
// Al cambiar sucursal o rango, lo anterior se atenúa hasta que llegan los datos nuevos.
.is-stale > :not(.dash__actions) {
  opacity: 0.45;
  transition: opacity $dur-fast ease;
  pointer-events: none;
}

.dash {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;

    .btn {
      min-height: 48px;
      padding-inline: 0.5rem;
    }

    @include from('md') {
      display: flex;
      justify-content: flex-end;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: $danger;
    flex-wrap: wrap;

    span {
      flex: 1;
    }
  }

  &__h {
    font-size: $text-base;
    margin-bottom: 0.2rem;

    &--chart {
      margin: 1.25rem 0 0.75rem;
      font-size: $text-sm;
    }
  }

  &__sub {
    font-size: $text-xs;
    color: $ink-muted;
    margin-bottom: 0.7rem;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.65rem;

    .dash__h {
      margin: 0;
    }
  }

  &__today {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem 1rem;
    font-size: $text-sm;
    color: $ink-muted;

    strong {
      display: block;
      font-size: $text-lg;
      color: $ink;
      font-variant-numeric: tabular-nums;
    }

    @include from('md') {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__kpis {
    @include flex-cards(150px, 0.65rem);
  }

  &__money-head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    margin-bottom: 0.75rem;
  }

  &__range {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.6rem;
    flex: 1 1 280px;
    min-width: 0;
    max-width: 420px;

    .field {
      flex: 1 1 0;
      min-width: 0;
    }

    input {
      width: 100%;
      min-width: 0;
    }
  }

  &__ghost {
    height: 110px;

    &--tall {
      height: 220px;
    }
  }

  &__cols {
    @include flex-cards(300px, 1rem);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
