<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import ReceiveCollectionSheet from '@/components/admin/payments/ReceiveCollectionSheet.vue'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { dateTime, errorMessage, money, shortDate } from '@/utils/format'
import type { OperatorCollection } from '@/types/operation'

/**
 * Cobros que reportan los operadores al terminar: efectivo que deben entregar y transferencias
 * que la oficina confirma subiendo el comprobante. Agrupado por operador.
 */
const scope = useAdminScope()
const toast = useToastStore()
const tab = ref<'pending' | 'done'>('pending')
const items = ref<OperatorCollection[]>([])
const summary = ref({ cashCount: 0, cashTotal: 0, transferCount: 0 })
const loading = ref(false)
const selected = ref<OperatorCollection | null>(null)

async function load() {
  loading.value = true
  try {
    const r = await operationService.collections(tab.value, scope.query)
    items.value = r.items
    summary.value = r.summary
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    loading.value = false
  }
}
watch([tab, toRef(scope, 'branch')], load, { immediate: true })

/** Por operador: lo que tiene pendiente de entregar o de confirmar. */
const groups = computed(() => {
  const map = new Map<string, { key: string; name: string; color?: string; cash: number; items: OperatorCollection[] }>()
  for (const it of items.value) {
    const op = it.operators[0]
    const key = op?._id || 'none'
    const g = map.get(key) || { key, name: it.operators.map((o) => o.name).join(', ') || it.reportedBy || 'Operador', color: op?.color, cash: 0, items: [] }
    if (it.method === 'cash') g.cash += tab.value === 'done' ? it.receivedAmount : it.cashReceived
    g.items.push(it)
    map.set(key, g)
  }
  return [...map.values()].sort((a, b) => b.cash - a.cash)
})

function onDone() {
  selected.value = null
  load()
}
</script>

<template>
  <section class="col">
    <PageIntro text="Cuando el operador termina un servicio, reporta si cobró en efectivo (y cuánto) o por transferencia. Aquí el administrador de la sucursal o gerencia recibe el efectivo y confirma las transferencias con su comprobante." />

    <SegTabs
      v-model="tab"
      :tabs="[
        { value: 'pending', label: 'Por recibir', count: tab === 'pending' ? items.length : undefined },
        { value: 'done', label: 'Recibidos (30 días)' },
      ]"
    />

    <KpiRow>
      <KpiCard :label="tab === 'pending' ? 'Efectivo por recibir' : 'Efectivo recibido'" :value="money(summary.cashTotal)" icon="cash" :tone="tab === 'pending' && summary.cashTotal ? 'warning' : 'success'" :hint="`${summary.cashCount} servicio(s)`" />
      <KpiCard :label="tab === 'pending' ? 'Transferencias por confirmar' : 'Transferencias confirmadas'" :value="String(summary.transferCount)" icon="bank" :tone="tab === 'pending' && summary.transferCount ? 'warning' : 'success'" />
    </KpiRow>

    <div v-if="loading && !items.length" class="col__skel"><span v-for="n in 3" :key="n" class="skeleton" style="height: 120px"></span></div>
    <div v-else-if="!items.length" class="card col__empty">
      <span class="col__empty-icon"><AppIcon name="check" :size="28" /></span>
      <strong>{{ tab === 'pending' ? 'Nada por recibir' : 'Sin cobros recibidos en los últimos 30 días' }}</strong>
      <p class="muted">{{ tab === 'pending' ? 'Cuando un operador termine un servicio y reporte el cobro, aparece aquí.' : '' }}</p>
    </div>

    <div v-else class="col__groups">
      <section v-for="g in groups" :key="g.key" class="card col__group" :style="{ '--op': g.color || '#1E2D3A' }">
        <header class="col__head">
          <span class="col__avatar">{{ g.name.charAt(0) }}</span>
          <div class="col__who">
            <strong>{{ g.name }}</strong>
            <small>{{ g.items.length }} servicio(s)</small>
          </div>
          <div v-if="g.cash" class="col__cash">
            <small>{{ tab === 'pending' ? 'Debe entregar' : 'Entregó' }}</small>
            <strong>{{ money(g.cash) }}</strong>
          </div>
        </header>
        <ul class="col__list">
          <li v-for="it in g.items" :key="it._id" class="col__item">
            <span class="col__method" :class="`is-${it.method}`"><AppIcon :name="it.method === 'cash' ? 'cash' : 'bank'" :size="18" /></span>
            <div class="col__info">
              <RouterLink :to="`/admin/pedidos/${it._id}`" class="col__svc">{{ it.customer?.name || 'Cliente' }} · {{ it.code }}</RouterLink>
              <small>{{ shortDate(it.date) }} {{ it.time }} · total {{ money(it.total) }}</small>
              <small v-if="tab === 'done'" class="col__ok">
                <AppIcon name="check-circle" :size="13" /> {{ it.method === 'cash' ? `Recibió ${money(it.receivedAmount)}` : 'Confirmada' }} · {{ it.receivedBy }} · {{ dateTime(it.receivedAt || '') }}
                <a v-if="it.proofUrl" :href="it.proofUrl" target="_blank" rel="noopener" class="link">Ver comprobante</a>
              </small>
            </div>
            <div class="col__amt">
              <strong v-if="it.method === 'cash'">{{ money(tab === 'done' ? it.receivedAmount : it.cashReceived) }}</strong>
              <span v-else class="col__tag">Transferencia</span>
            </div>
            <button v-if="tab === 'pending'" type="button" class="btn btn--primary btn--sm" @click="selected = it">
              {{ it.method === 'cash' ? 'Recibir' : 'Subir comprobante' }}
            </button>
          </li>
        </ul>
      </section>
    </div>

    <ReceiveCollectionSheet :item="selected" @close="selected = null" @done="onDone" />
  </section>
</template>

<style scoped lang="scss">
.col {
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__skel,
  &__groups {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    text-align: center;
  }

  &__empty-icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: $success-bg;
    color: $success;
  }

  &__group {
    border-top: 4px solid var(--op);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  &__avatar {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--op);
    color: #fff;
    font-weight: 800;
  }

  &__who {
    flex: 1;
    display: flex;
    flex-direction: column;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__cash {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }

    strong {
      font-size: $text-xl;
      color: $navy;
    }
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    padding: 0.6rem 0.7rem;
    border-radius: $radius-md;
    background: $sky;
  }

  &__method {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;

    &.is-cash {
      background: $success-bg;
      color: $success;
    }

    &.is-transfer {
      background: $navy-soft;
      color: $navy;
    }
  }

  &__info {
    flex: 1 1 200px;
    min-width: 0;
    display: flex;
    flex-direction: column;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__svc {
    font-weight: 700;
    color: $ink;
  }

  &__ok {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.3rem;
    color: $success !important;
  }

  &__amt strong {
    font-size: $text-base;
    color: $navy;
  }

  &__tag {
    padding: 0.15rem 0.55rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
    font-size: $text-xs;
    font-weight: 700;
  }
}
</style>
