<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import ReviewList from '@/components/admin/payments/ReviewList.vue'
import AllPayments from '@/components/admin/payments/AllPayments.vue'
import Receivables from '@/components/admin/payments/Receivables.vue'

const route = useRoute()
const router = useRouter()
const reviewCount = ref(0)

const tab = computed({
  get: () => (['todos', 'cxc'].includes(String(route.query.tab)) ? String(route.query.tab) : 'revisar'),
  set: (v: string) => router.replace({ query: { ...route.query, tab: v === 'revisar' ? undefined : v } }),
})
const tabs = computed(() => [
  { value: 'revisar', label: 'Por revisar', count: reviewCount.value },
  { value: 'todos', label: 'Todos' },
  { value: 'cxc', label: 'Cuentas por cobrar' },
])
</script>

<template>
  <section>
    <SegTabs v-model="tab" :tabs="tabs" />
    <ReviewList v-if="tab === 'revisar'" @count="reviewCount = $event" />
    <AllPayments v-else-if="tab === 'todos'" />
    <Receivables v-else />
  </section>
</template>
