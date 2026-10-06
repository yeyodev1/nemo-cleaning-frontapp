<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import BranchForm from '@/components/admin/branches/BranchForm.vue'
import { useCrudList } from '@/composables/admin/useCrudList'
import { managementService } from '@/services/management.service'

const { items, loading, editing, formOpen, open, onSaved } = useCrudList(() => managementService.branches())
const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const dayList = (d: number[]) => [...(d || [])].sort().map((i) => days[i]).join(' · ')
</script>

<template>
  <section>
    <div class="bar">
      <p class="muted">{{ items.length }} sucursales</p>
      <button type="button" class="btn btn--primary" @click="open(null)"><AppIcon name="plus" /> Nueva sucursal</button>
    </div>
    <div v-if="loading && !items.length" class="grid"><span v-for="i in 2" :key="i" class="skeleton" style="height: 180px"></span></div>
    <div v-else class="grid">
      <article v-for="b in items" :key="b._id" class="br" :class="{ 'is-off': !b.active }">
        <header class="br__head">
          <span class="br__icon" aria-hidden="true"><AppIcon name="store" /></span>
          <h3>{{ b.name }}</h3>
          <StatusBadge :tone="b.active ? 'success' : 'danger'" :label="b.active ? 'Activa' : 'Inactiva'" />
        </header>
        <ul class="br__info">
          <li v-if="b.address"><AppIcon name="pin" :size="16" /> {{ b.address }}</li>
          <li v-if="b.phone || b.whatsapp"><AppIcon name="phone" :size="16" /> {{ b.phone }}<template v-if="b.whatsapp"> · WA {{ b.whatsapp }}</template></li>
          <li v-if="b.email"><AppIcon name="mail" :size="16" /> {{ b.email }}</li>
          <li><AppIcon name="clock" :size="16" /> {{ b.openingTime }}–{{ b.closingTime }} · turnos de {{ b.slotMinutes }} min</li>
          <li><AppIcon name="calendar" :size="16" /> {{ dayList(b.workDays) }}</li>
        </ul>
        <button type="button" class="btn btn--soft btn--block" @click="open(b)"><AppIcon name="edit" /> Editar</button>
      </article>
    </div>
    <BranchForm :open="formOpen" :branch="editing" @close="formOpen = false" @saved="onSaved" />
  </section>
</template>

<style scoped lang="scss">
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.grid {
  @include flex-cards(320px, 0.85rem);
}

.br {
  @include card(1.1rem);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &.is-off {
    opacity: 0.65;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    h3 {
      flex: 1;
      font-size: $text-lg;
    }
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: $aqua-soft;
    color: $aqua-ink;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__info {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: $text-sm;
    color: $ink-soft;

    li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;

      svg {
        margin-top: 3px;
        color: $navy;
      }
    }
  }
}
</style>
