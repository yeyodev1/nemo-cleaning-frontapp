<script setup lang="ts">
import { ref, toRef } from 'vue'
import KpiCard from '@/components/admin/common/KpiCard.vue'
import KpiRow from '@/components/admin/sheet/KpiRow.vue'
import EmptyState from '@/components/admin/sheet/EmptyState.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ledgerService } from '@/services/ledger.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useReport } from '@/composables/admin/useReport'
import { followUpResult } from '@/config/financeLabels'
import { errorMessage, money, shortDate, whatsappUrl } from '@/utils/format'
import type { FollowUpResult, PortfolioItem } from '@/types/finance'

/** Gestión Comercial de Cartera: clientes sin servicio hace más de 60 días y su seguimiento. */
const scope = useAdminScope()
const toast = useToastStore()
const branch = toRef(scope, 'branch')
const result = ref<FollowUpResult | ''>('')
const { data, loading, load } = useReport(() => ledgerService.portfolio(scope.query, result.value), [branch, result])
const results = Object.keys(followUpResult) as FollowUpResult[]
const notes = ref<Record<string, string>>({})

async function update(i: PortfolioItem, body: Parameters<typeof ledgerService.updateFollowUp>[1], msg: string) {
  try {
    await ledgerService.updateFollowUp(i.customer._id, body)
    toast.success(msg)
    load()
  } catch (e) {
    toast.error(errorMessage(e))
  }
}
const ORDINAL = { 1: '1er', 2: '2do', 3: '3er' } as const
const contactKey = (n: 1 | 2 | 3) => `contact${n}At` as const
function toggleContact(i: PortfolioItem, n: 1 | 2 | 3) {
  const done = !i.followUp[contactKey(n)]
  update(i, { [`contact${n}`]: done }, done ? `${ORDINAL[n]} contacto registrado` : `${ORDINAL[n]} contacto desmarcado`)
}
function saveNotes(i: PortfolioItem) {
  const v = notes.value[i.customer._id]
  if (v === undefined || v === i.followUp.notes) return
  update(i, { notes: v }, 'Observación guardada')
}
const msg = (name: string) => `Hola ${name}, te escribimos de Nemo Cleaning. Hace tiempo no te visitamos, ¿agendamos tu próxima limpieza?`
</script>

<template>
  <div>
    <p class="hint">Clientes cuyo último servicio fue hace más de 60 días. Registra cada intento de contacto y el resultado; si vuelven a pedir, salen solos de la lista.</p>
    <div v-if="loading && !data" class="skeleton" style="height: 220px"></div>
    <template v-else-if="data">
      <KpiRow>
        <KpiCard label="Sin servicio +60 días" :value="data.total" icon="users" />
        <KpiCard label="Contactados" :value="data.summary.contacted" icon="phone" tone="aqua" />
        <KpiCard label="Aceptaron" :value="data.summary.accepted" icon="check-circle" tone="success" />
        <KpiCard label="No les interesa" :value="data.summary.declined" icon="ban" tone="danger" />
      </KpiRow>
      <label class="field filter">
        <span class="field__label">Resultado</span>
        <select v-model="result">
          <option value="">Todos</option>
          <option v-for="r in results" :key="r" :value="r">{{ followUpResult[r].label }}</option>
        </select>
      </label>
      <EmptyState v-if="!data.items.length" title="Nadie en la cartera" text="Todos tus clientes tuvieron un servicio en los últimos 60 días." icon="check-circle" />
      <TransitionGroup v-else name="fade-up" tag="ul" class="list">
        <li v-for="i in data.items" :key="i.customer._id" class="pf">
          <div class="pf__top">
            <div>
              <RouterLink :to="`/admin/clientes/${i.customer._id}`" class="pf__name">{{ i.customer.name }}</RouterLink>
              <p class="pf__meta">Último servicio {{ shortDate(i.lastService) }} · hace {{ i.daysSince }} días · {{ i.services }} {{ i.services === 1 ? 'servicio' : 'servicios' }} · {{ money(i.amount) }}</p>
            </div>
            <StatusBadge :tone="followUpResult[i.followUp.result].tone" :label="followUpResult[i.followUp.result].label" />
          </div>
          <div class="pf__contacts">
            <button
              v-for="n in ([1, 2, 3] as const)"
              :key="n"
              type="button"
              class="chip"
              :class="{ 'is-on': i.followUp[contactKey(n)] }"
              :aria-pressed="!!i.followUp[contactKey(n)]"
              @click="toggleContact(i, n)"
            >
              <AppIcon :name="i.followUp[contactKey(n)] ? 'check' : 'phone'" :size="14" /> {{ ORDINAL[n] }} contacto
            </button>
            <a v-if="i.customer.phone" :href="whatsappUrl(i.customer.phone, msg(i.customer.name))" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">
              <AppIcon name="whatsapp" :size="16" /> Escribir
            </a>
          </div>
          <div class="pf__result">
            <select :value="i.followUp.result" aria-label="Resultado" @change="update(i, { result: ($event.target as HTMLSelectElement).value as FollowUpResult }, 'Resultado guardado')">
              <option v-for="r in results" :key="r" :value="r">{{ followUpResult[r].label }}</option>
            </select>
            <input
              :value="notes[i.customer._id] ?? i.followUp.notes"
              type="text"
              maxlength="500"
              placeholder="Observaciones (se guardan al salir del campo)"
              aria-label="Observaciones"
              @input="notes[i.customer._id] = ($event.target as HTMLInputElement).value"
              @blur="saveNotes(i)"
            />
          </div>
        </li>
      </TransitionGroup>
    </template>
  </div>
</template>

<style scoped lang="scss">
.hint {
  font-size: $text-sm;
  color: $ink-muted;
  margin-bottom: 0.85rem;
}

.filter {
  max-width: 240px;
  margin-bottom: 0.85rem;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pf {
  @include card(0.85rem 0.95rem);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  &__name {
    font-weight: 800;
    color: $navy;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__contacts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: center;
  }

  &__result {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    select {
      flex: 0 1 180px;
    }

    input {
      flex: 1 1 220px;
    }
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 36px;
  padding: 0 0.8rem;
  border-radius: $radius-pill;
  border: 1px solid $line-strong;
  font-size: $text-xs;
  font-weight: 700;
  color: $ink-soft;
  transition:
    background-color $dur-fast ease,
    color $dur-fast ease;

  &.is-on {
    background: $success-bg;
    border-color: $success;
    color: $success;
  }
}
</style>
