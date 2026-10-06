<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseSheet from '@/components/ui/BaseSheet.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { officeFrequency, officeQuoteStatus, options } from '@/config/labels'
import { addDays, dateTime, errorMessage, intlPhone, money, todayISO, whatsappUrl } from '@/utils/format'
import type { OfficeQuote, OfficeQuoteStatus } from '@/types/api'

const props = defineProps<{ quote: OfficeQuote | null }>()
const emit = defineEmits<{ close: []; changed: [q: OfficeQuote] }>()
const router = useRouter()
const toast = useToastStore()
const busy = ref(false)
const converting = ref(false)
const conv = reactive({ date: addDays(todayISO(), 1), time: '09:00', address: '' })

watch(
  () => props.quote,
  () => {
    converting.value = false
    conv.address = ''
  },
)

async function setStatus(status: OfficeQuoteStatus) {
  if (!props.quote || status === props.quote.status) return
  busy.value = true
  try {
    const q = await managementService.updateOfficeQuote(props.quote._id, { status })
    emit('changed', q)
    toast.success('Estado actualizado')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}

async function convert() {
  if (!props.quote) return
  busy.value = true
  try {
    const b = await managementService.convertOfficeQuote(props.quote._id, {
      date: conv.date,
      time: conv.time,
      address: conv.address || undefined,
    })
    toast.success(`Pedido ${b.code} creado`)
    router.push(`/admin/pedidos/${b._id}`)
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <BaseSheet :open="Boolean(quote)" :title="quote ? `Cotización ${quote.code}` : ''" side @close="emit('close')">
    <div v-if="quote" class="qs">
      <div class="qs__head">
        <StatusBadge :tone="officeQuoteStatus[quote.status].tone" :label="officeQuoteStatus[quote.status].label" />
        <span class="muted">{{ dateTime(quote.createdAt) }}</span>
      </div>

      <section class="qs__block">
        <h3>{{ quote.contact.company || quote.contact.name }}</h3>
        <p v-if="quote.contact.company">{{ quote.contact.name }}</p>
        <div class="qs__links">
          <a v-if="quote.contact.phone" :href="`tel:+${intlPhone(quote.contact.phone)}`" class="btn btn--ghost btn--sm"><AppIcon name="phone" /> Llamar</a>
          <a v-if="quote.contact.phone" :href="whatsappUrl(quote.contact.phone, `Hola ${quote.contact.name}, te escribimos de Nemo Cleaning por tu cotización ${quote.code}.`)" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm"><AppIcon name="whatsapp" /> WhatsApp</a>
          <a v-if="quote.contact.email" :href="`mailto:${quote.contact.email}`" class="btn btn--ghost btn--sm"><AppIcon name="mail" /> Correo</a>
        </div>
      </section>

      <ul class="qs__facts">
        <li><span>Área</span><strong>{{ quote.squareMeters }} m²</strong></li>
        <li><span>Sillas</span><strong>{{ quote.chairs }}</strong></li>
        <li><span>Escritorios</span><strong>{{ quote.desks }}</strong></li>
        <li><span>Baños</span><strong>{{ quote.bathrooms }}</strong></li>
        <li><span>Frecuencia</span><strong>{{ officeFrequency[quote.frequency] }}</strong></li>
      </ul>
      <p v-if="quote.notes" class="qs__notes">{{ quote.notes }}</p>

      <section class="qs__block">
        <ul class="qs__breakdown">
          <li v-for="l in quote.breakdown" :key="l.label"><span>{{ l.label }}</span><span class="money">{{ money(l.amount) }}</span></li>
        </ul>
        <p class="qs__total"><span>Estimado</span><strong class="money">{{ money(quote.estimate) }}</strong></p>
      </section>

      <label class="field">
        <span class="field__label">Estado</span>
        <select :value="quote.status" :disabled="busy" @change="setStatus(($event.target as HTMLSelectElement).value as OfficeQuoteStatus)">
          <option v-for="o in options(officeQuoteStatus)" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>

      <RouterLink v-if="quote.booking" :to="`/admin/pedidos/${quote.booking}`" class="btn btn--soft btn--block">
        <AppIcon name="list" /> Ver pedido creado
      </RouterLink>
      <template v-else>
        <button v-if="!converting" type="button" class="btn btn--primary btn--block" @click="converting = true">
          <AppIcon name="calendar" /> Convertir en pedido
        </button>
        <form v-else class="qs__conv" @submit.prevent="convert">
          <div class="form-row">
            <label class="field"><span class="field__label">Fecha</span><input v-model="conv.date" type="date" required /></label>
            <label class="field"><span class="field__label">Hora</span><input v-model="conv.time" type="time" required /></label>
          </div>
          <label class="field"><span class="field__label">Dirección (opcional)</span><input v-model="conv.address" type="text" /></label>
          <div class="qs__links">
            <button type="button" class="btn btn--ghost" @click="converting = false">Cancelar</button>
            <button type="submit" class="btn btn--primary" :disabled="busy">Crear pedido</button>
          </div>
        </form>
      </template>
    </div>
  </BaseSheet>
</template>

<style scoped lang="scss">
.qs {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $text-xs;
  }

  &__block h3 {
    font-size: $text-lg;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.6rem;
    justify-content: flex-end;

    .btn {
      min-height: $tap;
    }
  }

  &__block &__links {
    justify-content: flex-start;
  }

  &__facts {
    list-style: none;
    @include flex-cards(90px, 0.5rem);

    li {
      background: $sky;
      border-radius: $radius-sm;
      padding: 0.6rem 0.75rem;
      display: flex;
      flex-direction: column;
      font-size: $text-xs;
      color: $ink-muted;

      strong {
        color: $ink;
        font-size: $text-base;
      }
    }
  }

  &__notes {
    font-size: $text-sm;
    background: $warning-bg;
    padding: 0.75rem;
    border-radius: $radius-sm;
  }

  &__breakdown {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: $text-sm;

    li {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }
  }

  &__total {
    display: flex;
    justify-content: space-between;
    margin-top: 0.6rem;
    padding-top: 0.6rem;
    border-top: 1px dashed $line-strong;
    font-weight: 800;

    strong {
      font-size: $text-lg;
      color: $navy;
    }
  }

  &__conv {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.9rem;
    border-radius: $radius-md;
    background: $sky;
  }
}
</style>
