<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { staffIncidentLabel } from '@/config/operationLabels'
import { errorMessage, todayISO } from '@/utils/format'
import type { User } from '@/types/api'
import type { StaffIncident, StaffIncidentType } from '@/types/operation'

/**
 * Registrar una novedad del personal: quién, qué pasó (botones grandes), cuándo y detalle.
 * Con `person` fijo (perfil) no se pregunta a quién.
 */
const props = defineProps<{ people?: User[]; person?: { _id: string; name: string } | null }>()
const emit = defineEmits<{ saved: [item: StaffIncident]; cancel: [] }>()
const toast = useToastStore()

const userId = ref(props.person?._id || '')
const query = ref('')
const type = ref<StaffIncidentType | ''>('')
const date = ref(todayISO())
const text = ref('')
const saving = ref(false)

const types = Object.entries(staffIncidentLabel) as [StaffIncidentType, (typeof staffIncidentLabel)[StaffIncidentType]][]
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const visiblePeople = computed(() =>
  (props.people || []).filter((p) => p.active && (!query.value.trim() || norm(p.name).includes(norm(query.value.trim())))),
)
const placeholder = computed(() =>
  type.value === 'late'
    ? 'Ej.: llegó 40 minutos tarde al servicio de las 08:00'
    : type.value === 'fight'
      ? 'Ej.: discutió con un compañero en la base'
      : type.value === 'customer_issue'
        ? 'Ej.: el cliente se quejó por el trato'
        : 'Cuenta qué pasó',
)

async function save() {
  if (!userId.value) return toast.error('Elige a la persona')
  if (!type.value) return toast.error('Elige qué pasó')
  if (type.value === 'other' && !text.value.trim()) return toast.error('Describe qué pasó')
  saving.value = true
  try {
    const item = await operationService.addStaffIncident({ user: userId.value, type: type.value, date: date.value, text: text.value.trim() })
    toast.success('Novedad guardada')
    emit('saved', item)
    type.value = ''
    text.value = ''
    if (!props.person) userId.value = ''
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="sif" novalidate @submit.prevent="save">
    <div v-if="!person" class="field">
      <span class="field__label">1. ¿Quién?</span>
      <div class="sif__search">
        <AppIcon name="search" :size="18" class="sif__search-icon" />
        <input v-model="query" type="search" placeholder="Buscar persona" autocomplete="off" aria-label="Buscar persona" />
      </div>
      <div class="sif__people" role="radiogroup" aria-label="Persona">
        <button
          v-for="p in visiblePeople"
          :key="p._id"
          type="button"
          class="sif__person"
          :class="{ 'is-on': userId === p._id }"
          role="radio"
          :aria-checked="userId === p._id"
          @click="userId = p._id"
        >
          <span class="sif__avatar" :style="{ background: p.color || '#1E2D3A' }">{{ p.name.charAt(0) }}</span>
          {{ p.name }}
        </button>
        <p v-if="!visiblePeople.length" class="sif__hint">No hay personas con ese nombre.</p>
      </div>
    </div>

    <div class="field">
      <span class="field__label">{{ person ? '1.' : '2.' }} ¿Qué pasó?</span>
      <div class="sif__types" role="radiogroup" aria-label="Tipo de novedad">
        <button
          v-for="[key, t] in types"
          :key="key"
          type="button"
          class="sif__type"
          :class="[`is-${t.tone}`, { 'is-on': type === key }]"
          role="radio"
          :aria-checked="type === key"
          @click="type = key"
        >
          <AppIcon :name="t.icon" :size="22" />
          <span>{{ t.label }}</span>
        </button>
      </div>
    </div>

    <div class="field">
      <span class="field__label">{{ person ? '2.' : '3.' }} ¿Cuándo?</span>
      <DatePicker v-model="date" :max="todayISO()" label="Fecha de la novedad" />
    </div>

    <label class="field">
      <span class="field__label">{{ person ? '3.' : '4.' }} Detalle {{ type === 'other' ? '' : '(opcional)' }}</span>
      <textarea v-model="text" rows="3" :placeholder="placeholder"></textarea>
    </label>

    <div class="sif__actions">
      <button type="button" class="btn btn--ghost" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="btn btn--primary" :disabled="saving"><AppIcon name="check" /> {{ saving ? 'Guardando…' : 'Guardar novedad' }}</button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.sif {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__search {
    position: relative;
    display: flex;

    input {
      flex: 1;
      padding-left: 2.4rem;
    }
  }

  &__search-icon {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: $ink-muted;
    pointer-events: none;
  }

  &__people {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    max-height: 200px;
    overflow-y: auto;
    padding: 0.1rem;
  }

  &__person {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 44px;
    padding: 0 0.85rem 0 0.35rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;

    &.is-on {
      border-color: $navy;
      background: $navy-soft;
      color: $navy;
    }
  }

  &__avatar {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #fff;
    font-size: $text-xs;
    font-weight: 800;
  }

  &__types {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;

    @include from('md') {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  &__type {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-height: $tap-lg;
    padding: 0.5rem 0.8rem;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: $text-sm;
    color: $ink;
    text-align: left;
    transition:
      border-color $dur-fast ease,
      transform $dur-fast $ease-out;

    svg {
      flex-shrink: 0;
    }

    &.is-warning svg {
      color: $warning;
    }

    &.is-danger svg {
      color: $danger;
    }

    &.is-navy svg,
    &.is-info svg {
      color: $navy;
    }

    &:active {
      transform: scale(0.98);
    }

    &.is-on {
      border-color: $navy;
      background: $navy-soft;
      box-shadow: inset 0 0 0 1px $navy;
    }
  }

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>
