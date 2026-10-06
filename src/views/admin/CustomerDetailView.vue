<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import BookingBadges from '@/components/admin/common/BookingBadges.vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import CustomerForm from '@/components/admin/customers/CustomerForm.vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { dateTime, errorMessage, intlPhone, money, shortDate, whatsappUrl } from '@/utils/format'
import type { Customer, CustomerDetail } from '@/types/api'

const route = useRoute()
const toast = useToastStore()
const data = ref<CustomerDetail | null>(null)
const loading = ref(true)
const editing = ref(false)

async function load() {
  loading.value = true
  try {
    data.value = await managementService.customer(String(route.params.id))
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    loading.value = false
  }
}
onMounted(load)

function onSaved(c: Customer) {
  if (data.value) data.value = { ...data.value, ...c }
  editing.value = false
}
</script>

<template>
  <section>
    <RouterLink to="/admin/clientes" class="back"><AppIcon name="arrow-left" :size="18" /> Clientes</RouterLink>
    <div v-if="loading && !data" class="skeleton" style="height: 260px"></div>
    <p v-else-if="!data" class="empty">No se encontró el cliente.</p>
    <template v-else>
      <header class="head card">
        <div class="head__main">
          <h2>{{ data.name }}</h2>
          <p class="muted">Cliente desde {{ dateTime(data.createdAt) }}</p>
          <ul class="head__info">
            <li v-if="data.phone"><AppIcon name="phone" :size="16" /> {{ data.phone }}</li>
            <li v-if="data.email"><AppIcon name="mail" :size="16" /> {{ data.email }}</li>
            <li v-if="data.documentId"><AppIcon name="user" :size="16" /> {{ data.documentId }}</li>
            <li v-if="data.address"><AppIcon name="pin" :size="16" /> {{ data.address }}</li>
          </ul>
          <p v-if="data.notes" class="head__notes">{{ data.notes }}</p>
        </div>
        <div class="head__actions">
          <a v-if="data.phone" :href="`tel:+${intlPhone(data.phone)}`" class="btn btn--ghost"><AppIcon name="phone" /> Llamar</a>
          <a v-if="data.phone" :href="whatsappUrl(data.phone)" target="_blank" rel="noopener" class="btn btn--whatsapp"><AppIcon name="whatsapp" /> WhatsApp</a>
          <button type="button" class="btn btn--soft" @click="editing = true"><AppIcon name="edit" /> Editar</button>
        </div>
      </header>

      <div class="kpis">
        <KpiCard label="Pedidos" :value="data.totalOrders" icon="list" />
        <KpiCard label="Total gastado" :value="money(data.totalSpent)" icon="wallet" tone="aqua" />
      </div>

      <h3 class="title">Historial de pedidos</h3>
      <p v-if="!data.bookings?.length" class="empty">Sin pedidos todavía.</p>
      <ul v-else class="rows">
        <li v-for="b in data.bookings" :key="b._id">
          <RouterLink :to="`/admin/pedidos/${b._id}`" class="bk">
            <span class="bk__main">
              <strong>{{ b.code }}</strong>
              <span class="muted">{{ shortDate(b.date) }} · {{ b.time }} · {{ b.items.map((i) => i.name).join(', ') }}</span>
              <BookingBadges :status="b.status" :payment="b.paymentStatus" />
            </span>
            <strong class="money">{{ money(b.total) }}</strong>
          </RouterLink>
        </li>
      </ul>
      <CustomerForm :open="editing" :customer="data" @close="editing = false" @saved="onSaved" />
    </template>
  </section>
</template>

<style scoped lang="scss">
.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: $tap;
  font-weight: 700;
  color: $navy;
  font-size: $text-sm;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @include from('md') {
    flex-direction: row;
    justify-content: space-between;
  }

  h2 {
    font-size: $text-xl;
  }

  &__info {
    list-style: none;
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: $text-sm;

    li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: $ink-soft;
    }
  }

  &__notes {
    margin-top: 0.75rem;
    font-size: $text-sm;
    background: $sky;
    padding: 0.6rem 0.75rem;
    border-radius: $radius-sm;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: flex-start;

    .btn {
      flex: 1 1 auto;
    }
  }
}

.kpis {
  @include flex-cards(150px, 0.75rem);
  margin: 0.85rem 0 1.25rem;
}

.title {
  font-size: $text-lg;
  margin-bottom: 0.6rem;
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bk {
  @include card(0.75rem 0.9rem);
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;

  &:hover {
    border-color: $navy;
  }

  &__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: $text-sm;

    .muted {
      font-size: $text-xs;
    }
  }
}
</style>
