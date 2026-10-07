<script setup lang="ts">
import { ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { managementService } from '@/services/management.service'
import type { Customer } from '@/types/api'

/**
 * Buscar o crear cliente en el mismo campo: se escribe el nombre como en la Base; si ya
 * existe se elige de la lista (no se duplica), si no, queda como cliente nuevo.
 */
const props = defineProps<{ name: string; customerId: string; phone: string }>()
const emit = defineEmits<{ pick: [customer: Customer | null, name: string]; 'update:phone': [value: string] }>()

const text = ref(props.name)
const results = ref<Customer[]>([])
const open = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(() => props.name, (n) => (text.value = n))

function onInput() {
  emit('pick', null, text.value)
  clearTimeout(timer)
  const q = text.value.trim()
  if (q.length < 2) return void (results.value = [])
  timer = setTimeout(async () => {
    try {
      results.value = (await managementService.customers({ q, limit: 6 })).items
      open.value = true
    } catch {
      results.value = []
    }
  }, 250)
}

function choose(c: Customer) {
  emit('pick', c, c.name)
  open.value = false
}

function close() {
  setTimeout(() => (open.value = false), 150)
}
</script>

<template>
  <div class="cp">
    <label class="field">
      <span class="field__label">Cliente *</span>
      <span class="cp__input">
        <AppIcon name="search" :size="18" class="cp__icon" />
        <input
          v-model="text"
          type="text"
          autocomplete="off"
          placeholder="Nombre del cliente"
          aria-autocomplete="list"
          :aria-expanded="open && results.length > 0"
          @input="onInput"
          @focus="open = results.length > 0"
          @blur="close"
        />
      </span>
    </label>
    <Transition name="fade-up">
      <ul v-if="open && results.length" class="cp__list" role="listbox">
        <li v-for="c in results" :key="c._id">
          <button type="button" class="cp__opt" role="option" @mousedown.prevent="choose(c)">
            <strong>{{ c.name || 'Sin nombre' }}</strong>
            <small>{{ c.phone || c.email || 'Sin teléfono' }} · {{ c.totalOrders || 0 }} servicios</small>
          </button>
        </li>
      </ul>
    </Transition>
    <p v-if="customerId" class="cp__state cp__state--ok"><AppIcon name="check" :size="14" /> Cliente registrado</p>
    <template v-else-if="name.trim().length > 1">
      <p class="cp__state"><AppIcon name="plus" :size="14" /> Cliente nuevo: se guarda al registrar</p>
      <label class="field">
        <span class="field__label">Teléfono (opcional)</span>
        <input :value="phone" type="tel" inputmode="tel" placeholder="0991234567" @input="emit('update:phone', ($event.target as HTMLInputElement).value)" />
      </label>
    </template>
  </div>
</template>

<style scoped lang="scss">
.cp {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__input {
    position: relative;
    display: block;

    input {
      padding-left: 2.4rem;
      width: 100%;
    }
  }

  &__icon {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: $ink-muted;
    pointer-events: none;
  }

  &__list {
    position: absolute;
    z-index: 20;
    top: calc(100% - 0.2rem);
    left: 0;
    right: 0;
    list-style: none;
    @include card(0.3rem);
    box-shadow: $shadow-lg;
    max-height: 280px;
    overflow-y: auto;
  }

  &__opt {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
    padding: 0.6rem 0.75rem;
    min-height: $tap;
    border-radius: $radius-sm;
    text-align: left;

    small {
      color: $ink-muted;
      font-size: $text-xs;
    }

    &:hover,
    &:focus-visible {
      background: $navy-soft;
    }
  }

  &__state {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: $text-xs;
    color: $ink-muted;

    &--ok {
      color: $success;
      font-weight: 600;
    }
  }
}
</style>
