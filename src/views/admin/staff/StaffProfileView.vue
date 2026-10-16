<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ConfirmSheet from '@/components/admin/sheet/ConfirmSheet.vue'
import StaffIncidentForm from '@/components/admin/staff/StaffIncidentForm.vue'
import StaffIncidentList from '@/components/admin/staff/StaffIncidentList.vue'
import { useStaffIncidents } from '@/composables/admin/useStaffIncidents'
import { managementService } from '@/services/management.service'
import { useAdminScope } from '@/stores/adminScope'
import { roleLabel } from '@/config/labels'
import { positionLabel, staffIncidentLabel } from '@/config/operationLabels'
import { whatsappUrl } from '@/utils/format'
import type { User } from '@/types/api'
import type { StaffIncidentType } from '@/types/operation'

/** Perfil de una persona del equipo: sus datos y su historial de novedades. */
const route = useRoute()
const scope = useAdminScope()
const id = String(route.params.id)
const person = ref<User | null>(null)
const notFound = ref(false)
managementService
  .users()
  .then((list) => {
    person.value = list.find((u) => u._id === id) || null
    notFound.value = !person.value
  })
  .catch(() => (notFound.value = true))

const { items, loading, removing, busy, added, canDelete, remove } = useStaffIncidents(id)
const adding = ref(false)
const summary = computed(() => {
  const c: Partial<Record<StaffIncidentType, number>> = {}
  for (const i of items.value) c[i.type] = (c[i.type] || 0) + 1
  return (Object.entries(c) as [StaffIncidentType, number][]).sort((a, b) => b[1] - a[1])
})
const branches = computed(() => (person.value?.branches || []).map((b) => scope.branchName(b)).filter(Boolean).join(', '))
</script>

<template>
  <div class="prof">
    <RouterLink to="/admin/personal/novedades" class="prof__back"><AppIcon name="arrow-left" :size="16" /> Novedades del personal</RouterLink>

    <div v-if="notFound" class="card empty">No encontramos a esta persona o no tienes acceso.</div>
    <template v-else>
      <section class="card prof__head">
        <span class="prof__avatar" :style="{ background: person?.color || '#1E2D3A' }">{{ person?.name.charAt(0) }}</span>
        <div class="prof__info">
          <h2>{{ person?.name || '…' }}</h2>
          <div class="prof__badges">
            <StatusBadge v-if="person" tone="navy" :label="roleLabel[person.role]" />
            <StatusBadge v-if="person?.position" tone="info" :label="positionLabel[person.position]" />
            <StatusBadge v-if="person && !person.active" tone="danger" label="Inactivo" />
          </div>
          <p class="muted">{{ [person?.email, branches].filter(Boolean).join(' · ') || 'Sin acceso al panel' }}</p>
        </div>
        <div v-if="person?.phone" class="prof__contact">
          <a :href="`tel:${person.phone}`" class="btn btn--ghost btn--sm"><AppIcon name="phone" :size="16" /> Llamar</a>
          <a :href="whatsappUrl(person.phone)" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm"><AppIcon name="whatsapp" :size="16" /> WhatsApp</a>
        </div>
      </section>

      <section class="card prof__sec">
        <div class="prof__sec-head">
          <h2>Novedades <small>{{ items.length }}</small></h2>
          <button v-if="!adding" type="button" class="btn btn--primary btn--sm" @click="adding = true"><AppIcon name="plus" :size="16" /> Registrar novedad</button>
        </div>
        <div v-if="summary.length" class="prof__summary">
          <span v-for="[key, n] in summary" :key="key" class="prof__pill" :class="`is-${staffIncidentLabel[key].tone}`">
            <AppIcon :name="staffIncidentLabel[key].icon" :size="14" /> {{ staffIncidentLabel[key].label }}: <b>{{ n }}</b>
          </span>
        </div>
        <Transition name="fade-up">
          <div v-if="adding && person" class="prof__form">
            <StaffIncidentForm :person="person" @saved="added($event); adding = false" @cancel="adding = false" />
          </div>
        </Transition>
        <div v-if="loading && !items.length" class="prof__skel"><span v-for="n in 2" :key="n" class="skeleton" style="height: 72px"></span></div>
        <p v-else-if="!items.length" class="muted">Sin novedades registradas. ¡Bien!</p>
        <StaffIncidentList v-else :items="items" :can-delete="canDelete" @remove="removing = $event" />
      </section>
    </template>

    <ConfirmSheet
      :open="!!removing"
      title="Eliminar novedad"
      :message="removing ? `Se borra: “${staffIncidentLabel[removing.type].label}” del ${removing.date}.` : ''"
      confirm-label="Eliminar"
      danger
      :busy="busy"
      @close="removing = null"
      @confirm="remove"
    />
  </div>
</template>

<style scoped lang="scss">
.prof {
  max-width: 860px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    align-self: flex-start;
    min-height: 36px;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
  }

  &__avatar {
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    color: #fff;
    font-size: $text-xl;
    font-weight: 800;
  }

  &__info {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    h2 {
      font-size: $text-xl;
    }

    p {
      font-size: $text-sm;
    }
  }

  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__contact {
    display: flex;
    gap: 0.4rem;
  }

  &__sec {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  &__sec-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

    h2 {
      font-size: $text-base;
      color: $navy;

      small {
        color: $ink-muted;
      }
    }
  }

  &__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.7rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
    font-size: $text-xs;
    font-weight: 600;

    &.is-warning {
      background: $warning-bg;
      color: $warning;
    }

    &.is-danger {
      background: $danger-bg;
      color: $danger;
    }
  }

  &__form {
    padding: 0.9rem;
    border-radius: $radius-md;
    background: $sky;
  }

  &__skel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
