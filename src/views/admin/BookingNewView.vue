<script setup lang="ts">
import ServicePicker from '@/components/booking/ServicePicker.vue'
import FileDrop from '@/components/ui/FileDrop.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SlotPicker from '@/components/admin/bookings/SlotPicker.vue'
import OperatorChips from '@/components/admin/bookings/OperatorChips.vue'
import { useBookingForm } from '@/composables/admin/useBookingForm'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { bookingStatus, options, paymentMethod } from '@/config/labels'
import { money } from '@/utils/format'

const scope = useAdminScope()
const toast = useToastStore()
const { form, cart, services, subtotal, discountCents, total, busy, uploading, uploadProof, submit } = useBookingForm()
const statuses = options(bookingStatus).filter((s) => ['pending', 'confirmed'].includes(s.value))
const methods = options(paymentMethod)
</script>

<template>
  <form class="new" novalidate @submit.prevent="submit">
    <section class="card new__sec">
      <h2>1. Sucursal y servicios</h2>
      <label class="field">
        <span class="field__label">Sucursal</span>
        <select v-model="form.branch" required>
          <option value="" disabled>Elige una sucursal</option>
          <option v-for="b in scope.visibleBranches" :key="b._id" :value="b._id">{{ b.name }}</option>
        </select>
      </label>
      <ServicePicker v-if="services.length" v-model="cart" :services="services" compact />
      <span v-else class="skeleton" style="height: 160px"></span>
    </section>

    <section class="card new__sec">
      <h2>2. Fecha y hora</h2>
      <SlotPicker v-model:date="form.date" v-model:time="form.time" :branch="form.branch" />
    </section>

    <section class="card new__sec">
      <h2>3. Cliente</h2>
      <div class="form-row">
        <label class="field"><span class="field__label">Nombre *</span><input v-model="form.customer.name" autocomplete="off" required /></label>
        <label class="field"><span class="field__label">Teléfono *</span><input v-model="form.customer.phone" type="tel" inputmode="tel" required /></label>
      </div>
      <div class="form-row">
        <label class="field"><span class="field__label">Correo</span><input v-model="form.customer.email" type="email" /></label>
        <label class="field"><span class="field__label">Cédula / RUC</span><input v-model="form.customer.documentId" inputmode="numeric" /></label>
      </div>
      <label class="field"><span class="field__label">Dirección del servicio *</span><input v-model="form.address" required /></label>
      <label class="field"><span class="field__label">Referencia</span><input v-model="form.reference" placeholder="Junto a…, casa color…" /></label>
      <label class="field"><span class="field__label">Notas</span><textarea v-model="form.notes" rows="2"></textarea></label>
      <label class="check"><input v-model="form.invoice.required" type="checkbox" /> Requiere factura</label>
      <template v-if="form.invoice.required">
        <div class="form-row">
          <label class="field"><span class="field__label">Razón social</span><input v-model="form.invoice.name" /></label>
          <label class="field"><span class="field__label">Cédula / RUC</span><input v-model="form.invoice.documentId" /></label>
        </div>
        <div class="form-row">
          <label class="field"><span class="field__label">Correo de facturación</span><input v-model="form.invoice.email" type="email" /></label>
          <label class="field"><span class="field__label">Dirección fiscal</span><input v-model="form.invoice.address" /></label>
        </div>
      </template>
    </section>

    <section class="card new__sec">
      <h2>4. Pago</h2>
      <div class="new__methods" role="radiogroup" aria-label="Método de pago">
        <label v-for="m in methods" :key="m.value" class="new__method" :class="{ 'is-on': form.paymentMethod === m.value }">
          <input v-model="form.paymentMethod" type="radio" name="method" :value="m.value" class="sr-only" />
          <AppIcon :name="m.value === 'card' ? 'card' : m.value === 'cash' ? 'cash' : 'bank'" /> {{ m.label }}
        </label>
      </div>
      <FileDrop
        v-if="form.paymentMethod === 'transfer'"
        label="Comprobante (opcional en el panel)"
        :url="form.transferProofUrl"
        :busy="uploading"
        @pick="uploadProof"
        @error="toast.error"
      />
      <label class="field new__discount">
        <span class="field__label">Descuento (USD)</span>
        <input v-model="form.discount" type="text" inputmode="decimal" placeholder="0.00" />
      </label>
    </section>

    <section class="card new__sec">
      <h2>5. Equipo y estado</h2>
      <OperatorChips v-model="form.operators" :branch="form.branch" />
      <label class="field">
        <span class="field__label">Estado inicial</span>
        <select v-model="form.status">
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </label>
    </section>

    <div class="new__bar">
      <div class="new__totals">
        <small>Subtotal {{ money(subtotal) }}<template v-if="discountCents"> · Desc. −{{ money(discountCents) }}</template></small>
        <strong class="money">{{ money(total) }}</strong>
      </div>
      <button type="submit" class="btn btn--primary btn--lg" :disabled="busy">{{ busy ? 'Creando…' : 'Crear pedido' }}</button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.new {
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__sec {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;

    h2 {
      font-size: $text-base;
      color: $navy;
    }
  }

  &__methods {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__method {
    flex: 1 1 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: $tap-lg;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    font-weight: 700;
    font-size: $text-sm;
    cursor: pointer;

    &.is-on {
      border-color: $navy;
      background: $navy-soft;
      color: $navy;
    }

    &:focus-within {
      outline: 2.5px solid $aqua-deep;
      outline-offset: 2px;
    }
  }

  &__discount {
    max-width: 220px;
  }

  &__bar {
    position: sticky;
    bottom: calc(70px + env(safe-area-inset-bottom));
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0.9rem;
    border-radius: $radius-md;
    background: $navy-ink;
    color: #fff;
    box-shadow: $shadow-lg;

    @include from('lg') {
      bottom: 1rem;
    }
  }

  &__totals {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    small {
      font-size: $text-xs;
      color: $on-dark-soft;
    }

    strong {
      font-size: $text-xl;
    }
  }

  &__bar .btn--primary {
    background: $aqua;
    color: $navy-ink;
    box-shadow: none;
  }
}
</style>
