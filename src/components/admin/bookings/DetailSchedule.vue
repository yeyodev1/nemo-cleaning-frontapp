<script setup lang="ts">
import { ref, watch } from 'vue'
import SlotPicker from './SlotPicker.vue'
import OperatorChips from './OperatorChips.vue'
import type { BookingDetail } from '@/types/api'

const props = defineProps<{ booking: BookingDetail; saving: boolean; locked: boolean }>()
const emit = defineEmits<{ reschedule: [date: string, time: string]; operators: [ids: string[]] }>()

const date = ref('')
const time = ref('')
const ops = ref<string[]>([])
const branchId = () => (typeof props.booking.branch === 'string' ? props.booking.branch : props.booking.branch?._id)

watch(
  () => props.booking,
  (b) => {
    date.value = b.date
    time.value = b.time
    ops.value = b.operators.map((o) => o._id)
  },
  { immediate: true },
)

const sameOps = () => {
  const cur = props.booking.operators.map((o) => o._id).sort().join()
  return cur === [...ops.value].sort().join()
}
</script>

<template>
  <section class="card sched">
    <h3>Reprogramar</h3>
    <SlotPicker v-model:date="date" v-model:time="time" :branch="branchId() || ''" :keep-time="booking.date === date ? booking.time : undefined" />
    <button
      type="button"
      class="btn btn--primary sched__btn"
      :disabled="locked || saving || (date === booking.date && time === booking.time)"
      @click="emit('reschedule', date, time)"
    >
      Guardar nueva fecha
    </button>

    <h3 class="sched__ops">Operadores asignados</h3>
    <OperatorChips v-model="ops" :branch="branchId()" />
    <button type="button" class="btn btn--primary sched__btn" :disabled="locked || saving || sameOps()" @click="emit('operators', ops)">
      Guardar asignación
    </button>
  </section>
</template>

<style scoped lang="scss">
.sched {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  h3 {
    font-size: $text-base;
  }

  &__ops {
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid $line;
  }

  &__btn {
    align-self: flex-start;
  }
}
</style>
