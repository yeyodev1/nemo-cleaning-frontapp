<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import ColorSwatches from '@/components/ui/ColorSwatches.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { positionLabel } from '@/config/operationLabels'
import { managementService, type UserInput } from '@/services/management.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { options, roleLabel } from '@/config/labels'
import { errorMessage } from '@/utils/format'
import type { Role, User } from '@/types/api'

const props = defineProps<{ open: boolean; user: User | null; people?: User[] }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const scope = useAdminScope()
const toast = useToastStore()
const saving = ref(false)

// Contraseña: al crear es opcional; al editar se cambia aparte, en cualquier momento.
const password = ref('')
const showPassword = ref(false)
const savingPassword = ref(false)
const hasPassword = ref(false)

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

// Mismos campos que se guardan: si difieren de la foto tomada al abrir, hay cambios sin guardar.
const payload = (): UserInput => ({
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
})
const snapshot = ref('')
const dirty = computed(() => Boolean(password.value) || JSON.stringify(payload()) !== snapshot.value)

watch(
  () => props.open,
  (o) => {
    if (!o) return
    const u = props.user
    Object.assign(form, u ? { ...blank(), ...u, branches: [...(u.branches || [])] } : blank())
    password.value = ''
    showPassword.value = false
    hasPassword.value = Boolean(u?.hasPassword)
    snapshot.value = JSON.stringify(payload())
  },
)

const roleHint: Record<Role, string> = { admin: 'Ve todo', manager: 'Ve su sucursal', operator: 'Ve sus servicios' }
const roleOptions = options(roleLabel).map((o) => ({ ...o, hint: roleHint[o.value] }))
const positionOptions = [
  { value: '', label: 'Sin cargo' },
  ...Object.entries(positionLabel).map(([value, label]) => ({ value, label: String(label) })),
]
const branchOptions = computed(() => scope.branches.map((b) => ({ value: b._id, label: b.name })))

// ChoiceChips trabaja con textos: el supervisor general (null) viaja como '__general'.
const GENERAL = '__general'
const supervisorOptions = computed(() => [
  { value: GENERAL, label: 'Supervisor general' },
  ...supervisors.value.map((p) => ({ value: p._id, label: p.name })),
])
const supervisorChoice = computed({
  get: () => form.supervisor || GENERAL,
  set: (v: string) => (form.supervisor = v === GENERAL ? null : v),
})

// Quien cobra el FEE supervisor: preferimos a los de cargo Supervisor, pero cualquiera activo sirve.
const supervisors = computed(() =>
  (props.people || [])
    .filter((p) => p.active && p._id !== props.user?._id)
    .sort((a, b) => Number(b.position === 'supervisor') - Number(a.position === 'supervisor') || a.name.localeCompare(b.name)),
)

async function savePassword(value: string | null) {
  if (!props.user) return
  if (value !== null && value.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
  savingPassword.value = true
  try {
    const u = await managementService.setUserPassword(props.user._id, value)
    hasPassword.value = Boolean(u.hasPassword)
    password.value = ''
    toast.success(value === null ? 'Contraseña quitada: entra con código al correo' : `Contraseña guardada para ${props.user.name}`)
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    savingPassword.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const body: UserInput = payload()
    if (password.value && password.value.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
    if (props.user) await managementService.updateUser(props.user._id, body)
    else await managementService.createUser({ ...body, ...(password.value ? { password: password.value } : {}) })
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
  <BaseSheet :open="open" :title="user ? 'Editar persona' : 'Nueva persona'" :dirty="dirty && !saving" @close="emit('close')">
    <form id="user-form" class="form" @submit.prevent="save">
      <label class="field"><span class="field__label">Nombre</span><input v-model="form.name" type="text" required autocomplete="off" /></label>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Correo {{ form.role === 'operator' ? '(opcional)' : '' }}</span>
          <input v-model="form.email" type="email" :required="form.role !== 'operator'" autocomplete="off" />
          <span class="field__hint">{{ form.email ? 'Entra al panel con este correo: con contraseña o con un código que llega aquí.' : 'Sin correo = sin acceso al panel (igual cuenta en producción, turnos y nómina).' }}</span>
        </label>
        <label class="field"><span class="field__label">Teléfono</span><input v-model="form.phone" type="tel" /></label>
      </div>
      <section v-if="form.email" class="pw">
        <div class="pw__head">
          <strong>Contraseña de acceso</strong>
          <span v-if="user" class="pw__state" :class="{ 'is-on': hasPassword }">{{ hasPassword ? 'Tiene contraseña' : 'Sin contraseña (entra con código)' }}</span>
        </div>
        <div class="pw__row">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :placeholder="user ? (hasPassword ? 'Nueva contraseña' : 'Ponle una contraseña') : 'Contraseña (opcional)'"
            aria-label="Contraseña"
          />
          <button type="button" class="btn btn--ghost btn--sm" @click="showPassword = !showPassword">{{ showPassword ? 'Ocultar' : 'Ver' }}</button>
          <button v-if="user" type="button" class="btn btn--primary btn--sm" :disabled="savingPassword || !password" @click="savePassword(password)">
            {{ savingPassword ? 'Guardando…' : hasPassword ? 'Cambiar' : 'Guardar' }}
          </button>
        </div>
        <p class="field__hint">
          Mínimo 6 caracteres. Pásasela a la persona; si la olvida, puede recuperarla con un código al correo o entrar con código.
          <button v-if="user && hasPassword" type="button" class="link" :disabled="savingPassword" @click="savePassword(null)">Quitar contraseña</button>
        </p>
      </section>
      <div class="field">
        <span class="field__label">Rol</span>
        <ChoiceChips :options="roleOptions" :model-value="form.role" label="Rol" @update:model-value="form.role = $event as Role" />
        <span class="field__hint">{{ roleLabel[form.role] }}: {{ roleHint[form.role].toLowerCase() }}.</span>
      </div>
      <div class="field">
        <span class="field__label">Color en la agenda</span>
        <ColorSwatches :model-value="form.color || ''" @update:model-value="form.color = $event" label="Color en la agenda" />
      </div>
      <div class="field">
        <span class="field__label">Cargo</span>
        <ChoiceChips
          :options="positionOptions"
          :model-value="form.position || ''"
          label="Cargo"
          @update:model-value="form.position = $event as UserInput['position']"
        />
      </div>
      <MoneyField :model-value="form.monthlySalary || 0" label="Sueldo mensual" @update:model-value="form.monthlySalary = $event" hint="Solo se propone en los meses nuevos de Nómina; cada mes se edita allí." />
      <ToggleSwitch :model-value="Boolean(form.commissions)" @update:model-value="form.commissions = $event" label="Cuenta en la calculadora FEE" hint="Solo referencia." />
      <div v-if="form.commissions" class="field">
        <span class="field__label">Supervisor que cobra su "FEE supervisor"</span>
        <ChoiceChips v-model="supervisorChoice" :options="supervisorOptions" label="Supervisor" small />
      </div>
      <div class="field">
        <span class="field__label">Sucursales</span>
        <ChoiceChips
          :options="branchOptions"
          :model-value="form.branches"
          label="Sucursales"
          multiple
          @update:model-value="form.branches = $event as string[]"
        />
        <span v-if="form.role === 'admin'" class="field__hint">Gerencia ve todas las sucursales.</span>
      </div>
      <ToggleSwitch :model-value="Boolean(form.active)" @update:model-value="form.active = $event" label="Activo" :hint="form.email ? 'Puede ingresar al panel.' : undefined" />
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

.pw {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.8rem;
  border-radius: $radius-md;
  background: $navy-soft;

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    color: $navy;
  }

  &__state {
    padding: 0.15rem 0.6rem;
    border-radius: $radius-pill;
    background: $warning-bg;
    color: $warning;
    font-size: $text-xs;
    font-weight: 700;

    &.is-on {
      background: $success-bg;
      color: $success;
    }
  }

  &__row {
    display: flex;
    gap: 0.4rem;
    align-items: center;

    input {
      flex: 1;
      min-width: 0;
    }
  }
}
</style>
