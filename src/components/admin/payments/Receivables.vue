<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import { bookingsService } from '@/services/bookings.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useShowMore } from '@/composables/admin/useShowMore'
import { errorMessage, intlPhone, money, shortDate, whatsappUrl } from '@/utils/format'
import type { Booking } from '@/types/api'

const scope = useAdminScope()
const toast = useToastStore()
const items = ref<Booking[]>([])
const loading = ref(false)
const { visible, remaining, more, step } = useShowMore(items)
const total = computed(() => items.value.reduce((s, b) => s + (b.balance || 0), 0))

async function load() {
  loading.value = true
  try {
    items.value = await bookingsService.receivables(scope.query)
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => scope.branch, load)
const waText = (b: Booking) => `Hola ${b.customer?.name || ''}, te escribimos de Nemo Cleaning por el saldo pendiente de tu pedido ${b.code}: ${money(b.balance)}.`
</script>

<template>
  <div>
    <div class="sum">
      <span>Total por cobrar</span>
      <strong class="money">{{ money(total) }}</strong>
      <small>{{ items.length }} pedido(s)</small>
    </div>
    <div v-if="loading && !items.length" class="rows">
      <span v-for="i in 4" :key="i" class="skeleton" style="height: 88px"></span>
    </div>
    <p v-else-if="!items.length" class="empty">No hay cuentas por cobrar. Todo al día.</p>
    <ul v-else class="rows">
      <li v-for="b in visible" :key="b._id" class="rc">
        <div class="rc__main">
          <RouterLink :to="`/admin/pedidos/${b._id}`" class="rc__code">{{ b.code }}</RouterLink>
          <span class="rc__name">{{ b.customer?.name }}</span>
          <span class="rc__meta">{{ shortDate(b.date) }} · {{ b.time }} · Total {{ money(b.total) }}</span>
          <BookingBadges :status="b.status" :payment="b.paymentStatus" />
        </div>
        <div class="rc__end">
          <strong class="money rc__bal">{{ money(b.balance) }}</strong>
          <div class="rc__links">
            <a v-if="b.customer?.phone" :href="`tel:+${intlPhone(b.customer.phone)}`" class="btn btn--ghost btn--icon" aria-label="Llamar">
              <AppIcon name="phone" />
            </a>
            <a v-if="b.customer?.phone" :href="whatsappUrl(b.customer.phone, waText(b))" target="_blank" rel="noopener" class="btn btn--whatsapp btn--icon" aria-label="WhatsApp">
              <AppIcon name="whatsapp" />
            </a>
          </div>
        </div>
      </li>
    </ul>
    <button v-if="remaining" type="button" class="btn btn--ghost more" @click="more">Ver {{ Math.min(remaining, step) }} más · quedan {{ remaining }}</button>
  </div>
</template>

<style scoped lang="scss">
.more {
  display: flex;
  margin: 1rem auto 0;
}
.sum {
  @include card(1rem 1.1rem);
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.75rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, $navy-deep, $navy);
  color: $on-dark-soft;
  border: 0;

  strong {
    color: #fff;
    font-size: $text-xl;
  }

  small {
    width: 100%;
  }
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rc {
  @include card(0.85rem 0.9rem);
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;

  &__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__code {
    font-weight: 800;
    color: $navy;
  }

  &__name {
    font-weight: 600;
    font-size: $text-sm;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__bal {
    color: $danger;
    font-size: $text-lg;
  }

  &__links {
    display: flex;
    gap: 0.4rem;
  }
}
</style>
