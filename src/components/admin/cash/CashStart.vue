<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { ledgerService } from '@/services/ledger.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { errorMessage, money, shortDate } from '@/utils/format'
import type { CashStart } from '@/types/finance'

/**
 * Inicio del registro de caja por sucursal: la caja solo cuenta desde esa fecha y arranca con
 * el saldo inicial. El historial del Excel trae los cobros en efectivo pero no las entregas a
 * gerencia; sin este corte el saldo saldría inflado. Solo gerencia lo cambia.
 */
defineProps<{ starts: CashStart[] }>()
const emit = defineEmits<{ saved: [] }>()
const user = useUserStore()
const toast = useToastStore()
const editing = ref<CashStart | null>(null)
const form = reactive({ startDate: '', openingBalance: 0 })
const saving = ref(false)

function open(s: CashStart) {
  editing.value = s
  form.startDate = s.startDate
  form.openingBalance = s.openingBalance
}

async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await ledgerService.updateCashStart({ branch: editing.value.branch, ...form })
    toast.success('Inicio de la caja actualizado')
    editing.value = null
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="start">
    <div v-for="s in starts" :key="s.branch" class="start__row">
      <AppIcon name="flag" :size="18" />
      <span class="start__text">
        <strong>{{ s.name }}</strong> · caja desde el {{ shortDate(s.startDate) }} {{ s.startDate.slice(0, 4) }} · saldo inicial
        <strong class="money">{{ money(s.openingBalance) }}</strong>
      </span>
      <button v-if="user.hasRole(['admin'])" type="button" class="btn btn--soft btn--sm" @click="open(s)">Cambiar</button>
    </div>

    <BaseSheet :open="!!editing" :title="`Inicio de la caja · ${editing?.name ?? ''}`" @close="editing = null">
      <form id="cash-start" class="form" @submit.prevent="save">
        <p class="tip">
          Desde esta fecha se suman los cobros en efectivo, los gastos de caja menor y los movimientos. Pon como saldo
          inicial el efectivo que había en caja ese día.
        </p>
        <label class="field"><span class="field__label">Inicio del registro de caja</span><input v-model="form.startDate" type="date" required /></label>
        <MoneyField v-model="form.openingBalance" label="Saldo inicial" />
      </form>
      <template #footer>
        <button type="button" class="btn btn--ghost" @click="editing = null">Cancelar</button>
        <button type="submit" form="cash-start" class="btn btn--primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      </template>
    </BaseSheet>
  </div>
</template>

<style scoped lang="scss">
.start {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;

  &__row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.45rem 0.5rem 0.45rem 0.8rem;
    line-height: 1.35;
    border-radius: $radius-md;
    background: $navy-soft;
    color: $navy;
    font-size: $text-sm;

    svg {
      flex-shrink: 0;
    }
  }

  &__text {
    flex: 1;
    min-width: 0;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.tip {
  font-size: $text-sm;
  color: $ink-muted;
}
</style>
