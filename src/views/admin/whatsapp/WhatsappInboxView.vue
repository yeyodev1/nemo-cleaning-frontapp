<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import WaOrderCard from '@/components/admin/whatsapp/WaOrderCard.vue'
import WaOrderSheet from '@/components/admin/whatsapp/WaOrderSheet.vue'
import { useWaInbox } from '@/composables/whatsapp/useWaInbox'
import type { WaTab } from '@/types/whatsapp'

const inbox = useWaInbox()
const { tab, items, counts, loading, selected, highlight, code, searching, now } = inbox

const tabs = computed(() => [
  { value: 'pending', label: 'Sin confirmar', count: counts.value.pending },
  { value: 'unpaid', label: 'Por cobrar', count: counts.value.unpaid },
  { value: 'recent', label: 'Últimos 30 días' },
])
const tabModel = computed({ get: () => tab.value, set: (v: string) => (tab.value = v as WaTab) })
const empty = computed(() =>
  tab.value === 'pending'
    ? { title: 'Todo al día', text: 'No hay pedidos por WhatsApp esperando confirmación. Los nuevos aparecen aquí solos.' }
    : tab.value === 'unpaid'
      ? { title: 'Nada por cobrar', text: 'Los pedidos por WhatsApp confirmados sin pago aparecen aquí.' }
      : { title: 'Sin pedidos por WhatsApp', text: 'Aún no hay pedidos por WhatsApp en los últimos 30 días.' },
)
</script>

<template>
  <div class="wai">
    <PageIntro>
      <RouterLink to="/admin/whatsapp/nuevo" class="btn btn--whatsapp btn--lg wai__new">
        <AppIcon name="plus" /> Pedido rápido por WhatsApp
      </RouterLink>
    </PageIntro>

    <form class="wai__search" role="search" @submit.prevent="inbox.search()">
      <label class="sr-only" for="wa-code">Código del pedido</label>
      <span class="wai__input">
        <AppIcon name="search" :size="18" />
        <input id="wa-code" v-model="code" type="search" inputmode="text" autocomplete="off" placeholder="Pega el código: NEMO-000123 o 123" />
      </span>
      <button type="submit" class="btn btn--primary" :disabled="searching || !code.trim()">{{ searching ? 'Buscando…' : 'Abrir' }}</button>
    </form>

    <SegTabs v-model="tabModel" :tabs="tabs" />

    <div v-if="loading" class="wai__list">
      <div v-for="n in 3" :key="n" class="skeleton wai__sk"></div>
    </div>
    <EmptyState v-else-if="!items.length" :title="empty.title" :text="empty.text" icon="whatsapp">
      <RouterLink to="/admin/whatsapp/nuevo" class="btn btn--ghost"><AppIcon name="plus" /> Cargar un pedido que llegó por WhatsApp</RouterLink>
    </EmptyState>
    <TransitionGroup v-else name="fade-up" tag="div" class="wai__list">
      <WaOrderCard v-for="o in items" :key="o._id" :order="o" :now="now" :highlight="highlight === o._id" @open="selected = $event" />
    </TransitionGroup>

    <WaOrderSheet :order="selected" @close="selected = null" @saved="inbox.onSaved" />
  </div>
</template>

<style scoped lang="scss">
.wai {
  max-width: 980px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__new {
    width: 100%;

    @include from('md') {
      width: auto;
    }
  }

  &__search {
    display: flex;
    gap: 0.5rem;
  }

  &__input {
    position: relative;
    flex: 1;
    min-width: 0;

    svg {
      position: absolute;
      left: 0.8rem;
      top: 50%;
      transform: translateY(-50%);
      color: $ink-muted;
      pointer-events: none;
    }

    input {
      width: 100%;
      padding-left: 2.4rem;
    }
  }

  &__list {
    display: grid;
    gap: 0.75rem;

    @include from('md') {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
    }
  }

  &__sk {
    height: 190px;
    border-radius: $radius-md;
  }
}
</style>
