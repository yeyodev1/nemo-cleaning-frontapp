<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { useAdminScope } from '@/stores/adminScope'
import { staffIncidentLabel } from '@/config/operationLabels'
import { errorMessage, todayISO } from '@/utils/format'
import type { User } from '@/types/api'
import type { StaffIncident, StaffIncidentType } from '@/types/operation'

/**
 * Registrar una novedad: quién, qué pasó (botones grandes), cuándo y detalle.
 * Con `person` fijo (perfil) no se pregunta a quién; con `general` no es de nadie en
 * particular (atraso, inconsistencia de la sucursal) y se pregunta la sucursal.
 */
const props = defineProps<{ people?: User[]; person?: { _id: string; name: string } | null; general?: boolean }>()
const scope = useAdminScope()
const branch = ref(scope.branch || scope.visibleBranches[0]?._id || '')
const emit = defineEmits<{ saved: [item: StaffIncident]; cancel: [] }>()
const toast = useToastStore()

const userId = ref(props.person?._id || '')
const query = ref('')
const type = ref<StaffIncidentType | ''>('')
const date = ref(todayISO())
const text = ref('')
const saving = ref(false)

// En una general no aplican faltas ni peleas (esas son de una persona).
const types = computed(() =>
  (Object.entries(staffIncidentLabel) as [StaffIncidentType, (typeof staffIncidentLabel)[StaffIncidentType]][]).filter(
    ([k]) => !props.general || !['absence', 'fight'].includes(k),
  ),
)
const steps = computed(() => (props.person ? 0 : 1))
// Un atraso siempre es de alguien: en una general la persona pasa a ser obligatoria.
const needsPerson = computed(() => !props.general || type.value === 'late')
const missingPerson = ref(false)
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
        : type.value === 'inconsistency'
          ? 'Ej.: la caja no cuadra con lo registrado en la Base ($15 de diferencia)'
          : 'Cuenta qué pasó',
)

async function save() {
  if (!type.value) return toast.error('Elige qué pasó')
  if (!props.person && needsPerson.value && !userId.value) {
    missingPerson.value = true
    return toast.error(type.value === 'late' ? 'Elige al operador que llegó tarde' : 'Elige a la persona')
  }
  // General sin persona: el detalle es lo único que explica qué pasó.
  if (((props.general && !userId.value) || type.value === 'other') && !text.value.trim()) return toast.error('Describe qué pasó')
  saving.value = true
  try {
    const item = await operationService.addStaffIncident({
      ...(userId.value ? { user: userId.value } : { branch: branch.value || undefined }),
      type: type.value,
      date: date.value,
      text: text.value.trim(),
    })
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
    <div v-if="general && scope.visibleBranches.length > 1" class="field">
      <span class="field__label">Sucursal</span>
      <div class="sif__people" role="radiogroup" aria-label="Sucursal">
        <button
          v-for="b in scope.visibleBranches"
          :key="b._id"
          type="button"
          class="sif__person"
          :class="{ 'is-on': branch === b._id }"
          role="radio"
          :aria-checked="branch === b._id"
          @click="branch = b._id"
        >
          {{ b.name }}
        </button>
      </div>
    </div>

    <div v-if="!person" class="field" :class="{ 'sif__need': missingPerson && !userId }">
      <span class="field__label">
        1. ¿Quién?
        <template v-if="general">{{ type === 'late' ? '(obligatorio en un atraso)' : '(opcional)' }}</template>
      </span>
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
          @click="userId = userId === p._id && general ? '' : p._id; missingPerson = false"
        >
          <span class="sif__avatar" :style="{ background: p.color || '#1E2D3A' }">{{ p.name.charAt(0) }}</span>
          {{ p.name }}
        </button>
        <p v-if="!visiblePeople.length" class="sif__hint">No hay personas con ese nombre.</p>
      </div>
    </div>

    <div class="field">
      <span class="field__label">{{ 1 + steps }}. ¿Qué pasó?</span>
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
      <span class="field__label">{{ 2 + steps }}. ¿Cuándo?</span>
      <DatePicker v-model="date" :max="todayISO()" label="Fecha de la novedad" />
    </div>

    <label class="field">
      <span class="field__label">{{ 3 + steps }}. Detalle {{ (general && !userId) || type === 'other' ? '' : '(opcional)' }}</span>
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

  &__need {
    padding: 0.6rem;
    border-radius: $radius-md;
    background: $danger-bg;
    box-shadow: inset 0 0 0 1.5px $danger;
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
