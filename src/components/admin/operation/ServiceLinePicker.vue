<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { serviceCategory } from '@/config/labels'
import { money } from '@/utils/format'
import type { Service } from '@/types/api'
import type { EntryLine } from '@/composables/operation/useQuickEntry'

/**
 * Servicios de la fila: atajos de Classic Wash por tamaño (el 80 % de la Base), el resto del
 * catálogo como tarjetas con buscador y categorías, y "valor libre" para otro precio.
 */
const props = defineProps<{ services: Service[]; lines: EntryLine[] }>()
const emit = defineEmits<{ add: [service: Service, variant?: string]; free: [name: string, amount: number]; remove: [key: number] }>()

const classic = computed(() => props.services.find((s) => s.slug === 'classic-wash'))
const categories = computed(() => {
  const seen = new Set<string>()
  for (const s of props.services) seen.add(s.category)
  return [...seen].map((c) => ({ value: c, label: serviceCategory[c as Service['category']] || c }))
})

// Catálogo: buscar por nombre y filtrar por categoría; tocar una tarjeta la agrega.
const browsing = ref(false)
const query = ref('')
const category = ref('')
const norm = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const visible = computed(() =>
  props.services.filter(
    (s) => (!category.value || s.category === category.value) && (!query.value.trim() || norm(s.name).includes(norm(query.value.trim()))),
  ),
)
const fromPrice = (s: Service) => (s.variants?.length ? Math.min(...s.variants.map((v) => v.price)) : s.price)

const selectedId = ref('')
const selected = computed(() => props.services.find((s) => s._id === selectedId.value))
function choose(s: Service) {
  if (s.variants?.length) return void (selectedId.value = selectedId.value === s._id ? '' : s._id)
  emit('add', s)
  selectedId.value = ''
}
function pickVariant(label: string) {
  if (!selected.value) return
  emit('add', selected.value, label)
  selectedId.value = ''
}

const freeOpen = ref(false)
const freeName = ref('')
const freeAmount = ref(0)
function addFree() {
  if (freeAmount.value <= 0) return
  emit('free', freeName.value.trim(), freeAmount.value)
  freeName.value = ''
  freeAmount.value = 0
  freeOpen.value = false
}
</script>

<template>
  <div class="slp">
    <div v-if="classic?.variants?.length" class="slp__quick">
      <span class="field__label">Classic Wash · toca el tamaño</span>
      <div class="slp__quick-row">
        <button v-for="v in classic.variants" :key="v.label" type="button" class="slp__q" @click="emit('add', classic, v.label)">
          <span>{{ v.label }}</span><strong>{{ money(v.price) }}</strong>
        </button>
      </div>
    </div>

    <button v-if="!browsing" type="button" class="slp__open" @click="browsing = true">
      <AppIcon name="search" :size="18" />
      <span><strong>Otro servicio del catálogo</strong><small>Busca o elige por categoría</small></span>
      <AppIcon name="chevron-down" :size="18" />
    </button>
    <div v-else class="slp__catalog">
      <div class="slp__search">
        <AppIcon name="search" :size="18" class="slp__search-icon" />
        <input v-model="query" type="search" placeholder="Buscar servicio (ej.: tapicería, alfombra)" autocomplete="off" aria-label="Buscar servicio" />
        <button type="button" class="btn btn--ghost btn--icon" aria-label="Cerrar catálogo" @click="browsing = false; selectedId = ''"><AppIcon name="x" :size="18" /></button>
      </div>
      <div class="slp__cats" role="radiogroup" aria-label="Categoría">
        <button type="button" class="slp__cat" :class="{ 'is-on': !category }" role="radio" :aria-checked="!category" @click="category = ''">Todos</button>
        <button v-for="c in categories" :key="c.value" type="button" class="slp__cat" :class="{ 'is-on': category === c.value }" role="radio" :aria-checked="category === c.value" @click="category = c.value">{{ c.label }}</button>
      </div>
      <div class="slp__cards">
        <button
          v-for="s in visible"
          :key="s._id"
          type="button"
          class="slp__card"
          :class="{ 'is-on': selectedId === s._id }"
          :aria-expanded="s.variants?.length ? selectedId === s._id : undefined"
          @click="choose(s)"
        >
          <span class="slp__card-name">{{ s.name }}</span>
          <small>{{ s.variants?.length ? `${s.variants.length} opciones · desde ` : '' }}<strong>{{ money(fromPrice(s)) }}</strong></small>
          <AppIcon :name="s.variants?.length ? 'chevron-down' : 'plus'" :size="16" class="slp__card-icon" />
        </button>
        <p v-if="!visible.length" class="slp__empty">No hay servicios con “{{ query }}”. Usa “Valor libre”.</p>
      </div>
    </div>
    <Transition name="fade-up">
      <div v-if="selected?.variants?.length" class="slp__variants">
        <span class="field__label">{{ selected.name }}: elige la opción</span>
        <div class="slp__quick-row">
          <button v-for="v in selected.variants" :key="v.label" type="button" class="slp__q" @click="pickVariant(v.label)">
            <span>{{ v.label }}</span><strong>{{ money(v.price) }}</strong>
          </button>
        </div>
      </div>
    </Transition>

    <button v-if="!freeOpen" type="button" class="btn btn--ghost btn--sm slp__free-btn" @click="freeOpen = true">
      <AppIcon name="edit" :size="16" /> Valor libre (otro precio o servicio)
    </button>
    <Transition name="fade-up">
      <div v-if="freeOpen" class="slp__free">
        <label class="field"><span class="field__label">Descripción</span><input v-model="freeName" type="text" placeholder="Ej.: Lavada de motor" /></label>
        <MoneyField v-model="freeAmount" label="Valor" />
        <div class="slp__free-actions">
          <button type="button" class="btn btn--ghost btn--sm" @click="freeOpen = false">Cancelar</button>
          <button type="button" class="btn btn--primary btn--sm" :disabled="freeAmount <= 0" @click="addFree">Agregar</button>
        </div>
      </div>
    </Transition>

    <TransitionGroup v-if="lines.length" name="fade-up" tag="ul" class="slp__lines">
      <li v-for="l in lines" :key="l.key" class="slp__line">
        <span class="slp__line-name">
          <strong>{{ l.name }}</strong>
          <small v-if="l.variant">{{ l.variant }}</small>
          <small v-else-if="!l.service">Valor libre</small>
        </span>
        <QuantityStepper v-model="l.quantity" :min="1" :label="l.name" />
        <strong class="money slp__line-sum">{{ money(l.unitPrice * l.quantity) }}</strong>
        <button type="button" class="btn btn--ghost btn--icon" :aria-label="`Quitar ${l.name}`" @click="emit('remove', l.key)">
          <AppIcon name="x" :size="18" />
        </button>
      </li>
    </TransitionGroup>
    <p v-else class="slp__empty">Aún no hay servicios en esta fila.</p>
  </div>
</template>

<style scoped lang="scss">
.slp {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;

  &__quick,
  &__variants {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__quick-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;

    @include from('md') {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  &__q {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
    min-height: 56px;
    padding: 0.5rem 0.75rem;
    border-radius: $radius-md;
    border: 1.5px solid $line-strong;
    background: $surface;
    text-align: left;
    font-size: $text-sm;
    transition:
      border-color $dur-fast ease,
      transform $dur-fast $ease-out;

    strong {
      color: $navy;
    }

    &:hover {
      border-color: $navy;
    }

    &:active {
      transform: scale(0.97);
    }
  }

  &__open {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: $tap-lg;
    padding: 0.5rem 0.9rem;
    border-radius: $radius-md;
    border: 1.5px dashed $line-strong;
    background: $surface;
    color: $navy;
    text-align: left;

    span {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }

    &:hover {
      border-color: $navy;
    }
  }

  &__catalog {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.75rem;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    background: $sky;
  }

  &__search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.3rem;

    input {
      flex: 1;
      min-width: 0;
      padding-left: 2.4rem;
    }
  }

  &__search-icon {
    position: absolute;
    left: 0.8rem;
    color: $ink-muted;
    pointer-events: none;
  }

  &__cats {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    padding-bottom: 0.15rem;
  }

  &__cat {
    flex-shrink: 0;
    min-height: 36px;
    padding: 0 0.85rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;

    &.is-on {
      border-color: $navy;
      background: $navy;
      color: #fff;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 0.45rem;
    max-height: 320px;
    overflow-y: auto;
  }

  &__card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-height: 64px;
    padding: 0.55rem 2rem 0.55rem 0.75rem;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    background: $surface;
    text-align: left;
    transition:
      border-color $dur-fast ease,
      transform $dur-fast $ease-out;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }

    strong {
      color: $navy;
    }

    &:hover,
    &.is-on {
      border-color: $navy;
    }

    &.is-on {
      background: $navy-soft;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &__card-name {
    font-size: $text-sm;
    font-weight: 700;
    color: $ink;
  }

  &__card-icon {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    color: $navy;
  }

  &__free-btn {
    align-self: flex-start;
  }

  &__free {
    display: grid;
    gap: 0.6rem;
    padding: 0.75rem;
    border-radius: $radius-md;
    background: $sky;
  }

  &__free-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  &__lines {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__line {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 0.4rem 0.6rem;
    padding: 0.55rem 0.4rem 0.55rem 0.75rem;
    border-radius: $radius-md;
    background: $navy-soft;

    :deep(.stepper) {
      grid-row: 2;
      grid-column: 1;
      justify-self: start;
    }
  }

  &__line-name {
    grid-column: 1 / 3;
    display: flex;
    flex-direction: column;
    min-width: 0;

    small {
      color: $ink-muted;
      font-size: $text-xs;
    }
  }

  &__line-sum {
    grid-row: 2;
    grid-column: 2;
  }

  &__line .btn--icon {
    grid-row: 1;
    grid-column: 3;
  }

  &__empty {
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
