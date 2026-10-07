<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import ServiceLinePicker from '@/components/admin/operation/ServiceLinePicker.vue'
import WaPaymentFields from '@/components/admin/whatsapp/WaPaymentFields.vue'
import WaQuickDone from '@/components/admin/whatsapp/WaQuickDone.vue'
import { useWaQuickOrder } from '@/composables/whatsapp/useWaQuickOrder'
import { addDays, money, shortDate, todayISO } from '@/utils/format'

const q = useWaQuickOrder()
const { form } = q
const today = todayISO()
const dayChoices = [
  { value: today, label: 'Hoy' },
  { value: addDays(today, 1), label: 'Mañana' },
  { value: addDays(today, 2), label: 'Pasado mañana' },
]
const timeChoices = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((t) => ({ value: t, label: t }))
const statusChoices = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Por confirmar' },
]
const branchChoices = computed(() => q.wa.branches.value.map((b) => ({ value: b._id, label: b.name })))
const zoneChoices = computed(() => [...q.zones.value.map((z) => ({ value: z, label: z })), { value: '__other', label: 'Otra' }])
const zoneModel = computed({
  get: () => (form.otherZone ? '__other' : form.zone),
  set: (v: string | string[]) => {
    form.otherZone = v === '__other'
    form.zone = form.otherZone ? '' : String(v)
  },
})
const statusModel = computed({
  get: () => form.status,
  set: (v: string | string[]) => (form.status = v === 'pending' ? 'pending' : 'confirmed'),
})
</script>

<template>
  <Transition name="fade-up" mode="out-in">
    <WaQuickDone v-if="q.saved.value" :order="q.saved.value" :paid="q.savedPaid.value" @again="q.reset()" />

    <form v-else class="wqo" novalidate @submit.prevent="q.submit()">
      <section class="card wqo__sec">
        <h2><span class="wqo__n">1</span> Cliente</h2>
        <label class="field">
          <span class="field__label">WhatsApp del cliente *</span>
          <input v-model="form.phone" type="tel" inputmode="tel" autocomplete="off" placeholder="0991234567" autofocus />
        </label>
        <p v-if="q.looking.value" class="wqo__state">Buscando cliente…</p>
        <Transition name="fade-up">
          <p v-if="!q.looking.value && q.match.value?.customer" class="wqo__state wqo__state--ok">
            <AppIcon name="check" :size="14" /> Ya es cliente · {{ q.match.value.customer.totalOrders }} pedido(s)<template v-if="q.match.value.last">. Último {{ q.match.value.last.code }}: datos cargados</template>
          </p>
          <p v-else-if="!q.looking.value && q.match.value" class="wqo__state"><AppIcon name="plus" :size="14" /> Cliente nuevo: se guarda con el pedido</p>
        </Transition>
        <label class="field">
          <span class="field__label">Nombre *</span>
          <input v-model="form.name" type="text" autocomplete="off" placeholder="Nombre y apellido" />
        </label>
      </section>

      <section class="card wqo__sec">
        <h2><span class="wqo__n">2</span> Servicios</h2>
        <ServiceLinePicker :services="q.wa.services.value" :lines="form.lines" @add="q.addService" @free="q.addFree" @remove="q.removeLine" />
      </section>

      <section class="card wqo__sec">
        <h2><span class="wqo__n">3</span> Cuándo y dónde</h2>
        <div class="wqo__row">
          <ChoiceChips v-model="form.date" :options="dayChoices" label="Día" small />
          <label class="field wqo__date"><span class="sr-only">Otra fecha</span><input v-model="form.date" type="date" /></label>
        </div>
        <p class="wqo__hint">{{ shortDate(form.date) }}</p>
        <div class="field">
          <span class="field__label">Hora</span>
          <div class="wqo__row">
            <ChoiceChips v-model="form.time" :options="timeChoices" label="Hora" small />
            <label class="field wqo__time"><span class="sr-only">Otra hora</span><input v-model="form.time" type="time" step="900" /></label>
          </div>
        </div>
        <div v-if="branchChoices.length > 1" class="field">
          <span class="field__label">Sucursal</span>
          <ChoiceChips v-model="form.branch" :options="branchChoices" label="Sucursal" />
        </div>
        <div v-if="q.zones.value.length" class="field">
          <span class="field__label">Urbanización / zona</span>
          <ChoiceChips v-model="zoneModel" :options="zoneChoices" label="Urbanización" small />
          <input v-if="form.otherZone" v-model="form.zone" type="text" placeholder="Escribe la urbanización" class="wqo__other" />
        </div>
        <label class="field"><span class="field__label">Dirección</span><input v-model="form.address" type="text" placeholder="Calle, manzana, villa" /></label>
        <label class="field"><span class="field__label">Referencia</span><input v-model="form.reference" type="text" placeholder="Junto a…, casa esquinera…" /></label>
      </section>

      <section class="card wqo__sec">
        <h2><span class="wqo__n">4</span> Pago y estado</h2>
        <WaPaymentFields v-model:state="q.pay.value" :balance="q.total.value" />
        <div class="field">
          <span class="field__label">Estado del pedido</span>
          <ChoiceChips v-model="statusModel" :options="statusChoices" label="Estado" small />
        </div>
        <label class="field"><span class="field__label">Notas</span><input v-model="form.notes" type="text" placeholder="Ej.: llamar al llegar" /></label>
      </section>

      <div class="wqo__bar">
        <div class="wqo__total">
          <small>{{ form.lines.length ? `${form.lines.length} servicio(s)` : 'Sin servicios' }}</small>
          <strong :key="q.total.value" class="money bump">{{ money(q.total.value) }}</strong>
        </div>
        <button type="submit" class="btn btn--lg wqo__save" :disabled="q.busy.value">
          <AppIcon name="check" /> {{ q.busy.value ? 'Guardando…' : 'Guardar pedido' }}
        </button>
      </div>
    </form>
  </Transition>
</template>

<style scoped lang="scss">
.wqo {
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__sec {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;

    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: $text-base;
      color: $navy;
    }
  }

  &__n {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $whatsapp;
    color: #fff;
    font-size: $text-xs;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__date,
  &__time {
    flex: 1 1 140px;
    max-width: 200px;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
    margin-top: -0.4rem;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  &__state {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: -0.4rem;
    font-size: $text-xs;
    color: $ink-muted;

    &--ok {
      color: $success;
      font-weight: 600;
    }
  }

  &__other {
    margin-top: 0.5rem;
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

  &__total {
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

  &__save {
    background: $whatsapp;
    color: #fff;
  }
}
</style>
