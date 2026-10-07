<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ServiceOption from './ServiceOption.vue'
import { serviceCategory } from '@/config/labels'
import { categoryIcon } from '@/config/categoryIcons'
import { parseKey, type Cart } from '@/composables/booking/cart'
import type { Service, ServiceCategory } from '@/types/api'

/**
 * Selector de servicios + adicionales con opciones y cantidades. Lo usan el asistente
 * público y los formularios de pedido del panel. v-model = Cart ({ "id" | "id::opción": cantidad }).
 * `officeLink`: en la web las oficinas se cotizan aparte (m² + plan), así que se enlaza al cotizador.
 */
const props = defineProps<{
  services: Service[]
  modelValue: Cart
  compact?: boolean
  initialCategory?: ServiceCategory | ''
  officeLink?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [cart: Cart] }>()

const pickable = computed(() =>
  props.services.filter((s) => s.active !== false && !(props.officeLink && s.category === 'oficinas')),
)
const main = computed(() => pickable.value.filter((s) => !s.isExtra))
const extras = computed(() => pickable.value.filter((s) => s.isExtra))
const categories = computed(() => [...new Set(main.value.map((s) => s.category))])
const active = ref<ServiceCategory | 'all'>(
  props.initialCategory && props.initialCategory !== 'oficinas' ? props.initialCategory : 'all',
)
const visible = computed(() => (active.value === 'all' ? main.value : main.value.filter((s) => s.category === active.value)))
// Los adicionales del catálogo son de NEMO CAR: se muestran con la categoría Autos (o con "Todos").
const showExtras = computed(() => extras.value.length > 0 && (active.value === 'all' || active.value === 'autos'))
const hasMain = computed(() =>
  Object.entries(props.modelValue).some(([key, q]) => q > 0 && main.value.some((s) => s._id === parseKey(key).service)),
)

function set(key: string, value: number) {
  const next = { ...props.modelValue }
  if (value > 0) next[key] = value
  else delete next[key]
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
      <ServiceOption v-for="s in visible" :key="s._id" :service="s" :cart="modelValue" :compact="compact" @set="set" />
      <li v-if="!visible.length" class="empty">No hay servicios en esta categoría.</li>
    </ul>

    <section v-if="showExtras" class="picker__extras" aria-labelledby="extras-title">
      <h3 id="extras-title">
        <AppIcon name="sparkles" :size="18" /> Servicios adicionales de auto
        <small v-if="!hasMain">Se agregan junto a un servicio principal</small>
      </h3>
      <ul class="picker__list">
        <ServiceOption v-for="s in extras" :key="s._id" :service="s" :cart="modelValue" :compact="compact" @set="set" />
      </ul>
    </section>

    <div v-if="officeLink && (active === 'all' || active === 'especializados')" class="office">
      <AppIcon name="building" :size="22" />
      <span><strong>¿Limpieza de oficinas?</strong>Se cotiza por m² y plan.</span>
      <RouterLink to="/cotizar-oficina" class="btn btn--accent btn--sm">Cotizar</RouterLink>
    </div>
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

.office {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.95rem;
  border-radius: $radius-md;
  background: $navy-deep;
  color: $on-dark;
  font-size: $text-sm;

  strong {
    display: block;
    color: #fff;
  }

  .btn {
    margin-left: auto;
    flex-shrink: 0;
  }
}
</style>
