<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import { money, shortDate } from '@/utils/format'
import type { BankAccountRec, BankPayment } from '@/types/finance'

const props = defineProps<{ acc: BankAccountRec; busyId: string }>()
const emit = defineEmits<{ verify: [p: BankPayment]; bank: [amount: number | null] }>()
const open = ref(false)
const editing = ref(false)
const bankValue = ref(props.acc.bank ?? 0)
watch(
  () => props.acc.bank,
  (v) => (bankValue.value = v ?? 0),
)
const tone = computed(() => {
  if (props.acc.difference === null) return ''
  return props.acc.difference === 0 ? 'ok' : 'bad'
})
function saveBank() {
  emit('bank', bankValue.value)
  editing.value = false
}
</script>

<template>
  <article class="acc" :class="tone && `acc--${tone}`">
    <header class="acc__head">
      <h3>{{ acc.account }}</h3>
      <span class="acc__count">{{ acc.count }} {{ acc.count === 1 ? 'pago' : 'pagos' }}<template v-if="acc.unverifiedCount"> · {{ acc.unverifiedCount }} sin verificar</template></span>
    </header>
    <dl class="acc__nums">
      <div><dt>Registrado en el panel</dt><dd class="money">{{ money(acc.registered) }}</dd></div>
      <div><dt>Verificado</dt><dd class="money">{{ money(acc.verified) }}</dd></div>
      <div>
        <dt>Según el banco</dt>
        <dd>
          <button v-if="!editing" type="button" class="acc__bank" @click="editing = true">
            {{ acc.bank === null ? 'Escribir monto' : money(acc.bank) }} <AppIcon name="edit" :size="14" />
          </button>
        </dd>
      </div>
      <div>
        <dt>Diferencia</dt>
        <dd class="money" :class="{ neg: (acc.difference ?? 0) !== 0 }">{{ acc.difference === null ? '—' : money(acc.difference) }}</dd>
      </div>
    </dl>
    <form v-if="editing" class="acc__edit" @submit.prevent="saveBank">
      <MoneyField v-model="bankValue" label="Total recibido según el estado de cuenta" />
      <div class="acc__edit-actions">
        <button v-if="acc.bank !== null" type="button" class="btn btn--ghost btn--sm" @click="emit('bank', null); editing = false">Borrar</button>
        <button type="button" class="btn btn--ghost btn--sm" @click="editing = false">Cancelar</button>
        <button type="submit" class="btn btn--primary btn--sm">Guardar</button>
      </div>
    </form>
    <button v-if="acc.payments.length" type="button" class="acc__toggle" :aria-expanded="open" @click="open = !open">
      {{ open ? 'Ocultar pagos' : 'Ver pagos y marcar verificados' }} <AppIcon name="chevron-down" :size="16" :class="{ 'is-open': open }" />
    </button>
    <ul v-if="open" class="acc__list">
      <li v-for="p in acc.payments" :key="p._id">
        <label class="check">
          <input type="checkbox" :checked="p.verified" :disabled="busyId === p._id" @change="emit('verify', p)" />
          <span class="acc__p">
            <strong>{{ money(p.amount) }}</strong> · {{ p.customer || 'Cliente' }}
            <small>{{ shortDate(p.date) }} · {{ p.bookingCode }}<template v-if="p.reference"> · Ref. {{ p.reference }}</template><template v-if="p.verified && p.verifiedBy"> · verificó {{ p.verifiedBy }}</template></small>
          </span>
        </label>
        <a v-if="p.proofUrl" :href="p.proofUrl" target="_blank" rel="noopener" class="acc__proof"><AppIcon name="file" :size="14" /> Comprobante</a>
      </li>
    </ul>
  </article>
</template>

<style scoped lang="scss">
.acc {
  @include card(1rem);
  border-top: 4px solid $line-strong;

  &--ok {
    border-top-color: $success;
  }

  &--bad {
    border-top-color: $danger;
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.25rem 0.75rem;
    margin-bottom: 0.6rem;

    h3 {
      font-size: $text-base;
    }
  }

  &__count {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__nums {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;

    dt {
      font-size: $text-xs;
      color: $ink-muted;
      font-weight: 700;
    }

    dd {
      font-weight: 800;
    }
  }

  &__bank {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font: inherit;
    font-weight: 800;
    color: $navy;
    text-decoration: underline dotted;
    min-height: 32px;
  }

  &__edit {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.4rem;
  }

  &__toggle {
    margin-top: 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
    min-height: $tap;

    .is-open {
      transform: rotate(180deg);
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    li {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.25rem 0.75rem;
      border-top: 1px solid $line;
    }
  }

  &__p small {
    display: block;
    font-size: $text-xs;
    color: $ink-muted;
    font-weight: 500;
  }

  &__proof {
    font-size: $text-xs;
    font-weight: 700;
    color: $navy;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
  }
}

.neg {
  color: $danger;
}
</style>
