<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MoneyField from '@/components/admin/finance/MoneyField.vue'
import ChoiceChips from '@/components/admin/operation/ChoiceChips.vue'
import { operationService } from '@/services/operation.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { errorMessage, money } from '@/utils/format'
import type { BranchPercent } from '@/types/operation'

/**
 * "¿Cómo se calcula?": comisión por meta mensual explicada paso a paso, un simulador y los
 * parámetros (% por sucursal y sobre qué se mide la producción), editables por gerencia.
 */
const emit = defineEmits<{ saved: [] }>()
const toast = useToastStore()
const me = useUserStore()
const canEdit = computed(() => me.isAdmin)

const percents = ref<BranchPercent[]>([])
const basis = ref<'total' | 'subtotal'>('total')
const original = ref('')
const saving = ref(false)
const loaded = ref(false)

const snapshot = () => JSON.stringify({ p: percents.value.map((x) => [x.branch, x.percent]), b: basis.value })
const dirty = computed(() => loaded.value && snapshot() !== original.value)

async function load() {
  try {
    const r = await operationService.commissionRule()
    percents.value = (r.branchPercents || []).map((x) => ({ ...x }))
    basis.value = r.productionBasis || 'total'
    original.value = snapshot()
    loaded.value = true
  } catch (e) {
    toast.error(errorMessage(e))
  }
}
load()

function setPercent(p: BranchPercent, raw: string) {
  const n = Number(raw.replace(',', '.'))
  p.percent = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

async function save() {
  saving.value = true
  try {
    await operationService.saveCommissionRule({ branchPercents: percents.value, productionBasis: basis.value })
    original.value = snapshot()
    toast.success('Porcentajes guardados. El cálculo ya usa los nuevos valores.')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}

// --- Simulador ---
const simGoal = ref(150000)
const simProd = ref(180000)
const simBranch = ref('')
const simPct = computed(() => percents.value.find((p) => p.branch === simBranch.value)?.percent ?? percents.value[0]?.percent ?? 0)
const simExcess = computed(() => Math.max(0, simProd.value - simGoal.value))
const simCommission = computed(() => Math.round((simExcess.value * simPct.value) / 100))
const branchChoices = computed(() => percents.value.map((p) => ({ value: p.branch, label: `${p.name} (${p.percent} %)` })))
</script>

<template>
  <div v-if="!loaded" class="skeleton" style="height: 420px; margin-top: 1rem"></div>
  <div v-else class="how">
    <!-- Regla en una línea -->
    <section class="card how__hero">
      <h2><AppIcon name="info" :size="20" /> ¿Cómo sale la comisión?</h2>
      <p class="how__big">Cada operador tiene una <b>meta mensual</b>. Por <b>cada dólar que produce sobre su meta</b>, gana un porcentaje según la sucursal:</p>
      <div class="how__pcts">
        <div v-for="p in percents" :key="p.branch" class="how__pctcard">
          <strong>{{ p.percent }} %</strong>
          <span>{{ p.name }}</span>
        </div>
      </div>
    </section>

    <!-- Paso a paso -->
    <section class="card how__steps">
      <h2>Paso a paso</h2>
      <ol>
        <li>
          <span class="how__n">1</span>
          <div>
            <b>Se pone la meta del mes de cada operador</b>
            <p>En <RouterLink to="/admin/metas" class="link">Metas mensuales</RouterLink>. Sin meta, no se calcula su comisión.</p>
          </div>
        </li>
        <li>
          <span class="how__n">2</span>
          <div>
            <b>Se suma su producción del mes</b>
            <p>{{ basis === 'subtotal' ? 'El precio de lista (sin descuentos)' : 'Lo cobrado (con descuentos, sin propina)' }} de todos sus servicios del mes. Si fueron dos operadores en un servicio, se reparte a la mitad.</p>
          </div>
        </li>
        <li>
          <span class="how__n">3</span>
          <div>
            <b>Lo que pasa de la meta = producción − meta</b>
            <p>Si no llega a la meta, la comisión es $0.</p>
          </div>
        </li>
        <li>
          <span class="how__n">4</span>
          <div>
            <b>Comisión = lo que pasa de la meta × % de la sucursal</b>
            <p>Si trabajó en las dos sucursales, lo que pasa de la meta se reparte según lo que produjo en cada una, y a cada parte se le aplica su %.</p>
          </div>
        </li>
        <li>
          <span class="how__n">5</span>
          <div>
            <b>Se pasa a la hoja de Comisiones</b>
            <p>En "Cálculo por meta", el botón <b>Pasar a Comisiones</b> lo escribe en la hoja, que es la que usa el estado de resultados.</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- Simulador -->
    <section class="card how__sim">
      <h2><AppIcon name="chart" :size="20" /> Pruébalo</h2>
      <div class="how__simgrid">
        <MoneyField v-model="simGoal" label="Meta del mes" />
        <MoneyField v-model="simProd" label="Producción del mes" />
      </div>
      <div class="field">
        <span class="field__label">Sucursal</span>
        <ChoiceChips :model-value="simBranch || percents[0]?.branch || ''" :options="branchChoices" label="Sucursal" @update:model-value="simBranch = String($event)" />
      </div>
      <div class="how__result">
        <div><small>Pasó la meta por</small><strong>{{ money(simExcess) }}</strong></div>
        <div><small>Porcentaje</small><strong>{{ simPct }} %</strong></div>
        <div class="is-main"><small>Comisión</small><strong>{{ money(simCommission) }}</strong></div>
      </div>
      <p class="how__note">
        <template v-if="simExcess > 0">({{ money(simProd) }} − {{ money(simGoal) }}) × {{ simPct }} % = <b>{{ money(simCommission) }}</b></template>
        <template v-else>No llegó a la meta: le faltan {{ money(simGoal - simProd) }}. Comisión $0.</template>
      </p>
    </section>

    <!-- Parámetros -->
    <section class="card how__params">
      <div class="how__params-head">
        <h2><AppIcon name="settings" :size="20" /> Parámetros</h2>
        <span v-if="!canEdit" class="how__ro">Solo gerencia puede cambiarlos</span>
      </div>
      <div class="field">
        <span class="field__label">% por cada dólar sobre la meta</span>
        <div class="how__edit">
          <label v-for="p in percents" :key="p.branch" class="how__editrow">
            <span>{{ p.name }}</span>
            <span class="how__pctinput">
              <input :value="p.percent" type="text" inputmode="decimal" :disabled="!canEdit" :aria-label="`Porcentaje de ${p.name}`" @input="setPercent(p, ($event.target as HTMLInputElement).value)" />
              <b>%</b>
            </span>
          </label>
        </div>
      </div>
      <div class="field">
        <span class="field__label">La producción se mide sobre</span>
        <ChoiceChips
          :model-value="basis"
          :options="[
            { value: 'total', label: 'Lo cobrado (con descuento)' },
            { value: 'subtotal', label: 'Precio de lista (sin descuento)' },
          ]"
          label="Base de la producción"
          @update:model-value="canEdit && (basis = $event as 'total' | 'subtotal')"
        />
      </div>
      <p class="how__hint">Las metas de cada operador se cambian en <RouterLink to="/admin/metas" class="link">Metas mensuales</RouterLink>.</p>
      <div v-if="canEdit" class="how__save">
        <button type="button" class="btn btn--ghost" :disabled="!dirty || saving" @click="load">Deshacer</button>
        <button type="button" class="btn btn--primary" :disabled="!dirty || saving" @click="save"><AppIcon name="check" /> {{ saving ? 'Guardando…' : 'Guardar' }}</button>
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

  &__big {
    font-size: $text-base;
    line-height: 1.6;
  }

  &__pcts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.8rem;
  }

  &__pctcard {
    flex: 1 1 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border-radius: $radius-md;
    background: $navy;
    color: #fff;

    strong {
      font-size: 2.2rem;
      line-height: 1;
    }

    span {
      margin-top: 0.3rem;
      font-weight: 700;
      opacity: 0.85;
    }
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

  &__sim {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__simgrid {
    display: grid;
    gap: 0.75rem;

    @include from('md') {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__result {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;

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

  &__params {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__params-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

    h2 {
      margin-bottom: 0;
    }
  }

  &__ro {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
  }

  &__edit {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__editrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.6rem 0.8rem;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    font-weight: 700;
  }

  &__pctinput {
    display: flex;
    align-items: center;
    gap: 0.35rem;

    input {
      width: 80px;
      text-align: right;
      font-size: $text-lg;
      font-weight: 800;
    }
  }

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__save {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid $line;
  }
}
</style>
