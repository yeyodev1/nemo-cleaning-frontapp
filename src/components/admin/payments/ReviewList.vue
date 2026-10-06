<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ProofLink from './ProofLink.vue'
import { usePaymentReview } from '@/composables/admin/usePaymentReview'
import { useAdminScope } from '@/stores/adminScope'
import { dateTime, money } from '@/utils/format'
import { paymentMethod } from '@/config/labels'

const emit = defineEmits<{ count: [n: number] }>()
const scope = useAdminScope()
const { items, loading, busy, load, review } = usePaymentReview(() => scope.query)
const notes = reactive<Record<string, string>>({})

onMounted(load)
watch(() => scope.branch, load)
watch(() => items.value.length, (n) => emit('count', n), { immediate: true })
</script>

<template>
  <div>
    <div v-if="loading && !items.length" class="list">
      <span v-for="i in 3" :key="i" class="skeleton" style="height: 140px"></span>
    </div>
    <p v-else-if="!items.length" class="empty">
      <AppIcon name="check-circle" :size="32" style="margin: 0 auto 0.5rem; color: #14915f" />
      No hay transferencias por revisar.
    </p>
    <ul v-else class="list">
      <li v-for="p in items" :key="p._id" class="rev">
        <ProofLink v-if="p.proofUrl" :url="p.proofUrl" :title="`Comprobante ${p.bookingCode}`" />
        <span v-else class="rev__noproof"><AppIcon name="image" /> Sin archivo</span>
        <div class="rev__body">
          <div class="rev__top">
            <strong class="rev__amount money">{{ money(p.amount) }}</strong>
            <RouterLink :to="`/admin/pedidos/${p.booking}`" class="rev__code">{{ p.bookingCode }}</RouterLink>
          </div>
          <p class="rev__meta">
            {{ paymentMethod[p.method] }} · {{ dateTime(p.createdAt) }}<template v-if="scope.branchName(p.branch)"> · {{ scope.branchName(p.branch) }}</template>
          </p>
          <p v-if="p.reference" class="rev__meta">Ref. {{ p.reference }}</p>
          <label class="sr-only" :for="`note-${p._id}`">Nota</label>
          <input :id="`note-${p._id}`" v-model="notes[p._id]" type="text" placeholder="Nota (opcional, p. ej. motivo de rechazo)" />
          <div class="rev__actions">
            <button type="button" class="btn btn--danger btn--sm" :disabled="busy === p._id" @click="review(p, false, notes[p._id])">
              <AppIcon name="x" /> Rechazar
            </button>
            <button type="button" class="btn btn--primary btn--sm" :disabled="busy === p._id" @click="review(p, true, notes[p._id])">
              <AppIcon name="check" /> Aprobar
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.list {
  list-style: none;
  @include flex-cards(320px, 0.75rem);
}

.rev {
  @include card(0.9rem);
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;

  &__noproof {
    width: 88px;
    height: 88px;
    flex-shrink: 0;
    border-radius: $radius-sm;
    background: $warning-bg;
    color: $warning;
    font-size: $text-xs;
    font-weight: 700;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    text-align: center;
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__amount {
    font-size: $text-lg;
  }

  &__code {
    font-weight: 700;
    color: $navy;
    font-size: $text-sm;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.2rem;

    .btn {
      min-height: $tap;
      flex: 1;
    }
  }
}
</style>
