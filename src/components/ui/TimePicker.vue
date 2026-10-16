<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { useClickOutside } from '@/composables/useClickOutside'

/** Hora con botones de Nemo (sin el selector nativo): hora + minutos. Valor "HH:MM". */
const props = withDefaults(defineProps<{ label?: string; from?: number; to?: number }>(), { from: 6, to: 20 })
const model = defineModel<string>({ required: true })

const open = ref(false)
const root = ref<HTMLElement | null>(null)
useClickOutside(root, open)

const MINUTES = ['00', '15', '30', '45']
const hours = computed(() => Array.from({ length: props.to - props.from + 1 }, (_, i) => String(props.from + i).padStart(2, '0')))
const hh = computed(() => model.value.slice(0, 2))
const mm = computed(() => model.value.slice(3, 5))

const period = (h: string) => (Number(h) < 12 ? 'mañana' : Number(h) < 18 ? 'tarde' : 'noche')

function setHour(h: string) {
  model.value = `${h}:${MINUTES.includes(mm.value) ? mm.value : '00'}`
}
function setMinute(m: string) {
  model.value = `${hh.value}:${m}`
  open.value = false
}
</script>

<template>
  <div ref="root" class="tp">
    <button type="button" class="tp__trigger" :class="{ 'is-open': open }" :aria-expanded="open" :aria-label="label || 'Elegir hora'" @click="open = !open">
      <AppIcon name="clock" :size="18" />
      <span class="tp__value">{{ model }}</span>
      <small>{{ period(hh) }}</small>
      <AppIcon name="chevron-down" :size="16" class="tp__caret" />
    </button>

    <Transition name="fade-up">
      <div v-if="open" class="tp__panel" role="dialog" aria-label="Elegir hora">
        <span class="tp__label">Hora</span>
        <div class="tp__hours">
          <button v-for="h in hours" :key="h" type="button" class="tp__opt" :class="{ 'is-on': h === hh }" :aria-pressed="h === hh" @click="setHour(h)">{{ h }}</button>
        </div>
        <span class="tp__label">Minutos</span>
        <div class="tp__mins">
          <button v-for="m in MINUTES" :key="m" type="button" class="tp__opt" :class="{ 'is-on': m === mm }" :aria-pressed="m === mm" @click="setMinute(m)">:{{ m }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.tp {
  position: relative;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    min-height: $tap-lg;
    padding: 0 0.9rem;
    border-radius: $radius-md;
    border: 1.5px solid $line-strong;
    background: $surface;
    color: $navy;
    font-weight: 700;
    transition: border-color $dur-fast ease;

    &:hover,
    &.is-open {
      border-color: $navy;
    }

    small {
      font-weight: 500;
      color: $ink-muted;
    }
  }

  &__value {
    font-size: $text-lg;
    font-variant-numeric: tabular-nums;
  }

  &__caret {
    margin-left: auto;
    color: $ink-muted;
  }

  &__panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    width: min(300px, calc(100vw - 2rem));
    padding: 0.75rem;
    border-radius: $radius-md;
    border: 1px solid $line;
    background: $surface;
    box-shadow: $shadow-lg;
  }

  &__label {
    font-size: $text-xs;
    font-weight: 700;
    text-transform: uppercase;
    color: $ink-muted;
  }

  &__hours {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.3rem;
  }

  &__mins {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.3rem;
  }

  &__opt {
    min-height: 40px;
    border-radius: $radius-sm;
    border: 1.5px solid $line;
    font-weight: 700;
    color: $ink;
    font-variant-numeric: tabular-nums;

    &:hover {
      border-color: $navy;
    }

    &.is-on {
      border-color: $navy;
      background: $navy;
      color: #fff;
    }
  }
}
</style>
