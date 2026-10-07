<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { useWaOptions, type WaPayState } from '@/composables/whatsapp/useWaOptions'
import { errorMessage, money } from '@/utils/format'

/**
 * Forma de pago con cuenta (Efectivo, Transferencia Pichincha…, Tarjeta, Plan mensual, Canje,
 * Cortesía) o "Por coordinar", y si ya pagó: monto, referencia y comprobante opcional.
 */
const props = defineProps<{ balance: number }>()
const pay = defineModel<WaPayState>('state', { required: true })
const toast = useToastStore()
const { accounts, chargeable } = useWaOptions()
const uploading = ref(false)

const choices = computed(() => [
  { value: '', label: 'Por coordinar' },
  ...accounts.value.map((a) => ({ value: a.label, label: a.label })),
])
const account = computed({
  get: () => pay.value.account,
  set: (v: string | string[]) => {
    pay.value.account = String(v)
    if (!chargeable(pay.value.account)) pay.value.paid = false
  },
})
const canCharge = computed(() => chargeable(pay.value.account))

async function upload(file: File) {
  uploading.value = true
  try {
    pay.value.proofUrl = (await managementService.uploadFile(file)).url
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="wpf">
    <ChoiceChips v-model="account" :options="choices" label="Forma de pago" small />
    <p v-if="!pay.account" class="wpf__hint">
      <AppIcon name="info" :size="14" /> Queda por cobrar hasta que registres el pago o el cliente pague con el link.
    </p>
    <Transition name="fade-up">
      <div v-if="canCharge" class="wpf__paid">
        <label class="wpf__switch">
          <input v-model="pay.paid" type="checkbox" />
          <span class="wpf__track" aria-hidden="true"></span>
          <span>Ya pagó<template v-if="props.balance"> ({{ money(props.balance) }})</template></span>
        </label>
        <Transition name="fade-up">
          <div v-if="pay.paid" class="wpf__fields">
            <MoneyField v-model="pay.amount" label="Monto cobrado" hint="Vacío = todo el saldo." />
            <label class="field">
              <span class="field__label">Referencia (opcional)</span>
              <input v-model="pay.reference" type="text" placeholder="N.º de comprobante" />
            </label>
            <FileDrop label="Comprobante (opcional)" :url="pay.proofUrl" :busy="uploading" @pick="upload" @error="toast.error" />
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.wpf {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;

  &__hint {
    display: flex;
    gap: 0.35rem;
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__paid {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 0.75rem;
    border-radius: $radius-md;
    background: $sky;
  }

  &__switch {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    min-height: $tap;
    font-weight: 700;
    cursor: pointer;

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
  }

  &__track {
    position: relative;
    width: 44px;
    height: 26px;
    border-radius: $radius-pill;
    background: $line-strong;
    transition: background $dur-fast ease;

    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: $shadow-sm;
      transition: transform $dur-fast $ease-out;
    }
  }

  input:checked + &__track {
    background: $whatsapp;

    &::after {
      transform: translateX(18px);
    }
  }

  input:focus-visible + &__track {
    outline: 2px solid $navy;
    outline-offset: 2px;
  }

  &__fields {
    display: grid;
    gap: 0.6rem;
  }
}
</style>
