<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ServicePicker from '@/components/booking/ServicePicker.vue'
import { managementService } from '@/services/management.service'
import { cartItems, cartKey, localSubtotal, type Cart } from '@/composables/booking/cart'
import { itemLabel } from '@/utils/pricing'
import { fromCents, money, toCents } from '@/utils/format'
import type { BookingDetail, QuoteItemInput, Service } from '@/types/api'

const props = defineProps<{ booking: BookingDetail; saving: boolean; locked: boolean }>()
const emit = defineEmits<{ save: [patch: { items?: QuoteItemInput[]; discount?: number }] }>()

const editing = ref(false)
const services = ref<Service[]>([])
const cart = ref<Cart>({})
const discount = ref('')

async function startEdit() {
  cart.value = Object.fromEntries(
    props.booking.items.filter((i) => i.service).map((i) => [cartKey(i.service!, i.variant), i.quantity]),
  )
  discount.value = fromCents(props.booking.discount)
  editing.value = true
  if (!services.value.length) {
    // Incluye inactivos para que un ítem antiguo siga visible al editar.
    services.value = (await managementService.services()).sort((a, b) => a.order - b.order)
  }
}

function save() {
  // Las líneas libres (p. ej. una cotización convertida) no están en el catálogo: se conservan tal cual.
  const custom = props.booking.items
    .filter((i) => !i.service)
    .map((i) => ({ name: i.name, unitPrice: i.unitPrice, quantity: i.quantity }))
  const items = [...cartItems(cart.value), ...custom] as QuoteItemInput[]
  if (!items.length) return
  emit('save', { items, discount: toCents(discount.value || 0) })
  editing.value = false
}
</script>

<template>
  <section class="card items">
    <div class="items__head">
      <h3>Servicios</h3>
      <button v-if="!editing && !locked" type="button" class="btn btn--soft btn--sm" @click="startEdit"><AppIcon name="edit" :size="16" /> Editar</button>
    </div>

    <template v-if="!editing">
      <ul class="items__list">
        <li v-for="(i, n) in booking.items" :key="n">
          <span>{{ itemLabel(i) }} <small class="muted money">({{ money(i.unitPrice) }})</small></span>
          <span class="money">{{ money(i.subtotal) }}</span>
        </li>
      </ul>
      <dl class="items__totals">
        <div><dt>Subtotal</dt><dd class="money">{{ money(booking.subtotal) }}</dd></div>
        <div v-if="booking.discount"><dt>Descuento</dt><dd class="money">−{{ money(booking.discount) }}</dd></div>
        <div class="items__total"><dt>Total</dt><dd class="money">{{ money(booking.total) }}</dd></div>
      </dl>
    </template>

    <template v-else>
      <ServicePicker v-if="services.length" v-model="cart" :services="services" compact />
      <span v-else class="skeleton" style="height: 140px"></span>
      <label class="field items__discount">
        <span class="field__label">Descuento (USD)</span>
        <input v-model="discount" inputmode="decimal" />
      </label>
      <p class="muted items__hint">Subtotal estimado {{ money(localSubtotal(cart, services)) }}. El servidor recalcula los precios.</p>
      <div class="items__actions">
        <button type="button" class="btn btn--ghost" @click="editing = false">Cancelar</button>
        <button type="button" class="btn btn--primary" :disabled="saving || !cartItems(cart).length" @click="save">Guardar servicios</button>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.items {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: $text-base;
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: $text-sm;

    li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
  }

  &__totals {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding-top: 0.6rem;
    border-top: 1px dashed $line;
    font-size: $text-sm;

    div {
      display: flex;
      justify-content: space-between;
    }
  }

  &__total {
    font-weight: 800;
    font-size: $text-base;
  }

  &__discount {
    max-width: 220px;
  }

  &__hint {
    font-size: $text-xs;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
}
</style>
