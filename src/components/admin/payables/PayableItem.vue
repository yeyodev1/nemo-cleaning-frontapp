<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { payStatus, payableCategory, payableMethod } from '@/config/financeLabels'
import { money, shortDate } from '@/utils/format'
import type { Payable } from '@/types/finance'

defineProps<{ p: Payable; branchName: string; busy?: boolean }>()
const emit = defineEmits<{ edit: []; remove: []; pay: [] }>()
</script>

<template>
  <li class="pay" :class="`pay--${p.status}`">
    <div class="pay__main">
      <strong>{{ p.beneficiary }}</strong>
      <span class="pay__meta">
        {{ payableCategory[p.category] }} · {{ branchName }}
        <template v-if="p.dueDate"> · vence {{ shortDate(p.dueDate) }}</template>
      </span>
      <span v-if="p.paidAmount" class="pay__meta">
        Pagado {{ money(p.paidAmount) }}<template v-if="p.paidDate"> el {{ shortDate(p.paidDate) }}</template>
        <template v-if="p.method"> · {{ payableMethod[p.method] }}</template>
        <template v-if="p.reference"> · Ref. {{ p.reference }}</template>
      </span>
      <span v-if="p.notes" class="pay__meta">{{ p.notes }}</span>
    </div>
    <div class="pay__end">
      <strong class="money">{{ money(p.amount) }}</strong>
      <StatusBadge :tone="payStatus[p.status].tone" :label="payStatus[p.status].label" />
    </div>
    <div class="pay__actions">
      <button v-if="p.status !== 'paid'" type="button" class="btn btn--soft btn--sm" :disabled="busy" @click="emit('pay')">
        <AppIcon name="check" :size="16" /> Marcar pagado
      </button>
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Editar pago" @click="emit('edit')"><AppIcon name="edit" :size="18" /></button>
      <button type="button" class="btn btn--ghost btn--icon" aria-label="Eliminar pago" @click="emit('remove')"><AppIcon name="trash" :size="18" /></button>
    </div>
  </li>
</template>

<style scoped lang="scss">
.pay {
  @include card(0.8rem 0.9rem);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 0.75rem;
  border-left: 4px solid $warning;

  &--partial {
    border-left-color: $orange;
  }

  &--paid {
    border-left-color: $success;
  }

  &__main {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  // Celular: acciones en su propia fila para no apretar el concepto. Escritorio: al final, en línea.
  &__actions {
    flex: 1 1 100%;
    display: flex;
    justify-content: flex-end;
    gap: 0.25rem;
    align-items: center;
    border-top: 1px solid $line;
    padding-top: 0.4rem;

    @include from('md') {
      flex: 0 0 auto;
      border-top: 0;
      padding-top: 0;
    }
  }
}
</style>
