<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { expenseCategory, paidFrom, paymentMethod } from '@/config/labels'
import { money, shortDate } from '@/utils/format'
import type { Expense } from '@/types/api'

defineProps<{ e: Expense; branchName: string; employeeName?: string }>()
const emit = defineEmits<{ edit: []; remove: [] }>()
</script>

<template>
  <li class="exp">
    <div class="exp__main">
      <strong>{{ e.description }}</strong>
      <span class="exp__meta">
        {{ shortDate(e.date) }} · {{ expenseCategory[e.category] || e.category }} · {{ paymentMethod[e.paymentMethod] }}
        <template v-if="e.supplier"> · {{ e.supplier }}</template> · {{ branchName }}
      </span>
      <span class="exp__tags">
        <StatusBadge :tone="e.paidFrom === 'petty_cash' ? 'aqua' : 'navy'" :label="paidFrom[e.paidFrom]" />
        <StatusBadge v-if="e.kind === 'fixed'" tone="info" label="Fijo" />
        <StatusBadge v-if="e.recurring" tone="info" label="Se repite" />
        <StatusBadge v-if="e.installment" tone="warning" :label="`Diferido ${e.installment.number}/${e.installment.count}`" />
        <StatusBadge v-if="employeeName" tone="" :label="`Anticipo · ${employeeName}`" />
        <a v-if="e.receiptUrl" :href="e.receiptUrl" target="_blank" rel="noopener" class="exp__receipt"><AppIcon name="file" :size="14" /> Recibo</a>
      </span>
    </div>
    <div class="exp__end">
      <strong class="money">{{ money(e.amount) }}</strong>
      <span class="exp__actions">
        <button type="button" class="btn btn--ghost btn--icon" aria-label="Editar gasto" @click="emit('edit')"><AppIcon name="edit" :size="18" /></button>
        <button type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar gasto" @click="emit('remove')"><AppIcon name="trash" :size="18" /></button>
      </span>
    </div>
  </li>
</template>

<style scoped lang="scss">
.exp {
  @include card(0.8rem 0.9rem);
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;

  &__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    strong {
      font-size: $text-sm;
    }
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }

  &__receipt {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: $text-xs;
    font-weight: 700;
    color: $navy;
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.4rem;
  }

  &__actions {
    display: flex;
    gap: 0.25rem;
  }
}
</style>
