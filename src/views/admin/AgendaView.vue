<script setup lang="ts">
import { ref } from 'vue'
import DateNav from '@/components/admin/agenda/DateNav.vue'
import AgendaCard from '@/components/admin/agenda/AgendaCard.vue'
import BookingQuickSheet from '@/components/admin/agenda/BookingQuickSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAgenda } from '@/composables/admin/useAgenda'
import { useAdminScope } from '@/stores/adminScope'
import type { Booking } from '@/types/api'

const scope = useAdminScope()
const { date, loading, error, load, bookings, cancelled, byTime, columns, replace } = useAgenda()
const selected = ref<Booking | null>(null)

function onUpdated(b: Booking) {
  replace(b)
  selected.value = null
}
</script>

<template>
  <div class="agenda">
    <div class="agenda__bar">
      <DateNav v-model="date" />
      <RouterLink to="/admin/pedidos/nuevo" class="btn btn--primary btn--sm"><AppIcon name="plus" :size="16" /> Pedido</RouterLink>
    </div>

    <p v-if="!scope.branch && scope.canSeeAll" class="agenda__hint"><AppIcon name="info" :size="16" /> Viendo todas las sucursales. Elige una arriba para ver solo su agenda.</p>

    <div v-if="error" class="card agenda__error" role="alert">
      <AppIcon name="alert" /> <span>{{ error }}</span>
      <button type="button" class="btn btn--ghost btn--sm" @click="load">Reintentar</button>
    </div>

    <div v-else-if="loading && !bookings.length" class="agenda__list">
      <span v-for="n in 3" :key="n" class="skeleton" style="height: 96px"></span>
    </div>

    <div v-else-if="!bookings.length" class="card empty">
      <AppIcon name="calendar" :size="28" style="margin: 0 auto 0.5rem" />
      No hay servicios agendados para este día.
    </div>

    <template v-else>
      <p class="agenda__count">{{ bookings.length }} servicio{{ bookings.length === 1 ? '' : 's' }}</p>
      <!-- Móvil/tablet: agrupado por hora -->
      <div class="agenda__list agenda__mobile">
        <section v-for="g in byTime" :key="g.time" class="agenda__group">
          <h2 class="agenda__time">{{ g.time }}</h2>
          <div class="agenda__stack">
            <AgendaCard v-for="b in g.items" :key="b._id" :booking="b" @open="selected = $event" />
          </div>
        </section>
      </div>
      <!-- Escritorio: columnas por operador -->
      <div class="agenda__cols">
        <section v-for="c in columns" :key="c.id" class="agenda__col">
          <h2 class="agenda__colhead"><span class="agenda__dot" :style="{ background: c.color }"></span>{{ c.name }} <small>{{ c.items.length }}</small></h2>
          <div class="agenda__stack">
            <AgendaCard v-for="b in c.items" :key="b._id" :booking="b" show-time @open="selected = $event" />
            <p v-if="!c.items.length" class="agenda__free">Libre</p>
          </div>
        </section>
      </div>
    </template>

    <p v-if="cancelled.length" class="agenda__cancelled">{{ cancelled.length }} cancelado{{ cancelled.length === 1 ? '' : 's' }} este día.</p>

    <BookingQuickSheet :booking="selected" @close="selected = null" @updated="onUpdated" />
  </div>
</template>

<style scoped lang="scss">
.agenda {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__bar {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;

    > :first-child {
      flex: 1 1 280px;
    }
  }

  &__hint {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    font-size: $text-xs;
    color: $ink-muted;
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

  &__count {
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-muted;
  }

  &__list,
  &__stack {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__mobile {
    @include from('lg') {
      display: none;
    }
  }

  &__group {
    display: flex;
    gap: 0.75rem;
  }

  &__time {
    width: 52px;
    flex-shrink: 0;
    font-size: $text-sm;
    color: $navy;
    padding-top: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  &__group &__stack {
    flex: 1;
    min-width: 0;
  }

  &__cols {
    display: none;

    @include from('lg') {
      display: flex;
      gap: 0.85rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
  }

  &__col {
    flex: 0 0 260px;
    background: $sky;
    border: 1px solid $line;
    border-radius: $radius-md;
    padding: 0.75rem;
  }

  &__colhead {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: $text-sm;
    margin-bottom: 0.75rem;

    small {
      margin-left: auto;
      color: $ink-muted;
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &__free {
    font-size: $text-xs;
    color: $ink-muted;
    text-align: center;
    padding: 1rem 0;
  }

  &__cancelled {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
