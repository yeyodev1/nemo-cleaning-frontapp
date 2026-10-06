<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import { serviceCategory, serviceUnit } from '@/config/labels'
import { categoryIcon } from '@/config/categoryIcons'
import { money } from '@/utils/format'
import type { Service, ServiceCategory } from '@/types/api'
import type { Cart } from '@/composables/booking/cart'

/**
 * Selector de servicios + adicionales con cantidades. Lo usan el asistente
 * público y el formulario de pedido del panel. v-model = { serviceId: qty }.
 */
const props = defineProps<{
  services: Service[]
  modelValue: Cart
  compact?: boolean
  initialCategory?: ServiceCategory | ''
}>()
const emit = defineEmits<{ 'update:modelValue': [cart: Cart] }>()

const active = ref<ServiceCategory | 'all'>(props.initialCategory || 'all')
const main = computed(() => props.services.filter((s) => !s.isExtra && s.active !== false))
const extras = computed(() => props.services.filter((s) => s.isExtra && s.active !== false))
const categories = computed(() => [...new Set(main.value.map((s) => s.category))])
const visible = computed(() => (active.value === 'all' ? main.value : main.value.filter((s) => s.category === active.value)))
const hasMain = computed(() => main.value.some((s) => (props.modelValue[s._id] || 0) > 0))

function qty(id: string) {
  return props.modelValue[id] || 0
}

function set(id: string, value: number) {
  const next = { ...props.modelValue }
  if (value > 0) next[id] = value
  else delete next[id]
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="picker" :class="{ 'picker--compact': compact }">
    <div class="picker__chips" role="tablist" aria-label="Categorías">
      <button type="button" role="tab" class="chip" :class="{ 'is-on': active === 'all' }" :aria-selected="active === 'all'" @click="active = 'all'">
        Todos
      </button>
      <button
        v-for="c in categories"
        :key="c"
        type="button"
        role="tab"
        class="chip"
        :class="{ 'is-on': active === c }"
        :aria-selected="active === c"
        @click="active = c"
      >
        <AppIcon :name="categoryIcon[c]" :size="16" /> {{ serviceCategory[c] }}
      </button>
    </div>

    <ul class="picker__list">
      <li v-for="s in visible" :key="s._id" class="item" :class="{ 'is-on': qty(s._id) > 0 }">
        <span class="item__icon" aria-hidden="true"><AppIcon :name="categoryIcon[s.category]" :size="22" /></span>
        <div class="item__info">
          <strong>{{ s.name }}</strong>
          <small v-if="s.description && !compact">{{ s.description }}</small>
          <span class="item__price money">{{ money(s.price) }} <em>{{ serviceUnit[s.unit] }}</em></span>
        </div>
        <QuantityStepper :model-value="qty(s._id)" :label="s.name" @update:model-value="set(s._id, $event)" />
      </li>
      <li v-if="!visible.length" class="empty">No hay servicios en esta categoría.</li>
    </ul>

    <section v-if="extras.length" class="picker__extras" aria-labelledby="extras-title">
      <h3 id="extras-title">
        <AppIcon name="sparkles" :size="18" /> Adicionales
        <small v-if="!hasMain">Elige primero un servicio</small>
      </h3>
      <ul class="picker__list">
        <li v-for="s in extras" :key="s._id" class="item item--extra" :class="{ 'is-on': qty(s._id) > 0 }">
          <div class="item__info">
            <strong>{{ s.name }}</strong>
            <small v-if="s.description && !compact">{{ s.description }}</small>
            <span class="item__price money">+ {{ money(s.price) }} <em>{{ serviceUnit[s.unit] }}</em></span>
          </div>
          <QuantityStepper :model-value="qty(s._id)" :label="s.name" @update:model-value="set(s._id, $event)" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__chips {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 2px 2px 6px;
    margin-inline: -2px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__extras h3 {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
    font-size: $text-base;
    margin: 0.5rem 0 0.75rem;
    color: $navy;

    small {
      font-size: $text-xs;
      font-weight: 600;
      color: $ink-muted;
    }
  }
}

.chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0 0.95rem;
  border-radius: $radius-pill;
  border: 1.5px solid $line;
  background: $surface;
  font-size: $text-sm;
  font-weight: 700;
  color: $ink-soft;
  transition: all 0.2s $ease;

  &.is-on {
    background: $navy;
    border-color: $navy;
    color: #fff;
  }
}

.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: $radius-md;
  background: $surface;
  border: 1.5px solid $line;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;

  &.is-on {
    border-color: $aqua;
    background: linear-gradient(0deg, rgba($aqua, 0.05), rgba($aqua, 0.05)), $surface;
    box-shadow: 0 6px 18px rgba($aqua, 0.14);
  }

  &--extra {
    background: $sky;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy-soft;
    color: $navy;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;

    strong {
      font-size: $text-sm;
      line-height: 1.3;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
      line-height: 1.4;
    }
  }

  &__price {
    font-weight: 800;
    color: $navy;
    font-size: $text-sm;

    em {
      font-style: normal;
      font-weight: 500;
      color: $ink-muted;
      font-size: $text-xs;
    }
  }
}

.picker--compact .item__icon {
  display: none;
}
</style>
