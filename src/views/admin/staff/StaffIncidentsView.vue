<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import StaffIncidentForm from '@/components/admin/staff/StaffIncidentForm.vue'
import StaffIncidentList from '@/components/admin/staff/StaffIncidentList.vue'
import { useStaffIncidents } from '@/composables/admin/useStaffIncidents'
import { managementService } from '@/services/management.service'
import { staffIncidentLabel } from '@/config/operationLabels'
import type { User } from '@/types/api'
import type { StaffIncidentType } from '@/types/operation'

const { items, loading, removing, busy, added, canDelete, remove } = useStaffIncidents()
const people = ref<User[]>([])
managementService.users().then((list) => (people.value = list.filter((u) => u.role !== 'admin').sort((a, b) => a.name.localeCompare(b.name))))

const adding = ref(false)
const filter = ref<StaffIncidentType | ''>('')
const shown = computed(() => (filter.value ? items.value.filter((i) => i.type === filter.value) : items.value))
const counts = computed(() => {
  const c: Partial<Record<StaffIncidentType, number>> = {}
  for (const i of items.value) c[i.type] = (c[i.type] || 0) + 1
  return c
})
const types = Object.entries(staffIncidentLabel) as [StaffIncidentType, (typeof staffIncidentLabel)[StaffIncidentType]][]
</script>

<template>
  <div class="sinc">
    <PageIntro text="Lo que pasa con el equipo: llegadas tarde, faltas, peleas, problemas con clientes o daños. Queda en el perfil de cada persona.">
      <button v-if="!adding" type="button" class="btn btn--primary" @click="adding = true"><AppIcon name="plus" /> Registrar novedad</button>
    </PageIntro>

    <Transition name="fade-up">
      <section v-if="adding" class="card sinc__form">
        <h2>Nueva novedad del personal</h2>
        <StaffIncidentForm :people="people" @saved="added($event); adding = false" @cancel="adding = false" />
      </section>
    </Transition>

    <div class="sinc__filters" role="radiogroup" aria-label="Filtrar por tipo">
      <button type="button" class="sinc__chip" :class="{ 'is-on': !filter }" role="radio" :aria-checked="!filter" @click="filter = ''">
        Todas <b>{{ items.length }}</b>
      </button>
      <button
        v-for="[key, t] in types"
        :key="key"
        type="button"
        class="sinc__chip"
        :class="{ 'is-on': filter === key }"
        role="radio"
        :aria-checked="filter === key"
        @click="filter = key"
      >
        <AppIcon :name="t.icon" :size="16" /> {{ t.label }} <b v-if="counts[key]">{{ counts[key] }}</b>
      </button>
    </div>
    <p class="muted sinc__range">Últimos 30 días. Para ver todo el historial de alguien, abre su perfil.</p>

    <div v-if="loading && !items.length" class="sinc__skel"><span v-for="n in 3" :key="n" class="skeleton" style="height: 72px"></span></div>
    <div v-else-if="!shown.length" class="card empty">
      <AppIcon name="check" :size="28" style="margin: 0 auto 0.5rem" />
      {{ filter ? 'No hay novedades de este tipo.' : 'Sin novedades del personal en los últimos 30 días.' }}
    </div>
    <StaffIncidentList v-else :items="shown" show-person :can-delete="canDelete" @remove="removing = $event" />

    <ConfirmSheet
      :open="!!removing"
      title="Eliminar novedad"
      :message="removing ? `Se borra la novedad de ${removing.user.name}: “${staffIncidentLabel[removing.type].label}”.` : ''"
      confirm-label="Eliminar"
      danger
      :busy="busy"
      @close="removing = null"
      @confirm="remove"
    />
  </div>
</template>

<style scoped lang="scss">
.sinc {
  max-width: 860px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;

    h2 {
      font-size: $text-base;
      color: $navy;
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
    gap: 0.35rem;
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

  &__range {
    font-size: $text-xs;
    margin-top: -0.5rem;
  }

  &__skel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
