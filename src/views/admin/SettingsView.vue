<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import EmailChips from '@/components/admin/settings/EmailChips.vue'
import BankAccounts from '@/components/admin/settings/BankAccounts.vue'
import OfficePricingForm from '@/components/admin/settings/OfficePricingForm.vue'
import { useSettingsForm } from '@/composables/admin/useSettingsForm'

const { form, loading, saving, save } = useSettingsForm()
</script>

<template>
  <section>
    <div v-if="loading" class="stack"><span v-for="i in 3" :key="i" class="skeleton" style="height: 160px"></span></div>
    <form v-else class="stack" @submit.prevent="save">
      <article class="card sec">
        <h2><AppIcon name="store" :size="20" /> Negocio</h2>
        <div class="form-row">
          <label class="field"><span class="field__label">Nombre comercial</span><input v-model="form.businessName" type="text" required /></label>
          <label class="field">
            <span class="field__label">Anticipación mínima para reservar (horas)</span>
            <input v-model.number="form.bookingLeadHours" type="number" min="0" max="168" required />
          </label>
        </div>
      </article>

      <article class="card sec">
        <h2><AppIcon name="mail" :size="20" /> Correos de aviso</h2>
        <p class="sec__hint">Reciben una copia de cada pedido nuevo, reprogramación o cancelación.</p>
        <EmailChips v-model="form.notifyEmails" />
      </article>

      <article class="card sec">
        <h2><AppIcon name="bank" :size="20" /> Cuentas bancarias</h2>
        <p class="sec__hint">Se muestran al cliente que elige pagar por transferencia.</p>
        <BankAccounts v-model="form.bankAccounts" />
      </article>

      <article class="card sec">
        <h2><AppIcon name="building" :size="20" /> Cotizador de oficinas</h2>
        <p class="sec__hint">Valores con los que la web calcula el estimado automático.</p>
        <OfficePricingForm :pricing="form.officePricing" />
      </article>

      <div class="save">
        <button type="submit" class="btn btn--primary btn--lg" :disabled="saving">
          <AppIcon name="check" /> {{ saving ? 'Guardando…' : 'Guardar configuración' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped lang="scss">
.stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-width: 820px;
}

.sec {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: $text-lg;

    svg {
      color: $navy;
    }
  }

  &__hint {
    margin-top: -0.5rem;
    font-size: $text-sm;
    color: $ink-muted;
  }
}

.save {
  position: sticky;
  bottom: calc(70px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: flex-end;

  @include from('lg') {
    bottom: 1rem;
  }

  .btn {
    width: 100%;

    @include from('md') {
      width: auto;
    }
  }
}
</style>
