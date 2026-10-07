<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import VariantsEditor from './VariantsEditor.vue'
import TiersEditor from './TiersEditor.vue'
import { managementService, type ServiceInput } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { slugify } from '@/composables/admin/useCrudList'
import { options, serviceCategory, serviceUnit } from '@/config/labels'
import { errorMessage } from '@/utils/format'
import type { Service } from '@/types/api'

const props = defineProps<{ open: boolean; service: Service | null; nextOrder: number }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const toast = useToastStore()
const saving = ref(false)
const slugTouched = ref(false)
// "Qué incluye": una viñeta por línea.
const featuresText = ref('')

const blank = (): ServiceInput => ({
  name: '',
  slug: '',
  category: 'autos',
  description: '',
  imageUrl: '',
  price: 0,
  priceMax: 0,
  unit: 'unidad',
  durationMinutes: 60,
  durationLabel: '',
  deliveryNote: '',
  priceNote: '',
  features: [],
  variants: [],
  priceTiers: [],
  minQty: 1,
  isExtra: false,
  active: true,
  order: props.nextOrder,
})
const form = reactive<ServiceInput>(blank())

watch(
  () => props.open,
  (o) => {
    if (!o) return
    const s = props.service
    // Copias profundas: editar una opción no debe tocar la lista hasta guardar.
    Object.assign(form, s ? { ...blank(), ...JSON.parse(JSON.stringify(s)) } : blank())
    featuresText.value = (form.features || []).join('\n')
    slugTouched.value = Boolean(s)
  },
)
watch(
  () => form.name,
  (n) => {
    if (!slugTouched.value) form.slug = slugify(n)
  },
)

async function save() {
  saving.value = true
  try {
    const body: ServiceInput = {
      ...form,
      features: featuresText.value.split('\n').map((f) => f.trim()).filter(Boolean),
    }
    delete (body as Partial<Service>)._id
    delete (body as Partial<Service> & { createdAt?: string }).createdAt
    delete (body as Partial<Service> & { updatedAt?: string }).updatedAt
    if (props.service) await managementService.updateService(props.service._id, body)
    else await managementService.createService(body)
    toast.success('Servicio guardado')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseSheet :open="open" :title="service ? 'Editar servicio' : 'Nuevo servicio'" @close="emit('close')">
    <form id="service-form" class="form" @submit.prevent="save">
      <label class="field"><span class="field__label">Nombre</span><input v-model="form.name" type="text" required /></label>
      <label class="field">
        <span class="field__label">Slug</span>
        <input v-model="form.slug" type="text" required pattern="[a-z0-9\-]+" @input="slugTouched = true" />
      </label>
      <label class="check"><input v-model="form.isExtra" type="checkbox" /> Es un adicional (se suma a otro servicio)</label>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Categoría</span>
          <select v-model="form.category">
            <option v-for="o in options(serviceCategory)" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Unidad</span>
          <select v-model="form.unit">
            <option v-for="o in options(serviceUnit)" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
      </div>
      <div class="form-row">
        <MoneyField
          v-model="form.price"
          label="Precio base"
          :hint="form.variants.length || form.priceTiers.length ? 'Se calcula con las opciones o tramos' : ''"
          required
        />
        <label class="field">
          <span class="field__label">Duración interna (min)</span>
          <input v-model.number="form.durationMinutes" type="number" min="0" step="5" />
        </label>
        <label class="field"><span class="field__label">Orden</span><input v-model.number="form.order" type="number" min="0" /></label>
      </div>
      <VariantsEditor v-model="form.variants" />
      <TiersEditor v-model="form.priceTiers" />
      <div class="form-row">
        <label class="field">
          <span class="field__label">Cantidad mínima</span>
          <input v-model.number="form.minQty" type="number" min="1" step="1" />
        </label>
        <label class="field">
          <span class="field__label">Tiempo visible (opcional)</span>
          <input v-model="form.durationLabel" type="text" maxlength="80" placeholder="aprox. 1 hora" />
        </label>
      </div>
      <label class="field">
        <span class="field__label">Nota de entrega (opcional)</span>
        <input v-model="form.deliveryNote" type="text" maxlength="120" placeholder="Tiempo de entrega: 24 – 48 horas" />
      </label>
      <label class="field">
        <span class="field__label">Nota de precio (opcional)</span>
        <input v-model="form.priceNote" type="text" maxlength="200" />
      </label>
      <label class="field"><span class="field__label">Descripción</span><textarea v-model="form.description" maxlength="1000"></textarea></label>
      <label class="field">
        <span class="field__label">Qué incluye (una línea por punto)</span>
        <textarea v-model="featuresText" rows="5"></textarea>
      </label>
      <label class="field">
        <span class="field__label">Imagen (URL o ruta /fotos/…)</span>
        <input v-model="form.imageUrl" type="text" maxlength="500" />
      </label>
      <label class="check"><input v-model="form.active" type="checkbox" /> Activo (visible en la web)</label>
    </form>
    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancelar</button>
      <button type="submit" form="service-form" class="btn btn--primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
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
