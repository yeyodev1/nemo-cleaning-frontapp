<script setup lang="ts">
import { computed } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import IncomeChart from '@/components/admin/dashboard/IncomeChart.vue'
import RankList from '@/components/admin/dashboard/RankList.vue'
import AlertCards from '@/components/admin/dashboard/AlertCards.vue'
import BookingRow from '@/components/admin/bookings/BookingRow.vue'
import { useDashboard } from '@/composables/admin/useDashboard'
import { money } from '@/utils/format'

const { range, data, loading, error, load } = useDashboard()

const services = computed(() => (data.value?.topServices || []).map((s) => ({ name: s.name, count: s.quantity, amount: s.amount })))
const operators = computed(() => (data.value?.byOperator || []).map((s) => ({ name: s.name, count: s.bookings, amount: s.amount })))
</script>

<template>
  <div class="dash">
    <div class="dash__range">
      <label class="field">
        <span class="field__label">Desde</span>
        <input v-model="range.from" type="date" />
      </label>
      <label class="field">
        <span class="field__label">Hasta</span>
        <input v-model="range.to" type="date" :min="range.from" />
      </label>
      <RouterLink to="/admin/pedidos/nuevo" class="btn btn--primary dash__new"><AppIcon name="plus" /> Nuevo pedido</RouterLink>
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
      <AlertCards :data="data" />

      <section aria-labelledby="hoy">
        <h2 id="hoy" class="dash__h">Hoy</h2>
        <div class="dash__kpis">
          <KpiCard label="Pedidos" :value="data.today.bookings" icon="calendar" />
          <KpiCard label="Terminados" :value="data.today.completed" icon="check-circle" tone="success" />
          <KpiCard label="Pendientes" :value="data.today.pending" icon="clock" tone="warning" />
          <KpiCard label="Ingreso" :value="money(data.today.income)" icon="cash" tone="aqua" />
        </div>
      </section>

      <section aria-labelledby="periodo">
        <h2 id="periodo" class="dash__h">Período</h2>
        <div class="dash__kpis">
          <KpiCard label="Pedidos" :value="data.period.bookings" icon="list" />
          <KpiCard label="Ingresos" :value="money(data.period.income)" icon="wallet" tone="aqua" />
          <KpiCard label="Gastos" :value="money(data.period.expenses)" icon="receipt" tone="danger" />
          <KpiCard label="Neto" :value="money(data.period.net)" icon="chart" :tone="data.period.net >= 0 ? 'success' : 'danger'" />
          <KpiCard label="Ticket promedio" :value="money(data.period.averageTicket)" icon="tag" />
        </div>
      </section>

      <section class="card">
        <h2 class="dash__h dash__h--card">Ingresos por día</h2>
        <IncomeChart :data="data.incomeByDay" />
      </section>

      <div class="dash__cols">
        <RankList title="Servicios más vendidos" :rows="services" count-label="unidades" />
        <RankList title="Producción por operador" :rows="operators" count-label="pedidos" />
      </div>

      <section>
        <div class="dash__head">
          <h2 class="dash__h">Próximos servicios</h2>
          <RouterLink to="/admin/agenda" class="btn btn--soft btn--sm">Ver agenda</RouterLink>
        </div>
        <div v-if="data.upcoming.length" class="dash__list">
          <BookingRow v-for="b in data.upcoming" :key="b._id" :booking="b" />
        </div>
        <p v-else class="card empty">No hay servicios próximos.</p>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.dash {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__range {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;

    .field {
      flex: 1 1 140px;
      max-width: 200px;
    }
  }

  &__new {
    margin-left: auto;

    @include until('md') {
      width: 100%;
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
    margin-bottom: 0.65rem;

    &--card {
      margin-bottom: 1rem;
    }
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

  &__kpis {
    @include flex-cards(150px, 0.65rem);
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
