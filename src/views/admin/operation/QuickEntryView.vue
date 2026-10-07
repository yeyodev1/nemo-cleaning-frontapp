<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import CustomerPicker from '@/components/admin/operation/CustomerPicker.vue'
import ServiceLinePicker from '@/components/admin/operation/ServiceLinePicker.vue'
import SessionList from '@/components/admin/operation/SessionList.vue'
import { useQuickEntry } from '@/composables/operation/useQuickEntry'
import { paymentConfirmation } from '@/config/operationLabels'
import { addDays, money, shortDate, todayISO } from '@/utils/format'

const q = useQuickEntry()
const { form } = q
const today = todayISO()
const dayChoices = [
  { value: today, label: 'Hoy' },
  { value: addDays(today, -1), label: 'Ayer' },
]
const branchChoices = computed(() => (q.options.value?.branches || []).map((b) => ({ value: b._id, label: b.name })))
const operatorChoices = computed(() => q.operators.value.map((o) => ({ value: o._id, label: o.name, color: o.color })))
const zoneChoices = computed(() => [...q.zones.value.map((z) => ({ value: z, label: z })), { value: '__other', label: 'Otra' }])
const zoneModel = computed({
  get: () => (form.otherZone ? '__other' : form.zone),
  set: (v: string | string[]) => {
    form.otherZone = v === '__other'
    form.zone = form.otherZone ? '' : String(v)
  },
})
const accountChoices = computed(() => (q.options.value?.accounts || []).map((a) => ({ value: a.label, label: a.label })))
const confirmationChoices = Object.entries(paymentConfirmation).map(([value, c]) => ({ value, label: c.label, hint: c.hint }))
</script>

<template>
  <form class="qe" novalidate @submit.prevent="q.submit()">
    <PageIntro text="Carga un servicio ya hecho, como una fila de la Base. Al guardar, el día y el operador se quedan puestos para registrar el siguiente sin volver a elegirlos.">
      <RouterLink to="/admin/produccion" class="btn btn--ghost"><AppIcon name="list" /> Ver la Base del día</RouterLink>
    </PageIntro>

    <section class="card qe__sec">
      <h2><span class="qe__n">1</span> Día y equipo</h2>
      <div class="qe__row">
        <ChoiceChips v-model="form.date" :options="dayChoices" label="Día" />
        <label class="field qe__date"><span class="sr-only">Otra fecha</span><input v-model="form.date" type="date" :max="today" /></label>
      </div>
      <p class="qe__hint">{{ shortDate(form.date) }}</p>
      <div v-if="branchChoices.length > 1" class="field">
        <span class="field__label">Sucursal</span>
        <ChoiceChips v-model="form.branch" :options="branchChoices" label="Sucursal" />
      </div>
      <div class="field">
        <span class="field__label">Operador(es) que hicieron el servicio</span>
        <ChoiceChips v-if="operatorChoices.length" v-model="form.operators" :options="operatorChoices" multiple label="Operadores" />
        <p v-else class="qe__hint">No hay operadores activos en esta sucursal. Agrégalos en Personal.</p>
      </div>
    </section>

    <Transition name="fade-up">
      <section v-if="q.scheduled.value.length" class="card qe__sec qe__sched">
        <h2><AppIcon name="calendar" :size="18" /> Agendados sin cerrar</h2>
        <p class="qe__hint">Toca uno para completarlo con sus datos (no se duplica el pedido).</p>
        <button v-for="b in q.scheduled.value" :key="b._id" type="button" class="qe__sched-item" :class="{ 'is-on': form.bookingId === b._id }" @click="q.useScheduled(b)">
          <span><strong>{{ b.time }} · {{ b.customer?.name }}</strong><small>{{ b.items.map((i) => i.name).join(', ') }}</small></span>
          <strong class="money">{{ money(b.total) }}</strong>
        </button>
      </section>
    </Transition>

    <section class="card qe__sec">
      <h2><span class="qe__n">2</span> Cliente y urbanización</h2>
      <p v-if="form.bookingId" class="qe__linked"><AppIcon name="check" :size="14" /> Completando un pedido agendado. <button type="button" class="link" @click="q.resetClient()">Quitar</button></p>
      <CustomerPicker v-model:phone="form.customerPhone" :name="form.customerName" :customer-id="form.customerId" @pick="q.pickCustomer" />
      <div class="field">
        <span class="field__label">Urbanización / zona</span>
        <ChoiceChips v-model="zoneModel" :options="zoneChoices" label="Urbanización" small />
        <input v-if="form.otherZone" v-model="form.zone" type="text" placeholder="Escribe la urbanización" class="qe__other" />
      </div>
    </section>

    <section class="card qe__sec">
      <h2><span class="qe__n">3</span> Servicio</h2>
      <ServiceLinePicker :services="q.services.value" :lines="form.lines" @add="q.addService" @free="q.addFree" @remove="q.removeLine" />
      <MoneyField v-if="form.lines.length" v-model="form.discount" label="Descuento (opcional)" hint="Si se cobró menos de lo normal." />
    </section>

    <section class="card qe__sec">
      <h2><span class="qe__n">4</span> Pago</h2>
      <div class="field">
        <span class="field__label">Forma de pago</span>
        <ChoiceChips v-model="form.account" :options="accountChoices" label="Forma de pago" small />
      </div>
      <div class="field">
        <span class="field__label">Confirmación</span>
        <ChoiceChips v-model="form.confirmation" :options="confirmationChoices" label="Confirmación del pago" small />
        <span class="field__hint">{{ paymentConfirmation[form.confirmation].hint }}</span>
      </div>
      <div class="form-row">
        <MoneyField v-model="form.tip" label="Propina (opcional)" hint="No suma a la producción." />
        <label class="field"><span class="field__label">Observaciones</span><input v-model="form.notes" type="text" placeholder="Ej.: se quejó por los vidrios" /></label>
      </div>
    </section>

    <div class="qe__bar">
      <div class="qe__total">
        <small>{{ form.lines.length ? `${form.lines.length} servicio(s)` : 'Sin servicios' }}<template v-if="form.discount"> · desc. −{{ money(form.discount) }}</template></small>
        <strong class="money">{{ money(q.total.value) }}</strong>
      </div>
      <button type="submit" class="btn btn--lg qe__save" :disabled="q.busy.value">
        <AppIcon name="check" /> {{ q.busy.value ? 'Guardando…' : 'Guardar y seguir' }}
      </button>
    </div>

    <SessionList :items="q.session.value" />
  </form>
</template>

<style scoped lang="scss">
.qe {
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
    background: $navy;
    color: #fff;
    font-size: $text-xs;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__date {
    flex: 1 1 160px;
    max-width: 220px;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
    margin-top: -0.4rem;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  &__other {
    margin-top: 0.5rem;
  }

  &__linked {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: $text-xs;
    color: $success;
    font-weight: 600;
  }

  &__sched-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    min-height: $tap-lg;
    padding: 0.6rem 0.8rem;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    text-align: left;

    span {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    small {
      color: $ink-muted;
      font-size: $text-xs;
      @include truncate;
    }

    &.is-on {
      border-color: $success;
      background: $success-bg;
    }
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
    background: $orange;
    color: $navy-ink;
  }
}

.link {
  color: $navy;
  text-decoration: underline;
  font-weight: 600;
}
</style>
