<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useClickOutside } from '@/composables/useClickOutside'
import { addDays, todayISO, weekStart } from '@/utils/format'

/** Fecha con el calendario de Nemo (sin el selector nativo del navegador). Valor "YYYY-MM-DD". */
const props = defineProps<{ label?: string; min?: string; max?: string }>()
const model = defineModel<string>({ required: true })

const open = ref(false)
const root = ref<HTMLElement | null>(null)
useClickOutside(root, open)

const view = ref(model.value.slice(0, 7))
watch(open, (o) => o && (view.value = model.value.slice(0, 7)))

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const today = todayISO()
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-EC', { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)).replace(/\./g, '')

const display = computed(() => fmt(model.value, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }))
const monthTitle = computed(() => fmt(`${view.value}-01`, { month: 'long', year: 'numeric' }))
const cells = computed(() => {
  const from = weekStart(`${view.value}-01`)
  return Array.from({ length: 42 }, (_, i) => {
    const iso = addDays(from, i)
    const disabled = (props.min && iso < props.min) || (props.max && iso > props.max)
    return { iso, num: Number(iso.slice(8)), inMonth: iso.slice(0, 7) === view.value, disabled: Boolean(disabled) }
  })
})

function shift(dir: 1 | -1) {
  const y = Number(view.value.slice(0, 4))
  const m = Number(view.value.slice(5, 7))
  view.value = new Date(Date.UTC(y, m - 1 + dir, 1)).toISOString().slice(0, 7)
}

function pick(iso: string) {
  model.value = iso
  open.value = false
}
</script>

<template>
  <div ref="root" class="dp">
    <button type="button" class="dp__trigger" :class="{ 'is-open': open }" :aria-expanded="open" :aria-label="label || 'Elegir fecha'" @click="open = !open">
      <AppIcon name="calendar" :size="18" />
      <span class="dp__value">{{ display }}</span>
      <AppIcon name="chevron-down" :size="16" class="dp__caret" />
    </button>

    <Transition name="fade-up">
      <div v-if="open" class="dp__panel" role="dialog" aria-label="Calendario">
        <header class="dp__head">
          <button type="button" class="dp__nav" aria-label="Mes anterior" @click="shift(-1)"><AppIcon name="chevron-left" :size="18" /></button>
          <strong class="dp__title">{{ monthTitle }}</strong>
          <button type="button" class="dp__nav" aria-label="Mes siguiente" @click="shift(1)"><AppIcon name="chevron-right" :size="18" /></button>
        </header>
        <div class="dp__grid" role="grid">
          <span v-for="(w, i) in WEEKDAYS" :key="i" class="dp__wd">{{ w }}</span>
          <button
            v-for="c in cells"
            :key="c.iso"
            type="button"
            class="dp__day"
            :class="{ 'is-out': !c.inMonth, 'is-today': c.iso === today, 'is-on': c.iso === model }"
            :disabled="c.disabled"
            :aria-pressed="c.iso === model"
            :aria-label="fmt(c.iso, { weekday: 'long', day: 'numeric', month: 'long' })"
            @click="pick(c.iso)"
          >
            {{ c.num }}
          </button>
        </div>
        <footer class="dp__foot">
          <button type="button" class="dp__link" @click="pick(today)">Hoy</button>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.dp {
  position: relative;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    min-height: $tap-lg;
    padding: 0 0.9rem;
    border-radius: $radius-md;
    border: 1.5px solid $line-strong;
    background: $surface;
    color: $navy;
    font-weight: 700;
    text-align: left;
    transition: border-color $dur-fast ease;

    &:hover,
    &.is-open {
      border-color: $navy;
    }
  }

  &__value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &::first-letter {
      text-transform: uppercase;
    }
  }

  &__caret {
    color: $ink-muted;
  }

  &__panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 30;
    width: min(320px, calc(100vw - 2rem));
    padding: 0.75rem;
    border-radius: $radius-md;
    border: 1px solid $line;
    background: $surface;
    box-shadow: $shadow-lg;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  &__title {
    color: $navy;
    text-transform: capitalize;
  }

  &__nav {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: $navy;

    &:hover {
      background: $navy-soft;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  &__wd {
    padding: 0.25rem 0;
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
    text-align: center;
  }

  &__day {
    aspect-ratio: 1;
    border-radius: 50%;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;
    font-variant-numeric: tabular-nums;

    &:hover:not(:disabled) {
      background: $navy-soft;
    }

    &.is-out {
      color: $ink-muted;
      font-weight: 400;
    }

    &.is-today {
      box-shadow: inset 0 0 0 1.5px $orange;
    }

    &.is-on {
      background: $navy;
      color: #fff;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  &__foot {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.4rem;
  }

  &__link {
    min-height: 36px;
    padding: 0 0.6rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
    border-radius: $radius-sm;

    &:hover {
      background: $navy-soft;
    }
  }
}
</style>
