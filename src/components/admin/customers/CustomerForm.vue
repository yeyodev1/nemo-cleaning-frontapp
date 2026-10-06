<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import { managementService, type CustomerInput } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { Customer } from '@/types/api'

const props = defineProps<{ open: boolean; customer: Customer }>()
const emit = defineEmits<{ close: []; saved: [c: Customer] }>()
const toast = useToastStore()
const saving = ref(false)
const form = reactive<CustomerInput>({})

watch(
  () => props.open,
  (o) => {
    if (!o) return
    const c = props.customer
    Object.assign(form, {
      name: c.name,
      email: c.email,
      phone: c.phone,
      documentId: c.documentId || '',
      address: c.address || '',
      notes: c.notes || '',
    })
  },
)

async function save() {
  saving.value = true
  try {
    const c = await managementService.updateCustomer(props.customer._id, { ...form })
    toast.success('Cliente actualizado')
    emit('saved', c)
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" title="Editar cliente" @close="emit('close')">
    <form id="customer-form" class="form" @submit.prevent="save">
      <label class="field"><span class="field__label">Nombre</span><input v-model="form.name" type="text" required autocomplete="off" /></label>
      <div class="form-row">
        <label class="field"><span class="field__label">Teléfono</span><input v-model="form.phone" type="tel" required /></label>
        <label class="field"><span class="field__label">Correo</span><input v-model="form.email" type="email" /></label>
      </div>
      <label class="field"><span class="field__label">Cédula o RUC</span><input v-model="form.documentId" type="text" inputmode="numeric" /></label>
      <label class="field"><span class="field__label">Dirección</span><input v-model="form.address" type="text" /></label>
      <label class="field"><span class="field__label">Notas internas</span><textarea v-model="form.notes"></textarea></label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="customer-form" class="btn btn--primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
</style>
