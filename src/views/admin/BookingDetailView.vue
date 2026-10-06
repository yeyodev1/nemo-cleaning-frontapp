<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import DetailHeader from '@/components/admin/bookings/DetailHeader.vue'
import DetailItems from '@/components/admin/bookings/DetailItems.vue'
import DetailSchedule from '@/components/admin/bookings/DetailSchedule.vue'
import DetailStatus from '@/components/admin/bookings/DetailStatus.vue'
import DetailPayments from '@/components/admin/bookings/DetailPayments.vue'
import DetailHistory from '@/components/admin/bookings/DetailHistory.vue'
import PaymentFormSheet from '@/components/admin/bookings/PaymentFormSheet.vue'
import { useBookingDetail } from '@/composables/admin/useBookingDetail'
import type { ManualPaymentInput } from '@/services/bookings.service'

const route = useRoute()
const { booking, loading, error, saving, load, update, setStatus, addPayment, reviewPayment } = useBookingDetail(String(route.params.id))
const payOpen = ref(false)
// Pedidos cerrados no se editan (sí se puede cambiar estado y registrar pagos).
const locked = computed(() => ['completed', 'cancelled', 'no_show'].includes(booking.value?.status || ''))

async function onPay(body: ManualPaymentInput) {
  if (await addPayment(body)) payOpen.value = false
}
</script>

<template>
  <div class="detail">
    <RouterLink to="/admin/pedidos" class="detail__back"><AppIcon name="arrow-left" :size="16" /> Pedidos</RouterLink>

    <div v-if="loading && !booking" class="detail__col">
      <span class="skeleton" style="height: 220px"></span>
      <span class="skeleton" style="height: 160px"></span>
    </div>

    <div v-else-if="error" class="card detail__error" role="alert">
      <AppIcon name="alert" /> <span>{{ error }}</span>
      <button type="button" class="btn btn--ghost btn--sm" @click="load">Reintentar</button>
    </div>

    <template v-else-if="booking">
      <DetailHeader :booking="booking" />
      <div class="detail__grid">
        <div class="detail__col">
          <DetailItems :booking="booking" :saving="saving" :locked="locked" @save="update($event, 'Servicios actualizados')" />
          <DetailPayments :booking="booking" :saving="saving" @add="payOpen = true" @review="reviewPayment" />
          <DetailHistory :history="booking.history" />
        </div>
        <div class="detail__col">
          <DetailStatus :status="booking.status" :saving="saving" @change="(s, n) => setStatus(s, n || undefined)" />
          <DetailSchedule
            :booking="booking"
            :saving="saving"
            :locked="locked"
            @reschedule="(date, time) => update({ date, time }, 'Pedido reprogramado')"
            @operators="(ids) => update({ operators: ids }, 'Operadores asignados')"
          />
        </div>
      </div>
      <PaymentFormSheet :open="payOpen" :balance="booking.balance" :saving="saving" @close="payOpen = false" @submit="onPay" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    align-self: flex-start;
    min-height: 36px;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: $danger;
    flex-wrap: wrap;

    span {
      flex: 1;
    }
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
