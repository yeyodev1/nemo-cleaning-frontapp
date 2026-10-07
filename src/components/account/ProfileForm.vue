<script setup lang="ts">
import { useProfileForm } from '@/composables/account/useProfileForm'
import { useCustomerStore } from '@/stores/customer'

const customer = useCustomerStore()
const { form, saving, error, save } = useProfileForm()
</script>

<template>
  <form class="card profile" novalidate @submit.prevent="save">
    <header class="profile__head">
      <h2>Mis datos</h2>
      <p class="muted">Los usamos para llenar tus reservas.</p>
    </header>
    <label class="field">
      <span class="field__label">Correo</span>
      <input :value="customer.customer?.email" type="email" readonly />
      <span class="field__hint">Es con lo que ingresas; no se puede cambiar aquí.</span>
    </label>
    <label class="field">
      <span class="field__label">Nombre completo *</span>
      <input v-model="form.name" type="text" autocomplete="name" required />
    </label>
    <div class="form-row">
      <label class="field">
        <span class="field__label">Celular (WhatsApp)</span>
        <input v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="0991234567" />
      </label>
      <label class="field">
        <span class="field__label">Cédula o RUC</span>
        <input v-model="form.documentId" type="text" inputmode="numeric" maxlength="13" />
      </label>
    </div>
    <label class="field">
      <span class="field__label">Dirección principal</span>
      <input
        v-model="form.address"
        type="text"
        autocomplete="street-address"
        placeholder="Urbanización, manzana, villa / calle y número"
      />
    </label>
    <p v-if="error" class="field__error" role="alert">{{ error }}</p>
    <button type="submit" class="btn btn--primary" :disabled="saving">
      {{ saving ? 'Guardando…' : 'Guardar mis datos' }}
    </button>
  </form>
</template>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__head h2 {
    font-size: $text-lg;
  }

  input[readonly] {
    background: $sky;
    color: $ink-soft;
  }

  .btn {
    align-self: stretch;

    @include from('md') {
      align-self: flex-start;
    }
  }
}
</style>
