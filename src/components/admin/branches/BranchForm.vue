<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import ZonesEditor from '@/components/admin/operation/ZonesEditor.vue'
import { managementService, type BranchInput } from '@/services/management.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { slugify } from '@/composables/admin/useCrudList'
import { errorMessage } from '@/utils/format'
import type { Branch } from '@/types/api'

const props = defineProps<{ open: boolean; branch: Branch | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const scope = useAdminScope()
const toast = useToastStore()
const saving = ref(false)
const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const blank = (): BranchInput => ({
  name: '',
  slug: '',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  active: true,
  openingTime: '08:00',
  closingTime: '18:00',
  slotMinutes: 60,
  workDays: [1, 2, 3, 4, 5, 6],
  zones: [],
})
const form = reactive<BranchInput>(blank())

watch(
  () => props.open,
  (o) => {
    if (!o) return
    const b = props.branch
    Object.assign(form, b ? { ...blank(), ...b, workDays: [...(b.workDays || [])], zones: [...(b.zones || [])] } : blank())
  },
)

async function save() {
  saving.value = true
  try {
    const body: BranchInput = { ...form, slug: form.slug || slugify(form.name), workDays: [...form.workDays].sort() }
    delete (body as Partial<Branch>)._id
    if (props.branch) await managementService.updateBranch(props.branch._id, body)
    else await managementService.createBranch(body)
    toast.success('Sucursal guardada')
    await scope.load(true)
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" :title="branch ? 'Editar sucursal' : 'Nueva sucursal'" @close="emit('close')">
    <form id="branch-form" class="form" @submit.prevent="save">
      <div class="form-row">
        <label class="field"><span class="field__label">Nombre</span><input v-model="form.name" type="text" required /></label>
        <label class="field"><span class="field__label">Slug</span><input v-model="form.slug" type="text" pattern="[a-z0-9\-]*" placeholder="via-a-la-costa" /></label>
      </div>
      <label class="field"><span class="field__label">Dirección</span><input v-model="form.address" type="text" /></label>
      <div class="form-row">
        <label class="field"><span class="field__label">Teléfono</span><input v-model="form.phone" type="tel" /></label>
        <label class="field"><span class="field__label">WhatsApp</span><input v-model="form.whatsapp" type="tel" placeholder="0991234567" /></label>
      </div>
      <label class="field"><span class="field__label">Correo</span><input v-model="form.email" type="email" /></label>
      <div class="form-row">
        <label class="field"><span class="field__label">Abre</span><input v-model="form.openingTime" type="time" required /></label>
        <label class="field"><span class="field__label">Cierra</span><input v-model="form.closingTime" type="time" required /></label>
        <label class="field"><span class="field__label">Turno (min)</span><input v-model.number="form.slotMinutes" type="number" min="15" step="15" required /></label>
      </div>
      <fieldset class="field">
        <legend class="field__label">Días de atención</legend>
        <div class="days">
          <label v-for="(d, i) in days" :key="d" class="day" :class="{ 'is-on': form.workDays.includes(i) }">
            <input v-model="form.workDays" type="checkbox" :value="i" class="sr-only" /> {{ d }}
          </label>
        </div>
      </fieldset>
      <div class="field">
        <span class="field__label">Urbanizaciones que atiende</span>
        <ZonesEditor :model-value="form.zones || []" @update:model-value="form.zones = $event" />
        <span class="field__hint">Aparecen al reservar en la web y en el registro de producción.</span>
      </div>
      <label class="check"><input v-model="form.active" type="checkbox" /> Activa (recibe reservas)</label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="branch-form" class="btn btn--primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
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

.days {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.day {
  min-width: $tap;
  min-height: $tap;
  padding: 0 0.6rem;
  border-radius: $radius-sm;
  border: 1.5px solid $line;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: $text-sm;
  font-weight: 700;
  cursor: pointer;
  color: $ink-soft;

  &.is-on {
    background: $navy;
    border-color: $navy;
    color: #fff;
  }

  &:focus-within {
    outline: 2.5px solid $orange-deep;
    outline-offset: 2px;
  }
}
</style>
