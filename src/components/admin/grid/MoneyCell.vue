<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { editMoney, money, parseMoney } from '@/utils/format'
import type { CellStatus } from '@/types/grid'

/**
 * Celda de dinero tipo hoja de cálculo: se escribe en dólares y se guarda sola al salir
 * (blur, Enter o Tab). Enter baja a la celda de abajo (Shift+Enter sube), Escape deshace.
 * Fuera de foco muestra $1,234.56; vacía = sin valor (null), distinto de $0.00.
 * Para moverse entre celdas, el contenedor lleva `data-grid` y cada celda `row`/`col`.
 */
const props = defineProps<{
  modelValue: number | null
  label: string
  row: number
  col: number
  status?: CellStatus
  disabled?: boolean
  placeholder?: string
  /** En la tabla de escritorio el aviso "Guardado" queda solo como ícono. */
  compact?: boolean
}>()
const emit = defineEmits<{ commit: [value: number | null] }>()

const focused = ref(false)
const text = ref('')
const shown = computed(() => (focused.value ? text.value : props.modelValue === null ? '' : money(props.modelValue)))

function onFocus(e: FocusEvent) {
  focused.value = true
  text.value = editMoney(props.modelValue)
  // Seleccionar todo: escribir encima reemplaza, como en Excel.
  requestAnimationFrame(() => (e.target as HTMLInputElement | null)?.select())
}

function commit() {
  if (!focused.value) return
  focused.value = false
  const v = parseMoney(text.value)
  if (Number.isNaN(v)) return // texto inválido: se descarta y vuelve el valor anterior
  if (v !== props.modelValue) emit('commit', v)
}

function move(el: HTMLInputElement, dRow: number) {
  const grid = el.closest('[data-grid]')
  const next = grid?.querySelector<HTMLInputElement>(`input[data-row="${props.row + dRow}"][data-col="${props.col}"]`)
  if (next) next.focus()
  else el.blur()
}

function onKey(e: KeyboardEvent) {
  const el = e.target as HTMLInputElement
  if (e.key === 'Enter') {
    e.preventDefault()
    commit()
    move(el, e.shiftKey ? -1 : 1)
  } else if (e.key === 'Escape') {
    text.value = editMoney(props.modelValue)
    focused.value = false
    el.blur()
  }
}
</script>

<template>
  <span class="mcell" :class="[status ? `is-${status}` : '', { 'is-compact': compact }]">
    <input
      :value="shown"
      type="text"
      inputmode="decimal"
      enterkeyhint="next"
      autocomplete="off"
      :aria-label="label"
      :placeholder="placeholder ?? '—'"
      :disabled="disabled"
      :data-row="row"
      :data-col="col"
      @focus="onFocus"
      @input="text = ($event.target as HTMLInputElement).value"
      @blur="commit"
      @keydown="onKey"
    />
    <Transition name="fade">
      <span v-if="status === 'saved'" class="mcell__st" role="status"><AppIcon name="check" :size="12" /><span>Guardado</span></span>
      <span v-else-if="status === 'error'" class="mcell__st mcell__st--err" role="alert"><AppIcon name="alert" :size="12" /><span>No se guardó</span></span>
    </Transition>
  </span>
</template>

<style scoped lang="scss">
.mcell {
  position: relative;
  display: block;

  input {
    width: 100%;
    min-width: 6.5rem;
    min-height: 40px;
    padding: 0.4rem 0.55rem;
    border: 1px solid $line;
    border-radius: $radius-sm;
    // Celdas para escribir en celeste suave, como las "celdas azules" del Excel.
    background: rgba($sky-blue, 0.08);
    font: inherit;
    font-variant-numeric: tabular-nums;
    text-align: right;
    color: $ink;
    transition: border-color $dur-fast ease, background-color $dur-fast ease;

    &::placeholder {
      color: $ink-muted;
      opacity: 0.6;
    }

    &:focus {
      outline: none;
      border-color: $navy;
      background: $surface;
      box-shadow: 0 0 0 2px rgba($sky-blue, 0.45);
    }

    &:disabled {
      background: transparent;
      border-color: transparent;
      color: $ink-soft;
    }
  }

  &.is-saving input {
    border-color: rgba($sky-blue, 0.9);
  }

  &.is-error input {
    border-color: $danger;
  }

  &__st {
    position: absolute;
    right: 0.2rem;
    bottom: -1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    font-size: 0.66rem;
    font-weight: 700;
    color: $success;
    pointer-events: none;

    &--err {
      color: $danger;
    }
  }

  &.is-compact input {
    min-width: 5.6rem;
    padding: 0.35rem 0.45rem;
  }

  &.is-compact .mcell__st {
    left: 0.3rem;
    top: 0.2rem;
    bottom: auto;

    > span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
  }
}
</style>
