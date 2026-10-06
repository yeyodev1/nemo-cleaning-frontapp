<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAdminScope } from '@/stores/adminScope'

/** Selección múltiple de operadores (filtrados por sucursal si la tienen asignada). */
const props = defineProps<{ branch?: string }>()
const model = defineModel<string[]>({ required: true })
const scope = useAdminScope()

const list = computed(() =>
  scope.operators.filter((o) => o.active !== false && (!props.branch || !o.branches?.length || o.branches.includes(props.branch))),
)

function toggle(id: string) {
  model.value = model.value.includes(id) ? model.value.filter((x) => x !== id) : [...model.value, id]
}
</script>

<template>
  <div v-if="list.length" class="ops" role="group" aria-label="Operadores">
    <button
      v-for="o in list"
      :key="o._id"
      type="button"
      class="ops__chip"
      :class="{ 'is-on': model.includes(o._id) }"
      :style="{ '--c': o.color || '#0B4F8A' }"
      :aria-pressed="model.includes(o._id)"
      @click="toggle(o._id)"
    >
      <span class="ops__dot"><AppIcon v-if="model.includes(o._id)" name="check" :size="12" /></span>
      {{ o.name }}
    </button>
  </div>
  <p v-else class="muted ops__empty">No hay operadores activos para esta sucursal.</p>
</template>

<style scoped lang="scss">
.ops {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: $tap;
    padding: 0 0.95rem 0 0.6rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: $text-sm;

    &.is-on {
      border-color: var(--c);
      background: color-mix(in srgb, var(--c) 10%, white);
    }
  }

  &__dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--c);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__empty {
    font-size: $text-sm;
  }
}
</style>
