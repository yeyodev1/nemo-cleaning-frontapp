<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { managementService } from '@/services/management.service'
import { money } from '@/utils/format'
import type { Customer } from '@/types/api'

/**
 * Busca un cliente ya registrado por nombre, teléfono, correo o cédula. Al elegirlo
 * el formulario se llena solo con sus datos y su última dirección y ubicación.
 */
defineProps<{ picked: Customer | null }>()
const emit = defineEmits<{ pick: [customer: Customer | null] }>()

const text = ref('')
const results = ref<Customer[]>([])
const open = ref(false)
const searching = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function onInput() {
  clearTimeout(timer)
  const q = text.value.trim()
  if (q.length < 2) return void ((results.value = []), (open.value = false))
  timer = setTimeout(async () => {
    searching.value = true
    try {
      results.value = (await managementService.customers({ q, limit: 6 })).items
      open.value = true
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 250)
}

function choose(c: Customer) {
  emit('pick', c)
  text.value = ''
  results.value = []
  open.value = false
}

function close() {
  setTimeout(() => (open.value = false), 150)
}
</script>

<template>
  <div class="cs">
    <div v-if="picked" class="cs__picked">
      <AppIcon name="check-circle" :size="20" />
      <span>
        <strong>{{ picked.name || 'Sin nombre' }}</strong>
        <small>Cliente registrado · {{ picked.totalOrders || 0 }} servicio(s). Sus datos ya están puestos abajo.</small>
        <small v-if="picked.credit" class="cs__credit">Tiene {{ money(picked.credit) }} de saldo a favor: descuéntalo en el pago.</small>
      </span>
      <button type="button" class="btn btn--ghost btn--sm" @click="emit('pick', null)">Cambiar</button>
    </div>
    <template v-else>
      <label class="field">
        <span class="field__label">Buscar cliente registrado</span>
        <span class="cs__input">
          <AppIcon name="search" :size="18" class="cs__icon" />
          <input
            v-model="text"
            type="search"
            autocomplete="off"
            placeholder="Nombre, teléfono, correo o cédula"
            :aria-expanded="open && results.length > 0"
            @input="onInput"
            @focus="open = results.length > 0"
            @blur="close"
          />
        </span>
        <span class="field__hint">Si ya existe, se llenan sus datos. Si es nuevo, escríbelos abajo y queda registrado al agendar.</span>
      </label>
      <ul v-if="open && results.length" class="cs__list" role="listbox">
        <li v-for="c in results" :key="c._id">
          <button type="button" class="cs__opt" role="option" @mousedown.prevent="choose(c)">
            <strong>{{ c.name || 'Sin nombre' }}</strong>
            <small>{{ c.phone || c.email || 'Sin teléfono' }}<template v-if="c.address"> · {{ c.address }}</template> · {{ c.totalOrders || 0 }} servicio(s)</small>
          </button>
        </li>
      </ul>
      <p v-else-if="open && !searching && text.trim().length > 1" class="cs__none">No está registrado: escribe sus datos abajo.</p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.cs {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__input {
    position: relative;
    display: block;

    input {
      width: 100%;
      padding-left: 2.4rem;
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
    display: flex;
    flex-direction: column;
    border: 1.5px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    overflow: hidden;
  }

  &__opt {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    min-height: $tap;
    padding: 0.55rem 0.8rem;
    text-align: left;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }

    &:hover,
    &:focus-visible {
      background: $navy-soft;
    }
  }

  &__none {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__credit {
    color: $success !important;
    font-weight: 700;
  }

  &__picked {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 0.9rem;
    border-radius: $radius-sm;
    background: $navy-soft;
    color: $navy;

    span {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    small {
      font-size: $text-xs;
      color: $ink-soft;
    }

    svg {
      color: $success;
      flex-shrink: 0;
    }
  }
}
</style>
