<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import UserForm from '@/components/admin/staff/UserForm.vue'
import { useCrudList } from '@/composables/admin/useCrudList'
import { managementService } from '@/services/management.service'
import { useAdminScope } from '@/stores/adminScope'
import { roleLabel } from '@/config/labels'
import { positionLabel } from '@/config/operationLabels'
import type { Role } from '@/types/api'

const scope = useAdminScope()
const { items, loading, editing, formOpen, open, onSaved } = useCrudList(() => managementService.users())
const order: Role[] = ['admin', 'manager', 'operator']
const sorted = computed(() => [...items.value].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || a.name.localeCompare(b.name)))
const tone = { admin: 'navy', manager: 'info', operator: 'aqua' } as const
const branchNames = (ids: string[]) => ids.map((id) => scope.branchName(id)).filter(Boolean).join(', ')
</script>

<template>
  <section>
    <div class="bar">
      <p class="muted">{{ items.length }} {{ items.length === 1 ? 'persona' : 'personas' }}</p>
      <button type="button" class="btn btn--primary" @click="open(null)"><AppIcon name="plus" /> Nueva persona</button>
    </div>
    <div v-if="loading && !items.length" class="list"><span v-for="i in 5" :key="i" class="skeleton" style="height: 68px"></span></div>
    <ul v-else class="list">
      <li v-for="u in sorted" :key="u._id">
        <button type="button" class="person" :class="{ 'is-off': !u.active }" @click="open(u)">
          <span class="person__avatar" :style="{ background: u.color || '#1E2D3A' }" aria-hidden="true">{{ u.name.charAt(0) }}</span>
          <span class="person__main">
            <strong>{{ u.name }}</strong>
            <span class="muted">
              <template v-if="u.position">{{ positionLabel[u.position] }} · </template>{{ u.email || 'Sin acceso al panel' }}<template v-if="u.branches?.length"> · {{ branchNames(u.branches) }}</template>
            </span>
          </span>
          <span class="person__end">
            <StatusBadge :tone="tone[u.role]" :label="roleLabel[u.role]" />
            <StatusBadge v-if="!u.active" tone="danger" label="Inactivo" />
          </span>
        </button>
      </li>
    </ul>
    <UserForm :open="formOpen" :user="editing" :people="items" @close="formOpen = false" @saved="onSaved" />
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

.list {
  list-style: none;
  @include flex-cards(320px, 0.5rem);
}

.person {
  @include card(0.75rem 0.9rem);
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;

  &:hover {
    border-color: $navy;
  }

  &.is-off {
    opacity: 0.6;
  }

  &__avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    color: #fff;
    font-weight: 800;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text-shadow: 0 1px 2px rgba(#000, 0.3);
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    .muted {
      font-size: $text-xs;
      @include truncate;
    }
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }
}
</style>
