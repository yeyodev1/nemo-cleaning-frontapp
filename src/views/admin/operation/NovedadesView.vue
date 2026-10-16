<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import ServiceNovedadComposer from '@/components/admin/operation/ServiceNovedadComposer.vue'
import StaffIncidentForm from '@/components/admin/staff/StaffIncidentForm.vue'
import { useReport } from '@/composables/admin/useReport'
import { operationService } from '@/services/operation.service'
import { managementService } from '@/services/management.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { staffIncidentLabel } from '@/config/operationLabels'
import { addDays, dateTime, errorMessage, longDate, shortDate, todayISO, weekStart } from '@/utils/format'
import type { User } from '@/types/api'
import type { NovedadRow, StaffIncident } from '@/types/operation'

/**
 * Todas las novedades de la semana en un lugar: de un servicio, de una persona del equipo
 * o generales (un atraso, una inconsistencia). Se registran aquí mismo.
 */
const scope = useAdminScope()
const toast = useToastStore()
const me = useUserStore()
const from = ref(weekStart(todayISO()))
const to = computed(() => addDays(from.value, 6))
const branch = toRef(scope, 'branch')
const { data, loading, load } = useReport(
  () =>
    Promise.all([
      operationService.novedades({ from: from.value, to: to.value, branch: scope.query }),
      operationService.staffIncidents({ from: from.value, to: to.value }),
    ]).then(([services, incidents]) => ({ services: services.items, incidents: incidents.items })),
  [from, branch],
)
const isThisWeek = computed(() => from.value === weekStart(todayISO()))

// Registrar: primero "¿sobre qué es?".
type Mode = 'service' | 'person' | 'general'
const adding = ref(false)
const mode = ref<Mode | ''>('')
const MODES: { value: Mode; label: string; hint: string; icon: 'list' | 'user' | 'layers' }[] = [
  { value: 'service', label: 'Un servicio', hint: 'Queja de un cliente, trabajo incompleto, daño en un servicio', icon: 'list' },
  { value: 'person', label: 'Una persona del equipo', hint: 'Llegó tarde, faltó, pelea, problema con un cliente', icon: 'user' },
  { value: 'general', label: 'Otra cosa', hint: 'Un atraso, una inconsistencia en caja o registros, algo de la sucursal', icon: 'layers' },
]
const people = ref<User[]>([])
managementService.users().then((list) => (people.value = list.filter((u) => u.role !== 'admin').sort((a, b) => a.name.localeCompare(b.name))))

function startAdding() {
  adding.value = true
  mode.value = ''
}
function onSaved() {
  adding.value = false
  mode.value = ''
  load()
}

/** Entrada común para la lista (servicio, persona o general). */
interface Entry {
  key: string
  kind: Mode
  day: string
  at: string
  title: string
  tag: string
  tone: 'warning' | 'danger' | 'info' | 'navy'
  text: string
  photos: string[]
  color?: string
  who?: { _id: string; name: string; color?: string } | null
  link?: { to: string; label: string }
  by?: string
  service?: NovedadRow
  incident?: StaffIncident
}

const dayOf = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil' }).format(new Date(iso))

const entries = computed<Entry[]>(() => {
  const d = data.value
  if (!d) return []
  const fromServices: Entry[] = d.services.map((n) => ({
    key: `s-${n._id}`,
    kind: 'service',
    day: dayOf(n.at),
    at: n.at,
    title: n.customer ? `Servicio de ${n.customer}` : `Servicio ${n.code}`,
    tag: 'Servicio',
    tone: 'warning',
    text: n.text,
    photos: n.photos || [],
    color: n.operator?.color,
    who: n.operator,
    link: { to: `/admin/pedidos/${n.bookingId}`, label: `${n.code} · servicio del ${shortDate(n.date)}` },
    by: n.by?.name,
    service: n,
  }))
  const fromIncidents: Entry[] = d.incidents.map((i) => ({
    key: `i-${i._id}`,
    kind: i.user ? 'person' : 'general',
    day: i.date,
    at: i.createdAt,
    title: staffIncidentLabel[i.type].label,
    tag: i.user ? 'Persona' : `General${i.branch ? ` · ${scope.branchName(i.branch)}` : ''}`,
    tone: staffIncidentLabel[i.type].tone,
    text: i.text,
    photos: [],
    color: i.user?.color,
    who: i.user,
    link: i.user ? { to: `/admin/personal/${i.user._id}`, label: `Ver perfil de ${i.user.name}` } : undefined,
    by: i.by?.name,
    incident: i,
  }))
  return [...fromServices, ...fromIncidents].sort((a, b) => b.day.localeCompare(a.day) || b.at.localeCompare(a.at))
})

const kindFilter = ref<Mode | ''>('')
const counts = computed(() => ({
  service: entries.value.filter((e) => e.kind === 'service').length,
  person: entries.value.filter((e) => e.kind === 'person').length,
  general: entries.value.filter((e) => e.kind === 'general').length,
}))
const shown = computed(() => (kindFilter.value ? entries.value.filter((e) => e.kind === kindFilter.value) : entries.value))
const byDay = computed(() => {
  const groups = new Map<string, Entry[]>()
  for (const e of shown.value) groups.set(e.day, [...(groups.get(e.day) || []), e])
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
})
const time = (iso: string) => dateTime(iso).split(', ').pop()
const canDelete = (e: Entry) => e.kind === 'service' || me.isAdmin || e.incident?.by?.id === me.user?._id

const removing = ref<Entry | null>(null)
const busy = ref(false)
async function remove() {
  const e = removing.value
  if (!e) return
  busy.value = true
  try {
    if (e.service) await operationService.deleteNovedad(e.service.bookingId, e.service._id)
    else if (e.incident) await operationService.deleteStaffIncident(e.incident._id)
    toast.success('Novedad eliminada')
    removing.value = null
    load()
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="novs">
    <PageIntro text="Todo lo que pasa: en un servicio, con alguien del equipo o en la sucursal (un atraso, una inconsistencia). Regístralo aquí.">
      <button v-if="!adding" type="button" class="btn btn--primary" @click="startAdding"><AppIcon name="plus" /> Registrar novedad</button>
    </PageIntro>

    <Transition name="fade-up">
      <section v-if="adding" class="card novs__form">
        <div class="novs__form-head">
          <h2><AppIcon name="alert" :size="20" /> Nueva novedad</h2>
          <button v-if="mode" type="button" class="btn btn--ghost btn--sm" @click="mode = ''"><AppIcon name="arrow-left" :size="16" /> Cambiar tipo</button>
        </div>

        <div v-if="!mode" class="novs__modes">
          <p class="novs__ask">¿Sobre qué es la novedad?</p>
          <button v-for="m in MODES" :key="m.value" type="button" class="novs__mode" @click="mode = m.value">
            <span class="novs__mode-icon"><AppIcon :name="m.icon" :size="22" /></span>
            <span><strong>{{ m.label }}</strong><small>{{ m.hint }}</small></span>
            <AppIcon name="chevron-right" :size="18" />
          </button>
          <button type="button" class="btn btn--ghost novs__cancel" @click="adding = false">Cancelar</button>
        </div>
        <ServiceNovedadComposer v-else-if="mode === 'service'" @saved="onSaved" @cancel="adding = false" />
        <StaffIncidentForm v-else-if="mode === 'person'" :people="people" @saved="onSaved" @cancel="adding = false" />
        <StaffIncidentForm v-else general @saved="onSaved" @cancel="adding = false" />
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

    <div v-if="entries.length" class="novs__filters" role="radiogroup" aria-label="Filtrar por tipo">
      <button type="button" class="novs__chip" :class="{ 'is-on': !kindFilter }" role="radio" :aria-checked="!kindFilter" @click="kindFilter = ''">Todas <b>{{ entries.length }}</b></button>
      <button v-for="m in MODES" :key="m.value" type="button" class="novs__chip" :class="{ 'is-on': kindFilter === m.value }" role="radio" :aria-checked="kindFilter === m.value" @click="kindFilter = m.value">
        <AppIcon :name="m.icon" :size="15" /> {{ m.value === 'service' ? 'Servicios' : m.value === 'person' ? 'Personas' : 'Generales' }} <b>{{ counts[m.value] }}</b>
      </button>
    </div>

    <div v-if="loading && !data" class="novs__skel"><span v-for="i in 3" :key="i" class="skeleton" style="height: 96px"></span></div>
    <div v-else-if="!entries.length" class="card novs__empty">
      <span class="novs__empty-icon"><AppIcon name="check" :size="28" /></span>
      <strong>Sin novedades esta semana</strong>
      <p class="muted">Cuando pase algo (una queja, un atraso, una inconsistencia), regístralo aquí.</p>
      <button v-if="!adding" type="button" class="btn btn--primary" @click="startAdding"><AppIcon name="plus" /> Registrar novedad</button>
    </div>
    <div v-else class="novs__days">
      <section v-for="[day, list] in byDay" :key="day" class="novs__day">
        <h3 class="novs__day-title">{{ longDate(day) }} <small>{{ list.length }}</small></h3>
        <ul class="novs__list">
          <li v-for="e in list" :key="e.key" class="novs__item" :class="`is-${e.tone}`" :style="{ '--op': e.color || '#C8CDD4' }">
            <div class="novs__head">
              <span class="novs__tag">{{ e.tag }}</span>
              <strong class="novs__customer">{{ e.title }}</strong>
              <span v-if="e.who" class="novs__op"><span class="novs__dot" :style="{ background: e.who.color || '#12263F' }"></span>{{ e.who.name }}</span>
            </div>
            <p v-if="e.text" class="novs__text">{{ e.text }}</p>
            <div v-if="e.photos.length" class="novs__pics">
              <a v-for="p in e.photos" :key="p" :href="p" target="_blank" rel="noopener"><img :src="p" alt="Foto de la novedad" loading="lazy" /></a>
            </div>
            <div class="novs__foot">
              <RouterLink v-if="e.link" :to="e.link.to" class="novs__link"><AppIcon name="external" :size="14" /> {{ e.link.label }}</RouterLink>
              <span>{{ e.by }} · {{ time(e.at) }}</span>
              <button v-if="canDelete(e)" type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar novedad" @click="removing = e"><AppIcon name="trash" :size="16" /></button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <ConfirmSheet
      :open="!!removing"
      title="Eliminar novedad"
      :message="removing ? `Se borra: “${removing.title}${removing.text ? ` — ${removing.text}` : ''}”.` : ''"
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

  &__form-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__modes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__ask {
    font-weight: 700;
    color: $ink;
  }

  &__mode {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-height: 72px;
    padding: 0.7rem 0.9rem;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    background: $surface;
    text-align: left;
    color: $navy;
    transition:
      border-color $dur-fast ease,
      transform $dur-fast $ease-out;

    > span:nth-child(2) {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }

    &:hover {
      border-color: $navy;
      background: $navy-soft;
    }

    &:active {
      transform: scale(0.99);
    }
  }

  &__mode-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: $navy;
    color: #fff;
  }

  &__cancel {
    align-self: flex-end;
  }

  &__tag {
    padding: 0.1rem 0.5rem;
    border-radius: $radius-pill;
    background: $line;
    color: $ink-soft;
    font-size: $text-xs;
    font-weight: 700;
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
    gap: 0.4rem 0.5rem;

    .novs__op {
      margin-left: auto;
    }
  }

  &__item.is-danger {
    border-left-color: $danger;
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
