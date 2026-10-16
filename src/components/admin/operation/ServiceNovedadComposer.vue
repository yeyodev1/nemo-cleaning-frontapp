<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import { operationService } from '@/services/operation.service'
import { managementService } from '@/services/management.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { errorMessage, todayISO } from '@/utils/format'
import type { ProductionRow } from '@/types/operation'

/**
 * Registrar una novedad de un servicio sin salir de la pantalla: elegir el día y el servicio,
 * qué pasó (atajos), con qué operador y fotos opcionales.
 */
const emit = defineEmits<{ saved: []; cancel: [] }>()
const scope = useAdminScope()
const toast = useToastStore()

const date = ref(todayISO())
const query = ref('')
const rows = ref<ProductionRow[]>([])
const loadingRows = ref(false)
const picked = ref<ProductionRow | null>(null)
const operator = ref('')
const text = ref('')
const photos = ref<string[]>([])
const uploading = ref(0)
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const QUICK = ['Queja del cliente', 'Trabajo incompleto', 'Daño en el lugar o vehículo', 'Llegó tarde al servicio', 'Cliente no estaba', 'Objetos en el carro']

async function loadRows() {
  loadingRows.value = true
  picked.value = null
  try {
    rows.value = (await operationService.production({ from: date.value, to: date.value, branch: scope.query, limit: 100 })).items
  } catch (e) {
    rows.value = []
    toast.error(errorMessage(e))
  } finally {
    loadingRows.value = false
  }
}
watch(date, loadRows, { immediate: true })

const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const visible = computed(() => {
  const q = norm(query.value.trim())
  const list = [...rows.value].sort((a, b) => a.time.localeCompare(b.time))
  return q ? list.filter((r) => norm(`${r.customer?.name || ''} ${r.code} ${r.zone}`).includes(q)) : list
})

function pick(r: ProductionRow) {
  picked.value = r
  operator.value = r.operators.length === 1 ? r.operators[0]!._id : ''
}

function quick(label: string) {
  text.value = text.value.trim() ? `${label}: ${text.value.replace(/^[^:]+:\s*/, '')}` : `${label}: `
}

function onPick(e: Event) {
  const files = [...((e.target as HTMLInputElement).files || [])].slice(0, 8 - photos.value.length)
  ;(e.target as HTMLInputElement).value = ''
  for (const f of files) {
    uploading.value++
    managementService
      .uploadFile(f)
      .then((r) => photos.value.push(r.url))
      .catch((err) => toast.error(errorMessage(err, 'No se pudo subir una foto')))
      .finally(() => uploading.value--)
  }
}

async function save() {
  if (!picked.value) return toast.error('Elige el servicio')
  const body = text.value.trim().replace(/:\s*$/, '')
  if (!body && !photos.value.length) return toast.error('Escribe qué pasó o agrega una foto')
  saving.value = true
  try {
    await operationService.addNovedad(picked.value._id, { text: body, operator: operator.value || undefined, photos: photos.value })
    toast.success('Novedad registrada')
    emit('saved')
  } catch (e) {
    toast.error(errorMessage(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="snc" novalidate @submit.prevent="save">
    <!-- 1. Servicio -->
    <div class="snc__step">
      <span class="snc__n">1</span>
      <div class="snc__body">
        <h3>¿De qué servicio?</h3>
        <div class="snc__row">
          <DatePicker v-model="date" :max="todayISO()" label="Día del servicio" />
          <div class="snc__search">
            <AppIcon name="search" :size="18" class="snc__search-icon" />
            <input v-model="query" type="search" placeholder="Cliente, código o zona" autocomplete="off" aria-label="Buscar servicio" />
          </div>
        </div>
        <div v-if="loadingRows" class="snc__list"><span v-for="n in 3" :key="n" class="skeleton" style="height: 56px"></span></div>
        <p v-else-if="!visible.length" class="snc__empty">No hay servicios {{ query ? 'con esa búsqueda' : 'ese día' }}. Cambia la fecha.</p>
        <div v-else class="snc__list" role="radiogroup" aria-label="Servicio">
          <button
            v-for="r in visible"
            :key="r._id"
            type="button"
            class="snc__svc"
            :class="{ 'is-on': picked?._id === r._id }"
            role="radio"
            :aria-checked="picked?._id === r._id"
            @click="pick(r)"
          >
            <strong class="snc__time">{{ r.time }}</strong>
            <span class="snc__svc-main">
              <b>{{ r.customer?.name || 'Cliente' }}</b>
              <small>{{ r.items.map((i) => i.name).join(', ') }}{{ r.zone ? ` · ${r.zone}` : '' }}</small>
            </span>
            <span class="snc__ops">
              <span v-for="o in r.operators" :key="o._id" class="snc__dot" :style="{ background: o.color || '#1E2D3A' }" :title="o.name"></span>
            </span>
            <AppIcon v-if="picked?._id === r._id" name="check-circle" :size="20" class="snc__check" />
          </button>
        </div>
      </div>
    </div>

    <template v-if="picked">
      <!-- 2. Qué pasó -->
      <div class="snc__step">
        <span class="snc__n">2</span>
        <div class="snc__body">
          <h3>¿Qué pasó?</h3>
          <div class="snc__quick">
            <button v-for="qk in QUICK" :key="qk" type="button" class="snc__qk" @click="quick(qk)">{{ qk }}</button>
          </div>
          <textarea v-model="text" rows="3" placeholder="Cuenta qué pasó. Ej.: el cliente se quejó porque quedaron manchas en el asiento trasero" aria-label="Qué pasó"></textarea>
        </div>
      </div>

      <!-- 3. Operador -->
      <div v-if="picked.operators.length" class="snc__step">
        <span class="snc__n">3</span>
        <div class="snc__body">
          <h3>¿Con qué operador?</h3>
          <div class="snc__opchips" role="radiogroup" aria-label="Operador">
            <button
              v-for="o in picked.operators"
              :key="o._id"
              type="button"
              class="snc__opchip"
              :class="{ 'is-on': operator === o._id }"
              role="radio"
              :aria-checked="operator === o._id"
              @click="operator = operator === o._id ? '' : o._id"
            >
              <span class="snc__dot" :style="{ background: o.color || '#1E2D3A' }"></span>{{ o.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Fotos -->
      <div class="snc__step">
        <span class="snc__n">{{ picked.operators.length ? 4 : 3 }}</span>
        <div class="snc__body">
          <h3>Fotos <small>(opcional)</small></h3>
          <div class="snc__photos">
            <div v-for="(p, i) in photos" :key="p" class="snc__thumb">
              <img :src="p" alt="Foto de la novedad" />
              <button type="button" class="snc__remove" aria-label="Quitar foto" @click="photos.splice(i, 1)"><AppIcon name="x" :size="14" /></button>
            </div>
            <span v-for="n in uploading" :key="`u${n}`" class="snc__thumb skeleton"></span>
            <button v-if="photos.length + uploading < 8" type="button" class="snc__add" @click="fileInput?.click()">
              <AppIcon name="camera" :size="22" /><span>Agregar foto</span>
            </button>
            <input ref="fileInput" type="file" accept="image/*" multiple class="sr-only" @change="onPick" />
          </div>
        </div>
      </div>
    </template>

    <div class="snc__actions">
      <button type="button" class="btn btn--ghost" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="btn btn--primary" :disabled="saving || uploading > 0 || !picked">
        <AppIcon name="check" /> {{ uploading ? 'Subiendo fotos…' : saving ? 'Guardando…' : 'Guardar novedad' }}
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.snc {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  &__step {
    display: flex;
    gap: 0.75rem;
  }

  &__n {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: $navy;
    color: #fff;
    font-size: $text-sm;
    font-weight: 800;
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;

    h3 {
      font-size: $text-base;
      color: $navy;

      small {
        font-weight: 500;
        color: $ink-muted;
      }
    }
  }

  &__row {
    display: grid;
    gap: 0.5rem;

    @include from('md') {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__search {
    position: relative;
    display: flex;

    input {
      flex: 1;
      min-height: $tap-lg;
      padding-left: 2.4rem;
    }
  }

  &__search-icon {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: $ink-muted;
    pointer-events: none;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    max-height: 300px;
    overflow-y: auto;
    padding: 0.1rem;
  }

  &__svc {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 56px;
    padding: 0.5rem 0.75rem;
    border-radius: $radius-md;
    border: 1.5px solid $line;
    background: $surface;
    text-align: left;

    &:hover {
      border-color: $navy;
    }

    &.is-on {
      border-color: $navy;
      background: $navy-soft;
    }
  }

  &__time {
    color: $navy;
    font-variant-numeric: tabular-nums;
  }

  &__svc-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    small {
      font-size: $text-xs;
      color: $ink-muted;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__ops {
    display: flex;
    gap: 3px;
  }

  &__dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &__check {
    color: $success;
  }

  &__empty {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__quick {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__qk {
    min-height: 36px;
    padding: 0 0.8rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink-soft;

    &:hover {
      border-color: $navy;
      color: $navy;
    }
  }

  &__opchips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__opchip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 0 0.9rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: $text-sm;

    &.is-on {
      border-color: $navy;
      background: $navy-soft;
      color: $navy;
    }
  }

  &__photos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    gap: 0.5rem;
  }

  &__thumb {
    position: relative;
    aspect-ratio: 1;
    border-radius: $radius-sm;
    overflow: hidden;
    background: $line;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__remove {
    position: absolute;
    top: 4px;
    right: 4px;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgb(0 0 0 / 0.6);
    color: #fff;
  }

  &__add {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    aspect-ratio: 1;
    border-radius: $radius-sm;
    border: 2px dashed $line-strong;
    background: $surface;
    color: $navy;
    font-size: $text-xs;
    font-weight: 700;

    &:hover {
      border-color: $navy;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>
