<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ServiceForm from '@/components/admin/catalog/ServiceForm.vue'
import { useCrudList } from '@/composables/admin/useCrudList'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { serviceCategory, serviceUnit } from '@/config/labels'
import { categoryIcon } from '@/config/categoryIcons'
import { errorMessage } from '@/utils/format'
import { priceSummary, unitSuffix } from '@/utils/pricing'
import type { Service, ServiceCategory } from '@/types/api'

const toast = useToastStore()
const { items, loading, editing, formOpen, load, open, onSaved } = useCrudList(() => managementService.services())

const sorted = computed(() => [...items.value].sort((a, b) => a.order - b.order))
const groups = computed(() => {
  const map = new Map<ServiceCategory, Service[]>()
  sorted.value.filter((s) => !s.isExtra).forEach((s) => map.set(s.category, [...(map.get(s.category) || []), s]))
  return [...map.entries()]
})
const extras = computed(() => sorted.value.filter((s) => s.isExtra))
const nextOrder = computed(() => Math.max(0, ...items.value.map((s) => s.order || 0)) + 1)

async function deactivate(s: Service) {
  if (!window.confirm(`¿Desactivar "${s.name}"? Dejará de verse en la web.`)) return
  try {
    await managementService.deactivateService(s._id)
    toast.success('Servicio desactivado')
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  }
}
</script>

<template>
  <section>
    <div class="bar">
      <p class="muted">{{ items.length }} servicios y adicionales</p>
      <button type="button" class="btn btn--primary" @click="open(null)"><AppIcon name="plus" /> Nuevo servicio</button>
    </div>
    <div v-if="loading && !items.length" class="list"><span v-for="i in 6" :key="i" class="skeleton" style="height: 64px"></span></div>

    <template v-for="[cat, list] in groups" :key="cat">
      <h3 class="group"><AppIcon :name="categoryIcon[cat]" :size="18" /> {{ serviceCategory[cat] }}</h3>
      <ul class="list">
        <li v-for="s in list" :key="s._id" class="svc" :class="{ 'is-off': !s.active }">
          <div class="svc__main">
            <strong>{{ s.name }}</strong>
            <span class="muted">{{ priceSummary(s) }} {{ unitSuffix(s) || serviceUnit[s.unit] }} · {{ s.variants?.length ? `${s.variants.length} opciones · ` : '' }}{{ s.durationMinutes }} min · orden {{ s.order }}</span>
          </div>
          <StatusBadge v-if="!s.active" label="Inactivo" />
          <button type="button" class="btn btn--ghost btn--icon" :aria-label="`Editar ${s.name}`" @click="open(s)"><AppIcon name="edit" :size="18" /></button>
          <button v-if="s.active" type="button" class="btn btn--danger btn--icon" :aria-label="`Desactivar ${s.name}`" @click="deactivate(s)"><AppIcon name="ban" :size="18" /></button>
        </li>
      </ul>
    </template>

    <template v-if="extras.length">
      <h3 class="group"><AppIcon name="sparkles" :size="18" /> Adicionales de auto</h3>
      <ul class="list">
        <li v-for="s in extras" :key="s._id" class="svc svc--extra" :class="{ 'is-off': !s.active }">
          <div class="svc__main">
            <strong>{{ s.name }}</strong>
            <span class="muted">+ {{ priceSummary(s) }}{{ s.variants?.length ? ` · ${s.variants.map((v) => v.label).join(' / ')}` : '' }}</span>
          </div>
          <StatusBadge v-if="!s.active" label="Inactivo" />
          <button type="button" class="btn btn--ghost btn--icon" :aria-label="`Editar ${s.name}`" @click="open(s)"><AppIcon name="edit" :size="18" /></button>
          <button v-if="s.active" type="button" class="btn btn--danger btn--icon" :aria-label="`Desactivar ${s.name}`" @click="deactivate(s)"><AppIcon name="ban" :size="18" /></button>
        </li>
      </ul>
    </template>

    <ServiceForm :open="formOpen" :service="editing" :next-order="nextOrder" @close="formOpen = false" @saved="onSaved" />
  </section>
</template>

<style scoped lang="scss">
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: $text-base;
  color: $navy;
  margin: 1.25rem 0 0.6rem;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.svc {
  @include card(0.6rem 0.6rem 0.6rem 0.9rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &--extra {
    background: $sky;
  }

  &.is-off {
    opacity: 0.6;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: $text-sm;

    .muted {
      font-size: $text-xs;
    }
  }
}
</style>
