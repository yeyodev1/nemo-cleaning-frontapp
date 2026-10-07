<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { positionLabel } from '@/config/operationLabels'
import { managementService, type UserInput } from '@/services/management.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { options, roleLabel } from '@/config/labels'
import { errorMessage } from '@/utils/format'
import type { User } from '@/types/api'

const props = defineProps<{ open: boolean; user: User | null; people?: User[] }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const scope = useAdminScope()
const toast = useToastStore()
const saving = ref(false)

const blank = (): UserInput => ({
  name: '',
  email: '',
  phone: '',
  role: 'operator',
  branches: [],
  active: true,
  color: '#F05E23',
  position: 'washer',
  monthlySalary: 0,
  commissions: true,
  supervisor: null,
})
const form = reactive<UserInput>(blank())

watch(
  () => props.open,
  (o) => {
    if (!o) return
    const u = props.user
    Object.assign(form, u ? { ...blank(), ...u, branches: [...(u.branches || [])] } : blank())
  },
)

// Quien cobra el FEE supervisor: preferimos a los de cargo Supervisor, pero cualquiera activo sirve.
const supervisors = computed(() =>
  (props.people || [])
    .filter((p) => p.active && p._id !== props.user?._id)
    .sort((a, b) => Number(b.position === 'supervisor') - Number(a.position === 'supervisor') || a.name.localeCompare(b.name)),
)

async function save() {
  saving.value = true
  try {
    const body: UserInput = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      branches: form.branches,
      active: form.active,
      color: form.color,
      position: form.position,
      monthlySalary: form.monthlySalary,
      commissions: form.commissions,
      supervisor: form.supervisor || null,
    }
    if (props.user) await managementService.updateUser(props.user._id, body)
    else await managementService.createUser(body)
    toast.success('Usuario guardado')
    scope.load(true)
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" :title="user ? 'Editar persona' : 'Nueva persona'" @close="emit('close')">
    <form id="user-form" class="form" @submit.prevent="save">
      <label class="field"><span class="field__label">Nombre</span><input v-model="form.name" type="text" required autocomplete="off" /></label>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Correo {{ form.role === 'operator' ? '(opcional)' : '' }}</span>
          <input v-model="form.email" type="email" :required="form.role !== 'operator'" autocomplete="off" />
          <span class="field__hint">{{ form.email ? 'Entra al panel con un código que llega a este correo.' : 'Sin correo = sin acceso al panel (igual cuenta en producción, turnos y nómina).' }}</span>
        </label>
        <label class="field"><span class="field__label">Teléfono</span><input v-model="form.phone" type="tel" /></label>
      </div>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Rol</span>
          <select v-model="form.role">
            <option v-for="o in options(roleLabel)" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Color en la agenda</span>
          <input v-model="form.color" type="color" class="color" />
        </label>
      </div>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Cargo</span>
          <select v-model="form.position">
            <option value="">Sin cargo</option>
            <option v-for="(l, k) in positionLabel" :key="k" :value="k">{{ l }}</option>
          </select>
        </label>
        <MoneyField :model-value="form.monthlySalary || 0" label="Sueldo mensual" @update:model-value="form.monthlySalary = $event" hint="Solo se propone en los meses nuevos de Nómina; cada mes se edita allí." />
      </div>
      <label class="check"><input v-model="form.commissions" type="checkbox" /> Cuenta en la calculadora FEE (solo referencia)</label>
      <label v-if="form.commissions" class="field">
        <span class="field__label">Supervisor que cobra su "FEE supervisor"</span>
        <select v-model="form.supervisor">
          <option :value="null">El supervisor general</option>
          <option v-for="p in supervisors" :key="p._id" :value="p._id">{{ p.name }}</option>
        </select>
      </label>
      <fieldset class="field">
        <legend class="field__label">Sucursales</legend>
        <label v-for="b in scope.branches" :key="b._id" class="check">
          <input v-model="form.branches" type="checkbox" :value="b._id" /> {{ b.name }}
        </label>
        <span v-if="form.role === 'admin'" class="field__hint">Gerencia ve todas las sucursales.</span>
      </fieldset>
      <label class="check"><input v-model="form.active" type="checkbox" /> Activo{{ form.email ? ' (puede ingresar al panel)' : '' }}</label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="user-form" class="btn btn--primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

fieldset {
  border: 0;
}

.color {
  padding: 4px;
  cursor: pointer;
}
</style>
