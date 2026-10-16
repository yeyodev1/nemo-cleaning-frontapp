<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import ServiceNovedadComposer from '@/components/admin/operation/ServiceNovedadComposer.vue'
import { useReport } from '@/composables/admin/useReport'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { addDays, dateTime, errorMessage, longDate, shortDate, todayISO, weekStart } from '@/utils/format'
import type { NovedadRow } from '@/types/operation'

/** Novedades de los servicios por semana: registrar aquí mismo, filtrar por operador y ver por día. */
const scope = useAdminScope()
const toast = useToastStore()
const from = ref(weekStart(todayISO()))
const to = computed(() => addDays(from.value, 6))
const branch = toRef(scope, 'branch')
const { data, loading, load } = useReport(() => operationService.novedades({ from: from.value, to: to.value, branch: scope.query }), [from, branch])
const isThisWeek = computed(() => from.value === weekStart(todayISO()))

const adding = ref(false)
function onSaved() {
  adding.value = false
  // La novedad nueva es de un servicio de algún día: se vuelve a la semana actual para verla.
  load()
}

const items = computed(() => data.value?.items || [])
const opFilter = ref('')
const operators = computed(() => {
  const map = new Map<string, { _id: string; name: string; color?: string; count: number }>()
  for (const n of items.value) {
    const key = n.operator?._id || '__none'
    const cur = map.get(key) || { _id: key, name: n.operator?.name || 'Sin operador', color: n.operator?.color, count: 0 }
    cur.count++
    map.set(key, cur)
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
})
const shown = computed(() => (opFilter.value ? items.value.filter((n) => (n.operator?._id || '__none') === opFilter.value) : items.value))

/** Agrupadas por el día en que se registraron. */
const byDay = computed(() => {
  const groups = new Map<string, NovedadRow[]>()
  for (const n of shown.value) {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil' }).format(new Date(n.at))
    groups.set(day, [...(groups.get(day) || []), n])
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
})
const time = (iso: string) => dateTime(iso).split(', ').pop()

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
  <section class="novs">
    <PageIntro text="Quejas e incidencias de los servicios: qué pasó, con qué cliente y con qué operador. Regístralas aquí, desde la Base o desde la reserva.">
      <button v-if="!adding" type="button" class="btn btn--primary" @click="adding = true"><AppIcon name="plus" /> Registrar novedad</button>
    </PageIntro>

    <Transition name="fade-up">
      <section v-if="adding" class="card novs__form">
        <h2><AppIcon name="alert" :size="20" /> Nueva novedad de un servicio</h2>
        <ServiceNovedadComposer @saved="onSaved" @cancel="adding = false" />
      </section>
    </Transition>

    <div class="novs__week">
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Semana anterior" @click="from = addDays(from, -7)"><AppIcon name="chevron-left" /></button>
      <div class="novs__week-label">
        <strong>{{ isThisWeek ? 'Esta semana' : 'Semana' }}</strong>
        <span>{{ shortDate(from) }} al {{ shortDate(to) }}</span>
      </div>
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Semana siguiente" :disabled="isThisWeek" @click="from = addDays(from, 7)"><AppIcon name="chevron-right" /></button>
      <button v-if="!isThisWeek" type="button" class="btn btn--soft btn--sm" @click="from = weekStart(todayISO())">Hoy</button>
    </div>

    <div v-if="operators.length" class="novs__filters" role="radiogroup" aria-label="Filtrar por operador">
      <button type="button" class="novs__chip" :class="{ 'is-on': !opFilter }" role="radio" :aria-checked="!opFilter" @click="opFilter = ''">
        Todas <b>{{ items.length }}</b>
      </button>
      <button
        v-for="o in operators"
        :key="o._id"
        type="button"
        class="novs__chip"
        :class="{ 'is-on': opFilter === o._id }"
        role="radio"
        :aria-checked="opFilter === o._id"
        @click="opFilter = o._id"
      >
        <span class="novs__dot" :style="{ background: o.color || '#5F6B77' }"></span>{{ o.name }} <b>{{ o.count }}</b>
      </button>
    </div>

    <div v-if="loading && !data" class="novs__skel"><span v-for="i in 3" :key="i" class="skeleton" style="height: 96px"></span></div>
    <div v-else-if="!items.length" class="card novs__empty">
      <span class="novs__empty-icon"><AppIcon name="check" :size="28" /></span>
      <strong>Sin novedades esta semana</strong>
      <p class="muted">Cuando un cliente se queje o pase algo en un servicio, regístralo aquí.</p>
      <button v-if="!adding" type="button" class="btn btn--primary" @click="adding = true"><AppIcon name="plus" /> Registrar novedad</button>
    </div>
    <div v-else class="novs__days">
      <section v-for="[day, list] in byDay" :key="day" class="novs__day">
        <h3 class="novs__day-title">{{ longDate(day) }} <small>{{ list.length }}</small></h3>
        <ul class="novs__list">
          <li v-for="n in list" :key="n._id" class="novs__item" :style="{ '--op': n.operator?.color || '#C8CDD4' }">
            <div class="novs__head">
              <strong class="novs__customer">{{ n.customer || 'Cliente' }}</strong>
              <span v-if="n.operator" class="novs__op"><span class="novs__dot" :style="{ background: n.operator.color || '#12263F' }"></span>{{ n.operator.name }}</span>
              <span v-else class="novs__op novs__op--none">Sin operador</span>
            </div>
            <p v-if="n.text" class="novs__text">{{ n.text }}</p>
            <div v-if="n.photos?.length" class="novs__pics">
              <a v-for="p in n.photos" :key="p" :href="p" target="_blank" rel="noopener"><img :src="p" alt="Foto de la novedad" loading="lazy" /></a>
            </div>
            <div class="novs__foot">
              <RouterLink :to="`/admin/pedidos/${n.bookingId}`" class="novs__link"><AppIcon name="external" :size="14" /> {{ n.code }} · servicio del {{ shortDate(n.date) }}</RouterLink>
              <span>{{ n.by?.name }} · {{ time(n.at) }}</span>
              <button type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar novedad" @click="removing = n"><AppIcon name="trash" :size="16" /></button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <ConfirmSheet
      :open="!!removing"
      title="Eliminar novedad"
      :message="removing ? `Se borra la novedad de ${removing.customer || 'este cliente'}${removing.text ? `: “${removing.text}”` : ''}.` : ''"
      confirm-label="Eliminar"
      danger
      :busy="busy"
      @close="removing = null"
      @confirm="remove"
    />
  </section>
</template>

<style scoped lang="scss">
.novs {
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h2 {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: $text-lg;
      color: $navy;
    }
  }

  &__week {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__week-label {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    strong {
      color: $navy;
    }

    span {
      font-size: $text-sm;
      color: $ink-muted;
    }
  }

  &__filters {
    display: flex;
    gap: 0.4rem;
    overflow-x: auto;
    padding-bottom: 0.15rem;
  }

  &__chip {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 40px;
    padding: 0 0.85rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;

    b {
      min-width: 1.3rem;
      padding: 0 0.35rem;
      border-radius: $radius-pill;
      background: $navy-soft;
      color: $navy;
      font-size: $text-xs;
      text-align: center;
    }

    &.is-on {
      border-color: $navy;
      background: $navy;
      color: #fff;

      b {
        background: #fff;
      }
    }
  }

  &__dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &__skel,
  &__days {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    text-align: center;
  }

  &__empty-icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: $success-bg;
    color: $success;
  }

  &__day-title {
    margin-bottom: 0.5rem;
    font-size: $text-sm;
    color: $navy;

    &::first-letter {
      text-transform: uppercase;
    }

    small {
      margin-left: 0.3rem;
      padding: 0 0.45rem;
      border-radius: $radius-pill;
      background: $navy-soft;
      font-size: $text-xs;
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding: 0.85rem 0.9rem;
    border-radius: $radius-md;
    border: 1px solid $line;
    border-left: 4px solid var(--op);
    background: $surface;
    box-shadow: $shadow-sm;
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
  }

  &__customer {
    font-size: $text-base;
  }

  &__op {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.65rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
    font-size: $text-xs;
    font-weight: 700;

    &--none {
      background: $line;
      color: $ink-muted;
    }
  }

  &__text {
    font-size: $text-sm;
    color: $ink;
    line-height: 1.5;
  }

  &__pics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;

    img {
      width: 76px;
      height: 76px;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.75rem;
    font-size: $text-xs;
    color: $ink-muted;

    .btn {
      margin-left: auto;
    }
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 700;
    color: $navy;
  }
}
</style>
