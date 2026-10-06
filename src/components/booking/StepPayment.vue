<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import BankAccounts from './BankAccounts.vue'
import BookingReview from './BookingReview.vue'
import type { IconName } from '@/components/ui/icons'
import { useCatalogStore } from '@/stores/catalog'
import { publicService } from '@/services/public.service'
import { draft } from '@/composables/booking/useBookingDraft'
import { useQuote } from '@/composables/booking/useQuote'
import { errorMessage, money } from '@/utils/format'
import type { PaymentMethod } from '@/types/api'

const catalog = useCatalogStore()
const { total } = useQuote()
const uploading = ref(false)
const uploadError = ref('')

const methods = computed(() => {
  const list: { id: PaymentMethod; icon: IconName; title: string; text: string }[] = []
  if (catalog.settings?.payphoneEnabled)
    list.push({
      id: 'card',
      icon: 'card',
      title: 'Tarjeta',
      text: 'Visa o Mastercard, pago seguro con Payphone. Se confirma al instante.',
    })
  list.push({
    id: 'transfer',
    icon: 'bank',
    title: 'Transferencia',
    text: 'Transfiere y sube el comprobante. Lo revisamos y te confirmamos.',
  })
  list.push({
    id: 'cash',
    icon: 'cash',
    title: 'Efectivo',
    text: 'Pagas al equipo el día del servicio.',
  })
  return list
})

async function onFile(file: File) {
  uploading.value = true
  uploadError.value = ''
  try {
    const { url } = await publicService.uploadProof(file)
    draft.transferProofUrl = url
  } catch (e) {
    uploadError.value = errorMessage(e, 'No pudimos subir el comprobante. Inténtalo de nuevo.')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="pay">
    <BookingReview />

    <div class="pay__methods" role="radiogroup" aria-label="Forma de pago">
      <button
        v-for="m in methods"
        :key="m.id"
        type="button"
        role="radio"
        class="method"
        :class="{ 'is-on': draft.paymentMethod === m.id }"
        :aria-checked="draft.paymentMethod === m.id"
        @click="draft.paymentMethod = m.id"
      >
        <span class="method__icon"><AppIcon :name="m.icon" :size="22" /></span>
        <span class="method__info">
          <strong>{{ m.title }}</strong>
          <small>{{ m.text }}</small>
        </span>
        <span class="method__radio" aria-hidden="true"></span>
      </button>
    </div>

    <Transition name="fade">
      <section
        v-if="draft.paymentMethod === 'transfer'"
        class="pay__transfer"
        aria-labelledby="tr-title"
      >
        <h3 id="tr-title">1. Transfiere</h3>
        <BankAccounts :accounts="catalog.settings?.bankAccounts || []" :amount="money(total)" />
        <h3>2. Sube tu comprobante *</h3>
        <FileDrop
          :url="draft.transferProofUrl"
          :busy="uploading"
          @pick="onFile"
          @error="uploadError = $event"
        />
        <p v-if="uploadError" class="field__error" role="alert">{{ uploadError }}</p>
        <p v-else-if="!draft.transferProofUrl" class="field__hint">
          El botón Confirmar se activa cuando subas el comprobante.
        </p>
      </section>
    </Transition>

    <p v-if="draft.paymentMethod === 'card'" class="pay__note">
      <AppIcon name="lock" :size="16" /> Al confirmar se abre el formulario seguro de Payphone.
    </p>
    <p v-if="draft.paymentMethod === 'cash'" class="pay__note">
      <AppIcon name="info" :size="16" /> Ten el monto listo; el equipo no siempre lleva cambio.
    </p>
  </div>
</template>

<style scoped lang="scss">
.pay {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__methods {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__transfer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: $radius-md;
    background: $sky;

    h3 {
      font-size: $text-sm;
      color: $navy;
    }
  }

  &__note {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: $text-sm;
    color: $ink-soft;
  }
}

.method {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.95rem;
  text-align: left;
  border-radius: $radius-md;
  border: 2px solid $line;
  background: $surface;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &.is-on {
    border-color: $navy;
    box-shadow: $shadow-sm;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $navy-soft;
    color: $navy;
  }

  &.is-on &__icon {
    background: $navy;
    color: #fff;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;

    small {
      font-size: $text-xs;
      color: $ink-muted;
      line-height: 1.4;
    }
  }

  &__radio {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid $line-strong;
    flex-shrink: 0;
  }

  &.is-on &__radio {
    border: 7px solid $navy;
  }
}
</style>
