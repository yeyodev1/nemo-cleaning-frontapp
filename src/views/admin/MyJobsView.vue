<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DateNav from '@/components/admin/agenda/DateNav.vue'
import JobCard from '@/components/admin/operator/JobCard.vue'
import { useMyJobs } from '@/composables/admin/useMyJobs'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { date, day, loading, error, busyId, locatingId, load, setStatus, replace } = useMyJobs()
const jobs = computed(() => day.value?.bookings || [])
const pending = computed(() => jobs.value.filter((j) => !['completed', 'cancelled', 'no_show'].includes(j.status)).length)
const firstName = computed(() => user.user?.name.split(' ')[0] || '')

/** Turno del día (calendario de la oficina): Activo, Libre o Medio día. */
const shift = computed(() => {
  const s = day.value?.shift
  if (!s) return null
  if (s.status === 'off') return { tone: 'off', label: 'Día libre', hint: 'Hoy no tienes turno.' }
  if (s.status === 'half') return { tone: 'half', label: 'Medio día', hint: `Turno hasta las ${s.halfDayUntil}.` }
  return { tone: 'on', label: 'Turno activo', hint: 'Día completo.' }
})
</script>

<template>
  <div class="jobs">
    <div class="jobs__hello">
      <h2>Hola, {{ firstName }}</h2>
      <p class="muted">{{ jobs.length ? `${pending} de ${jobs.length} servicios por hacer` : 'Tus servicios asignados aparecen aquí.' }}</p>
    </div>

    <DateNav v-model="date" />

    <p v-if="shift" class="jobs__shift" :class="`is-${shift.tone}`">
      <AppIcon name="calendar" :size="18" /> <b>{{ shift.label }}</b> <span>{{ shift.hint }}</span>
    </p>

    <div v-if="error" class="card jobs__error" role="alert">
      <AppIcon name="alert" /> <span>{{ error }}</span>
      <button type="button" class="btn btn--ghost btn--sm" @click="load">Reintentar</button>
    </div>
    <div v-else-if="loading && !jobs.length" class="jobs__list">
      <span v-for="n in 2" :key="n" class="skeleton" style="height: 280px"></span>
    </div>
    <div v-else-if="!jobs.length" class="card empty">
      <AppIcon name="sparkles" :size="28" style="margin: 0 auto 0.5rem" />
      No tienes servicios asignados para este día.
    </div>
    <div v-else class="jobs__list">
      <JobCard
        v-for="j in jobs"
        :key="j._id"
        :job="j"
        :busy="busyId === j._id"
        :locating="locatingId === j._id"
        @status="(s, p) => setStatus(j, s, p)"
        @updated="replace"
      />
    </div>

    <button type="button" class="btn btn--ghost jobs__refresh" :disabled="loading" @click="load"><AppIcon name="refresh" /> Actualizar</button>
  </div>
</template>

<style scoped lang="scss">
.jobs {
  max-width: 640px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__hello h2 {
    font-size: $text-xl;
  }

  &__shift {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.7rem 0.9rem;
    border-radius: $radius-md;
    font-size: $text-sm;

    span {
      color: $ink-soft;
    }

    &.is-on {
      background: $success-bg;
      color: $success;
    }

    &.is-half {
      background: $warning-bg;
      color: $warning;
    }

    &.is-off {
      background: $line;
      color: $ink-soft;
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

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__refresh {
    align-self: center;
  }
}
</style>
