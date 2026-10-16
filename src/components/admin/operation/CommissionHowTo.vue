<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import TierRows from '@/components/admin/operation/TierRows.vue'
import { operationService } from '@/services/operation.service'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { describeTiers } from '@/composables/operation/useCommissions'
import { errorMessage, money } from '@/utils/format'
import type { CommissionRule, CommissionTier } from '@/types/operation'

/**
 * "¿Cómo se calcula?": explica la comisión (FEE) paso a paso con los valores vigentes,
 * deja probar un día y, para gerencia, cambiar todos los parámetros en un solo lugar.
 */
const emit = defineEmits<{ saved: [] }>()
const toast = useToastStore()
const me = useUserStore()
const canEdit = computed(() => me.isAdmin)

const saved = ref<CommissionRule | null>(null)
const form = ref<Required<CommissionRule> | null>(null)
const saving = ref(false)
const operators = ref<{ _id: string; name: string; color?: string }[]>([])

function normalize(r: CommissionRule): Required<CommissionRule> {
  return {
    ...JSON.parse(JSON.stringify(r)),
    periodStartDay: r.periodStartDay ?? 1,
    productionBasis: r.productionBasis ?? 'total',
    supervisorMode: r.supervisorMode ?? 'percent',
    supervisorFixed: r.supervisorFixed ?? 0,
  }
}

async function load() {
  try {
    const r = await operationService.commissionRule()
    saved.value = r
    form.value = normalize(r)
  } catch (e) {
    toast.error(errorMessage(e))
  }
}
load()
if (me.isAdmin)
  managementService
    .users('operator')
    .then((u) => (operators.value = u.filter((x) => x.active).map((x) => ({ _id: x._id, name: x.name, color: x.color }))))
    .catch(() => {})

const dirty = computed(() => !!form.value && !!saved.value && JSON.stringify(form.value) !== JSON.stringify(normalize(saved.value)))

// --- Simulador de un día ---
const testProduction = ref(9500)
function percentFor(excess: number, tiers: CommissionTier[]) {
  if (excess <= 0) return 0
  let p = 0
  for (const t of [...tiers].sort((a, b) => a.above - b.above)) if (excess > t.above || t.above === 0) p = t.percent
  return p
}
const sim = computed(() => {
  const r = form.value
  if (!r) return null
  const excess = testProduction.value - r.dailyBase
  const percent = percentFor(excess, r.tiers)
  return {
    excess,
    percent,
    fee: excess > 0 ? Math.round((excess * percent) / 100) : 0,
    supervisor: r.supervisorMode === 'percent' && excess > 0 ? Math.round((excess * r.supervisorPercent) / 100) : 0,
  }
})

const periodLabel = computed(() =>
  form.value?.periodStartDay === 16 ? 'del 16 del mes anterior al 15 del mes (ej.: agosto = 16 jul – 15 ago)' : 'del 1 al último día del mes',
)

// Excepciones: operador con botones (sin select nativo).
function addException() {
  if (!form.value) return
  const used = new Set(form.value.exceptions.map((e) => e.operator))
  const op = operators.value.find((o) => !used.has(o._id))
  if (!op) return toast.error('Todos los operadores ya tienen excepción')
  form.value.exceptions.push({ operator: op._id, name: op.name, tiers: JSON.parse(JSON.stringify(form.value.tiers)), note: '' })
}
const opChoices = computed(() => operators.value.map((o) => ({ value: o._id, label: o.name, color: o.color })))

async function save() {
  if (!form.value) return
  if (!form.value.tiers.length) return toast.error('Deja al menos un tramo')
  saving.value = true
  try {
    const f = form.value
    const r = await operationService.saveCommissionRule({
      dailyBase: f.dailyBase,
      tiers: f.tiers,
      supervisorPercent: f.supervisorPercent,
      supervisorMode: f.supervisorMode,
      supervisorFixed: f.supervisorFixed,
      periodStartDay: f.periodStartDay,
      productionBasis: f.productionBasis,
      exceptions: f.exceptions.map((e) => ({ operator: e.operator, tiers: e.tiers, note: e.note })),
    })
    saved.value = r
    form.value = normalize(r)
    toast.success('Parámetros guardados. La calculadora ya usa los nuevos valores.')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="!form" class="skeleton" style="height: 420px"></div>
  <div v-else class="how">
    <!-- 1. Qué es -->
    <section class="card how__intro">
      <h2><AppIcon name="info" :size="20" /> ¿Cómo sale la comisión?</h2>
      <p>
        Hay dos cosas en esta sección: la hoja <b>Comisiones</b> (lo que se paga y entra al estado de resultados) y la
        <b>calculadora FEE</b>, que propone el valor según la producción de cada operador. Si el valor calculado te sirve, en la pestaña
        <b>FEE</b> tocas <b>"Usar este valor"</b> y pasa a la hoja de Comisiones.
      </p>
    </section>

    <!-- 2. Paso a paso -->
    <section class="card how__steps">
      <h2>Paso a paso, con los valores de hoy</h2>
      <ol>
        <li>
          <span class="how__n">1</span>
          <div>
            <b>Producción del día de cada operador</b>
            <p>Se suma {{ form.productionBasis === 'subtotal' ? 'el precio de lista (sin descuentos)' : 'lo cobrado (con descuentos, sin propina)' }} de sus servicios de ese día. Si fueron dos operadores en un servicio, se reparte a la mitad.</p>
          </div>
        </li>
        <li>
          <span class="how__n">2</span>
          <div>
            <b>Excedente = producción del día − base diaria ({{ money(form.dailyBase) }})</b>
            <p>Si ese día no pasa de {{ money(form.dailyBase) }}, ese día no genera comisión.</p>
          </div>
        </li>
        <li>
          <span class="how__n">3</span>
          <div>
            <b>Comisión del día = excedente × % del tramo</b>
            <ul class="how__tiers">
              <li v-for="t in describeTiers(form.tiers)" :key="t">{{ t }}</li>
            </ul>
          </div>
        </li>
        <li>
          <span class="how__n">4</span>
          <div>
            <b>Comisión del mes = suma de todos los días del período</b>
            <p>El período va {{ periodLabel }}. Se muestra por quincena.</p>
          </div>
        </li>
        <li>
          <span class="how__n">5</span>
          <div>
            <b>Supervisor</b>
            <p v-if="form.supervisorMode === 'percent'">Gana el {{ form.supervisorPercent }} % del excedente de cada operador que supervisa.</p>
            <p v-else>Gana un monto fijo de {{ money(form.supervisorFixed) }} por período.</p>
          </div>
        </li>
      </ol>
      <p v-if="form.exceptions.length" class="how__exc">
        <AppIcon name="user" :size="16" /> Con acuerdo propio:
        <span v-for="e in form.exceptions" :key="e.operator">{{ e.name || 'Operador' }} ({{ describeTiers(e.tiers).join(' · ') }})</span>
      </p>
    </section>

    <!-- 3. Simulador -->
    <section class="card how__sim">
      <h2><AppIcon name="chart" :size="20" /> Pruébalo con un día</h2>
      <MoneyField v-model="testProduction" label="Si un operador produce en el día…" />
      <div v-if="sim" class="how__result">
        <div><small>Excedente</small><strong :class="{ neg: sim.excess <= 0 }">{{ money(Math.max(0, sim.excess)) }}</strong></div>
        <div><small>Tramo</small><strong>{{ sim.percent }} %</strong></div>
        <div class="is-main"><small>Comisión del operador</small><strong>{{ money(sim.fee) }}</strong></div>
        <div v-if="form.supervisorMode === 'percent'"><small>Supervisor</small><strong>{{ money(sim.supervisor) }}</strong></div>
      </div>
      <p v-if="sim && sim.excess <= 0" class="how__note">No pasa la base diaria de {{ money(form.dailyBase) }}: ese día no hay comisión.</p>
      <p v-else-if="sim" class="how__note">{{ money(testProduction) }} − {{ money(form.dailyBase) }} = {{ money(sim.excess) }} × {{ sim.percent }} % = <b>{{ money(sim.fee) }}</b></p>
    </section>

    <!-- 4. Parámetros -->
    <section class="card how__params">
      <div class="how__params-head">
        <h2><AppIcon name="settings" :size="20" /> Parámetros</h2>
        <span v-if="!canEdit" class="how__ro">Solo gerencia puede cambiarlos</span>
      </div>
      <fieldset :disabled="!canEdit" class="how__fields">
        <div class="field">
          <span class="field__label">Período de la comisión</span>
          <ChoiceChips
            :model-value="String(form.periodStartDay)"
            :options="[
              { value: '1', label: 'Mes calendario (1 al 30/31)' },
              { value: '16', label: 'Del 16 al 15 (reporte quincenal)' },
            ]"
            label="Período"
            @update:model-value="form.periodStartDay = Number($event) as 1 | 16"
          />
        </div>
        <div class="field">
          <span class="field__label">La producción se mide sobre</span>
          <ChoiceChips
            :model-value="form.productionBasis"
            :options="[
              { value: 'total', label: 'Lo cobrado (con descuento)' },
              { value: 'subtotal', label: 'Precio de lista (sin descuento)' },
            ]"
            label="Base de la producción"
            @update:model-value="form.productionBasis = $event as 'total' | 'subtotal'"
          />
        </div>
        <MoneyField v-model="form.dailyBase" label="Base diaria (lo que debe producir antes de ganar comisión)" />
        <div class="field">
          <span class="field__label">Tramos: si el excedente pasa de… se paga…</span>
          <TierRows v-model="form.tiers" />
        </div>
        <div class="field">
          <span class="field__label">Supervisor</span>
          <ChoiceChips
            :model-value="form.supervisorMode"
            :options="[
              { value: 'percent', label: '% del excedente de cada operador' },
              { value: 'fixed', label: 'Monto fijo por período' },
            ]"
            label="Cómo gana el supervisor"
            @update:model-value="form.supervisorMode = $event as 'percent' | 'fixed'"
          />
        </div>
        <label v-if="form.supervisorMode === 'percent'" class="field how__pct">
          <span class="field__label">% del excedente para el supervisor</span>
          <span class="how__pct-input"><input v-model.number="form.supervisorPercent" type="text" inputmode="decimal" /> %</span>
        </label>
        <MoneyField v-else v-model="form.supervisorFixed" label="Monto fijo del supervisor por período" />

        <div class="field">
          <span class="field__label">Acuerdos propios por operador</span>
          <p class="how__hint">Para quien tiene otro acuerdo (ej.: un % fijo: deja un solo tramo).</p>
          <div v-for="(e, i) in form.exceptions" :key="i" class="how__excrow">
            <ChoiceChips :model-value="e.operator" :options="opChoices" label="Operador" small @update:model-value="e.operator = String($event); e.name = operators.find((o) => o._id === e.operator)?.name" />
            <TierRows v-model="e.tiers" />
            <label class="field"><span class="field__label">Motivo</span><input v-model="e.note" type="text" placeholder="Ej.: acuerdo de 34 % fijo" /></label>
            <button type="button" class="btn btn--ghost btn--sm" @click="form.exceptions.splice(i, 1)"><AppIcon name="trash" :size="16" /> Quitar acuerdo</button>
          </div>
          <button v-if="canEdit" type="button" class="btn btn--ghost btn--sm how__add" @click="addException"><AppIcon name="plus" :size="16" /> Agregar acuerdo propio</button>
        </div>
      </fieldset>
      <div v-if="canEdit" class="how__save">
        <p class="how__hint">Al guardar, la calculadora FEE se recalcula con estos valores. Las comisiones ya escritas en la hoja no cambian.</p>
        <button type="button" class="btn btn--ghost" :disabled="!dirty || saving" @click="saved && (form = normalize(saved))">Deshacer</button>
        <button type="button" class="btn btn--primary" :disabled="!dirty || saving" @click="save"><AppIcon name="check" /> {{ saving ? 'Guardando…' : 'Guardar parámetros' }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.how {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 860px;
  margin-top: 1rem;

  h2 {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: $text-lg;
    color: $navy;
    margin-bottom: 0.6rem;
  }

  &__intro p {
    color: $ink-soft;
    line-height: 1.6;
  }

  &__steps ol {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;

    > li {
      display: flex;
      gap: 0.75rem;
    }

    p {
      font-size: $text-sm;
      color: $ink-soft;
      margin-top: 0.15rem;
    }
  }

  &__n {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: $navy;
    color: #fff;
    font-weight: 800;
    font-size: $text-sm;
  }

  &__tiers {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.4rem;

    li {
      padding: 0.25rem 0.65rem;
      border-radius: $radius-pill;
      background: $navy-soft;
      color: $navy;
      font-size: $text-xs;
      font-weight: 700;
    }
  }

  &__exc {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.8rem;
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__sim {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__result {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;

    @include from('md') {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    div {
      display: flex;
      flex-direction: column;
      padding: 0.7rem 0.85rem;
      border-radius: $radius-md;
      background: $sky;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }

    strong {
      font-size: $text-lg;
      color: $navy;

      &.neg {
        color: $ink-muted;
      }
    }

    .is-main {
      background: $success-bg;

      strong {
        color: $success;
      }
    }
  }

  &__note {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__params-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__ro {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
  }

  &__fields {
    border: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &:disabled {
      opacity: 0.85;
    }
  }

  &__pct-input {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    max-width: 160px;
    font-weight: 700;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__excrow {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.8rem;
    margin-top: 0.5rem;
    border-radius: $radius-md;
    background: $sky;

    .btn {
      align-self: flex-start;
    }
  }

  &__add {
    align-self: flex-start;
    margin-top: 0.4rem;
  }

  &__save {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $line;

    p {
      flex: 1 1 260px;
    }
  }
}
</style>
