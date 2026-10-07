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
 * catálogo en un selector y "valor libre" para lo que no está en el catálogo o tuvo otro precio.
 */
const props = defineProps<{ services: Service[]; lines: EntryLine[] }>()
const emit = defineEmits<{ add: [service: Service, variant?: string]; free: [name: string, amount: number]; remove: [key: number] }>()

const classic = computed(() => props.services.find((s) => s.slug === 'classic-wash'))
const groups = computed(() => {
  const map = new Map<string, Service[]>()
  for (const s of props.services) map.set(s.category, [...(map.get(s.category) || []), s])
  return [...map.entries()].map(([cat, list]) => ({ label: serviceCategory[cat as Service['category']] || cat, list }))
})

const selectedId = ref('')
const selected = computed(() => props.services.find((s) => s._id === selectedId.value))
function onSelect() {
  const s = selected.value
  if (s && !s.variants?.length) {
    emit('add', s)
    selectedId.value = ''
  }
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

    <label class="field">
      <span class="field__label">Otro servicio del catálogo</span>
      <select v-model="selectedId" @change="onSelect">
        <option value="">Elige un servicio…</option>
        <optgroup v-for="g in groups" :key="g.label" :label="g.label">
          <option v-for="s in g.list" :key="s._id" :value="s._id">{{ s.name }}</option>
        </optgroup>
      </select>
    </label>
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
