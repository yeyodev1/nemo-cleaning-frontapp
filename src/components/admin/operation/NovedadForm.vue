<script setup lang="ts">
import { ref, watch } from 'vue'
import ChoiceChips from './ChoiceChips.vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'

/** Alta de novedad (hoja NOVEDADES): qué pasó y con qué operador. */
const props = defineProps<{ bookingId: string; operators: { _id: string; name: string; color?: string }[] }>()
const emit = defineEmits<{ saved: [] }>()
const toast = useToastStore()
const text = ref('')
const operator = ref('')
const busy = ref(false)

watch(
  () => props.bookingId,
  () => {
    text.value = ''
    operator.value = props.operators.length === 1 ? props.operators[0]!._id : ''
  },
  { immediate: true },
)

async function save() {
  if (!text.value.trim()) return toast.error('Escribe qué pasó')
  busy.value = true
  try {
    await operationService.addNovedad(props.bookingId, { text: text.value.trim(), operator: operator.value || undefined })
    toast.success('Novedad registrada')
    text.value = ''
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="nf">
    <label class="field">
      <span class="field__label">¿Qué pasó?</span>
      <textarea v-model="text" rows="2" placeholder="Ej.: se quejó porque quedaron detalles en los vidrios"></textarea>
    </label>
    <div v-if="operators.length > 1" class="field">
      <span class="field__label">¿Con qué operador?</span>
      <ChoiceChips v-model="operator" :options="operators.map((o) => ({ value: o._id, label: o.name, color: o.color }))" label="Operador de la novedad" small />
    </div>
    <button type="button" class="btn btn--primary btn--sm nf__btn" :disabled="busy || !text.trim()" @click="save">
      {{ busy ? 'Guardando…' : 'Registrar novedad' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.nf {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__btn {
    align-self: flex-start;
  }
}
</style>
