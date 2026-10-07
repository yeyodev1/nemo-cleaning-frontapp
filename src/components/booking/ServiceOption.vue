<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import M2Input from '@/components/ui/M2Input.vue'
import VehicleSizeHelp from './VehicleSizeHelp.vue'
import { cartKey, type Cart } from '@/composables/booking/cart'
import { money } from '@/utils/format'
import { priceLine, priceSummary, serviceMinQty, tierRanges, unitSuffix, variantLabel } from '@/utils/pricing'
import type { Service } from '@/types/api'

/**
 * Un servicio del catálogo dentro del selector: precio "desde", qué incluye y una fila por
 * opción (tamaño, medida, plan) con su cantidad. Los servicios por m² piden m² con decimales y
 * los de tramos muestran la tabla de precios por cantidad.
 */
const props = defineProps<{ service: Service; cart: Cart; compact?: boolean }>()
const emit = defineEmits<{ set: [key: string, value: number] }>()

const s = computed(() => props.service)
const rows = computed(() =>
  s.value.variants?.length
    ? s.value.variants.map((v) => ({ key: cartKey(s.value._id, v.label), label: v.label, price: variantLabel(v) }))
    : [{ key: cartKey(s.value._id), label: '', price: s.value.priceTiers?.length ? '' : money(s.value.price) }],
)
const minQty = computed(() => serviceMinQty(s.value))
const on = computed(() => rows.value.some((r) => (props.cart[r.key] || 0) > 0))
const isCarSized = computed(() => s.value.category === 'autos' && s.value.variants?.some((v) => /Pequeño|Grande/.test(v.label)))
const hasRange = computed(() => s.value.variants?.some((v) => v.priceMax > v.price))
// Precio vigente de la línea con tramos (cambia con la cantidad).
const tierNow = computed(() => {
  const q = props.cart[rows.value[0]!.key] || 0
  return q > 0 && s.value.priceTiers?.length ? priceLine(s.value, '', q) : null
})

function qty(key: string) {
  return props.cart[key] || 0
}

function setQty(key: string, value: number) {
  const current = qty(key)
  // Con mínimo (ventanales desde 2): de 0 salta al mínimo y por debajo vuelve a 0.
  if (value > 0 && value < minQty.value) value = value > current ? minQty.value : 0
  emit('set', key, value)
}
</script>

<template>
  <li class="opt" :class="{ 'is-on': on, 'opt--extra': s.isExtra }">
    <div class="opt__head">
      <img v-if="s.imageUrl && !compact" class="opt__thumb" :src="s.imageUrl" alt="" loading="lazy" width="64" height="64" />
      <div class="opt__title">
        <strong>{{ s.name }}</strong>
        <span class="opt__from money">
          <template v-if="s.isExtra">+ </template>{{ priceSummary(s) }} <em v-if="unitSuffix(s)">{{ unitSuffix(s) }}</em>
        </span>
      </div>
    </div>

    <p v-if="s.description && !compact" class="opt__desc">{{ s.description }}</p>
    <p v-if="(s.durationLabel || s.deliveryNote) && !compact" class="opt__meta">
      <span v-if="s.durationLabel"><AppIcon name="clock" :size="14" /> {{ s.durationLabel }}</span>
      <span v-if="s.deliveryNote"><AppIcon name="route" :size="14" /> {{ s.deliveryNote }}</span>
    </p>

    <details v-if="s.features?.length && !compact" class="opt__features">
      <summary>Qué incluye <AppIcon name="chevron-down" :size="16" /></summary>
      <ul>
        <li v-for="f in s.features" :key="f"><AppIcon name="check" :size="14" /> {{ f }}</li>
      </ul>
    </details>

    <VehicleSizeHelp v-if="isCarSized" />

    <ul v-if="s.priceTiers?.length" class="opt__tiers" aria-label="Precio por cantidad">
      <li v-for="t in tierRanges(s.priceTiers)" :key="t.label">
        <span>{{ t.label }}</span><strong class="money">{{ money(t.price) }} c/u</strong>
      </li>
    </ul>

    <ul class="opt__rows">
      <li v-for="r in rows" :key="r.key" class="row" :class="{ 'is-on': qty(r.key) > 0 }">
        <span class="row__label">
          {{ r.label || (s.priceTiers?.length ? 'Cantidad' : s.unit === 'm2' ? 'Metros cuadrados' : 'Cantidad') }}
          <small v-if="s.priceTiers?.length && minQty > 1">mínimo {{ minQty }}</small>
          <small v-if="tierNow" class="money">{{ money(tierNow.unitPrice) }} c/u · {{ money(tierNow.subtotal) }}</small>
        </span>
        <span v-if="r.price" class="row__price money">{{ r.price }}<em v-if="s.unit === 'm2'"> / m²</em></span>
        <M2Input v-if="s.unit === 'm2'" :model-value="qty(r.key)" :label="`${s.name} ${r.label}`" @update:model-value="setQty(r.key, $event)" />
        <QuantityStepper v-else :model-value="qty(r.key)" :label="`${s.name} ${r.label}`.trim()" @update:model-value="setQty(r.key, $event)" />
      </li>
    </ul>

    <p v-if="hasRange" class="opt__note"><AppIcon name="info" :size="14" /> {{ `Al reservar se toma el valor menor como base.${s.priceNote ? ` ${s.priceNote}` : ''}` }}</p>
  </li>
</template>

<style scoped lang="scss">
.opt {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.95rem;
  border-radius: $radius-md;
  background: $surface;
  border: 1.5px solid $line;
  transition: border-color 0.2s, box-shadow 0.2s;

  &.is-on {
    border-color: $orange;
    box-shadow: 0 6px 18px rgba($orange, 0.14);
  }

  &--extra {
    background: $sky;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__thumb {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 12px;
    flex-shrink: 0;
  }

  &__title {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;

    strong {
      font-size: $text-base;
      line-height: 1.3;
      color: $navy;
    }
  }

  &__from {
    font-weight: 700;
    color: $orange-ink;
    font-size: $text-sm;

    em {
      font-style: normal;
      font-weight: 500;
      color: $ink-muted;
      font-size: $text-xs;
    }
  }

  &__desc,
  &__note {
    font-size: $text-xs;
    color: $ink-soft;
    line-height: 1.5;
  }

  &__note {
    display: flex;
    gap: 0.35rem;
    align-items: flex-start;

    svg {
      margin-top: 2px;
      flex-shrink: 0;
      color: $orange-ink;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.9rem;
    font-size: $text-xs;
    color: $ink-soft;
    font-weight: 600;

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    svg {
      color: $orange-ink;
    }
  }

  &__features {
    font-size: $text-xs;

    summary {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      min-height: 36px;
      font-weight: 700;
      color: $navy;
      cursor: pointer;
      list-style: none;

      &::-webkit-details-marker {
        display: none;
      }
    }

    &[open] summary svg {
      transform: rotate(180deg);
    }

    ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      color: $ink-soft;
    }

    li {
      display: flex;
      gap: 0.4rem;

      svg {
        flex-shrink: 0;
        margin-top: 3px;
        color: $orange-ink;
      }
    }
  }

  &__tiers {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    li {
      display: inline-flex;
      gap: 0.4rem;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      background: $orange-soft;
      font-size: $text-xs;
      color: $ink-soft;

      strong {
        color: $orange-ink;
      }
    }
  }

  &__rows {
    list-style: none;
    display: flex;
    flex-direction: column;
    border-top: 1px solid $line;
  }
}

.row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 56px;
  padding: 0.35rem 0;
  border-bottom: 1px solid $line;

  &:last-child {
    border-bottom: 0;
  }

  &__label {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;

    small {
      font-size: $text-xs;
      font-weight: 500;
      color: $ink-muted;
    }
  }

  &__price {
    font-weight: 700;
    color: $orange-ink;
    font-size: $text-sm;
    text-align: right;

    em {
      font-style: normal;
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &.is-on .row__label {
    color: $navy;
  }
}
</style>
