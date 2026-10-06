<script setup lang="ts">
import { draft } from '@/composables/booking/useBookingDraft'
</script>

<template>
  <div class="details">
    <fieldset class="details__group">
      <legend>Dirección del servicio</legend>
      <label class="field">
        <span class="field__label">Dirección *</span>
        <input
          v-model="draft.address"
          type="text"
          autocomplete="street-address"
          placeholder="Urbanización, manzana, villa / calle y número"
          required
        />
      </label>
      <label class="field">
        <span class="field__label">Referencia</span>
        <input
          v-model="draft.reference"
          type="text"
          placeholder="Junto al parque, casa esquinera blanca…"
        />
      </label>
      <label class="field">
        <span class="field__label">Notas para el equipo</span>
        <textarea
          v-model="draft.notes"
          rows="3"
          placeholder="Manchas difíciles, mascotas, acceso a garita…"
        ></textarea>
      </label>
    </fieldset>

    <fieldset class="details__group">
      <legend>Tus datos</legend>
      <label class="field">
        <span class="field__label">Nombre completo *</span>
        <input v-model="draft.customer.name" type="text" autocomplete="name" required />
      </label>
      <div class="form-row">
        <label class="field">
          <span class="field__label">Celular (WhatsApp) *</span>
          <input
            v-model="draft.customer.phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="0991234567"
            required
          />
        </label>
        <label class="field">
          <span class="field__label">Correo *</span>
          <input
            v-model="draft.customer.email"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="tu@correo.com"
            required
          />
        </label>
      </div>
      <label class="field">
        <span class="field__label">Cédula (opcional)</span>
        <input v-model="draft.customer.documentId" type="text" inputmode="numeric" maxlength="13" />
      </label>
    </fieldset>

    <label class="check details__toggle">
      <input v-model="draft.invoice.required" type="checkbox" />
      Necesito factura con otros datos
    </label>

    <Transition name="fade">
      <fieldset v-if="draft.invoice.required" class="details__group details__group--soft">
        <legend>Datos de facturación</legend>
        <div class="form-row">
          <label class="field">
            <span class="field__label">Razón social / Nombre *</span>
            <input v-model="draft.invoice.name" type="text" />
          </label>
          <label class="field">
            <span class="field__label">RUC o cédula *</span>
            <input
              v-model="draft.invoice.documentId"
              type="text"
              inputmode="numeric"
              maxlength="13"
            />
          </label>
        </div>
        <div class="form-row">
          <label class="field">
            <span class="field__label">Correo para la factura *</span>
            <input v-model="draft.invoice.email" type="email" inputmode="email" />
          </label>
          <label class="field">
            <span class="field__label">Dirección</span>
            <input v-model="draft.invoice.address" type="text" />
          </label>
        </div>
      </fieldset>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__group {
    border: none;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;

    legend {
      font-weight: 800;
      font-size: $text-base;
      color: $navy;
      margin-bottom: 0.75rem;
    }

    &--soft {
      padding: 1rem;
      border-radius: $radius-md;
      background: $sky;
    }
  }

  &__toggle {
    padding: 0.25rem 0;
  }
}
</style>
