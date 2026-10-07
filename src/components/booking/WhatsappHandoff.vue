<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { orderWhatsapp } from '@/composables/booking/whatsappOrder'
import { copyText, isMobileDevice } from '@/utils/whatsapp'
import type { CreateBookingResult } from '@/types/api'

/**
 * Pedido que termina en WhatsApp: botón grande por si el navegador bloqueó la pestaña (o el
 * cliente volvió sin enviar) y copia del mensaje como respaldo.
 */
const props = defineProps<{ result: CreateBookingResult; opened: boolean }>()
const wa = computed(() => orderWhatsapp(props.result))
const copied = ref(false)
const mobile = isMobileDevice()

async function copy() {
  copied.value = await copyText(wa.value.text)
  if (copied.value) setTimeout(() => (copied.value = false), 2500)
}
</script>

<template>
  <div class="wah">
    <p class="wah__lead" :class="{ 'wah__lead--warn': !opened }" role="status">
      <AppIcon :name="opened ? 'whatsapp' : 'alert'" :size="18" />
      <span v-if="opened">Te abrimos WhatsApp con tu pedido. <strong>Envía el mensaje</strong> y un asesor te ayuda con el pago.</span>
      <span v-else>Tu navegador no dejó abrir WhatsApp. Toca el botón para enviar tu pedido.</span>
    </p>
    <a
      :href="wa.url"
      :target="mobile ? undefined : '_blank'"
      rel="noopener"
      class="btn btn--whatsapp btn--lg btn--block wah__btn"
    >
      <AppIcon name="whatsapp" /> Abrir WhatsApp
    </a>
    <button type="button" class="btn btn--ghost btn--sm wah__copy" @click="copy">
      <AppIcon :name="copied ? 'check' : 'copy'" :size="16" />
      {{ copied ? 'Mensaje copiado' : 'Copiar el mensaje' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.wah {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__lead {
    display: flex;
    gap: 0.5rem;
    text-align: left;
    font-size: $text-sm;
    padding: 0.85rem 1rem;
    border-radius: $radius-md;
    background: $whatsapp-soft;
    color: $whatsapp-ink;

    svg {
      flex-shrink: 0;
      margin-top: 2px;
    }

    &--warn {
      background: $warning-bg;
      color: $warning;
    }
  }

  &__btn {
    font-size: $text-lg;
    min-height: 58px;
    animation: wah-pop $dur-slow $ease-out both;
  }

  &__copy {
    align-self: center;
  }
}

@keyframes wah-pop {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}
</style>
