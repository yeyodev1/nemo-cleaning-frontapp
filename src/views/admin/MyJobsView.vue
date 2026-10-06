<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DateNav from '@/components/admin/agenda/DateNav.vue'
import JobCard from '@/components/admin/operator/JobCard.vue'
import { useMyJobs } from '@/composables/admin/useMyJobs'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { date, jobs, loading, error, busyId, load, setStatus } = useMyJobs()
const pending = computed(() => jobs.value.filter((j) => !['completed', 'cancelled', 'no_show'].includes(j.status)).length)
const firstName = computed(() => user.user?.name.split(' ')[0] || '')
</script>

<template>
  <div class="jobs">
    <div class="jobs__hello">
      <h2>Hola, {{ firstName }}</h2>
      <p class="muted">{{ jobs.length ? `${pending} de ${jobs.length} servicios por hacer` : 'Tus servicios asignados aparecen aquí.' }}</p>
    </div>

    <DateNav v-model="date" />

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
      <JobCard v-for="j in jobs" :key="j._id" :job="j" :busy="busyId === j._id" @status="(s, n) => setStatus(j, s, n)" />
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
