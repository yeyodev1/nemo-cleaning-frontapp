<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import BeforeAfterSlider from './BeforeAfterSlider.vue'
import { beforeAfter } from '@/config/landing'
import type { IconName } from '@/components/ui/icons'

/** Comparativas reales con pestañas: un solo comparador grande que cambia de foto. */
const icons: Record<string, IconName> = { sofa: 'sofa', alfombra: 'rug', colchon: 'bed', auto: 'car' }
const active = ref(beforeAfter[0]?.id ?? '')
const current = computed(() => beforeAfter.find((p) => p.id === active.value) ?? beforeAfter[0]!)
const tabs = ref<HTMLButtonElement[]>([])

// Patrón de pestañas WAI-ARIA: flechas mueven el foco y activan; Inicio/Fin a los extremos.
function onKey(e: KeyboardEvent, i: number) {
  const n = beforeAfter.length
  const map: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 }
  const next = map[e.key]
  if (next === undefined) return
  e.preventDefault()
  const k = (next + n) % n
  active.value = beforeAfter[k]!.id
  tabs.value[k]?.focus()
}
</script>

<template>
  <section id="antes-despues" class="ba-sec" aria-labelledby="ba-title">
    <div class="ba-sec__inner">
      <div class="ba-sec__side">
        <SectionHead
          id="ba-title"
          eyebrow="Comparativas del catálogo"
          title="Antes / Después"
          text="Fotos reales de nuestros trabajos. Arrastra la línea para comparar."
        />
        <div class="ba-sec__tabs" role="tablist" aria-label="Elige una comparativa">
          <button
            v-for="(p, i) in beforeAfter"
            :id="`ba-tab-${p.id}`"
            :key="p.id"
            ref="tabs"
            type="button"
            role="tab"
            class="ba-sec__tab"
            :class="{ 'is-active': p.id === active }"
            :aria-selected="p.id === active"
            aria-controls="ba-panel"
            :tabindex="p.id === active ? 0 : -1"
            @click="active = p.id"
            @keydown="onKey($event, i)"
          >
            <AppIcon :name="icons[p.id] ?? 'sparkles'" :size="18" />
            <span>{{ p.title }}</span>
          </button>
        </div>
        <p class="ba-sec__hint"><AppIcon name="arrow-left" :size="14" /><AppIcon name="arrow-right" :size="14" /> Arrastra, o usa las flechas del teclado</p>
      </div>

      <div id="ba-panel" class="ba-sec__stage" role="tabpanel" :aria-labelledby="`ba-tab-${active}`">
        <Transition name="ba-swap" mode="out-in">
          <BeforeAfterSlider
            :key="current.id"
            :before="current.before"
            :after="current.after"
            :title="current.title"
            :ratio="current.ratio"
          />
        </Transition>
      </div>
    </div>
    <!-- Precarga discreta del resto de pares para que cambiar de pestaña sea instantáneo. -->
    <div class="sr-only" aria-hidden="true">
      <template v-for="p in beforeAfter" :key="p.id">
        <img v-if="p.id !== active" :src="p.before" alt="" loading="lazy" width="1" height="1" />
        <img v-if="p.id !== active" :src="p.after" alt="" loading="lazy" width="1" height="1" />
      </template>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ba-sec {
  padding: $space-section 0;
  background:
    radial-gradient(700px 400px at 100% 0%, rgba($sky-blue, 0.16), transparent 60%),
    $sky;

  &__inner {
    @include container(1240px);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @include from('lg') {
      flex-direction: row;
      align-items: center;
      gap: 4rem;
    }
  }

  &__side {
    @include from('lg') {
      flex: 0 0 34%;
    }
  }

  &__tabs {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    margin-inline: -1rem;
    padding: 0.25rem 1rem;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    @include from('lg') {
      flex-direction: column;
      margin: 0;
      padding: 0;
      overflow: visible;
    }
  }

  &__tab {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    min-height: $tap;
    padding: 0.55rem 1.05rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line-strong;
    background: $surface;
    color: $navy;
    font-weight: 600;
    font-size: $text-sm;
    transition: background-color $dur-fast ease, border-color $dur-fast ease, color $dur-fast ease, transform $dur-fast $ease-out;

    svg {
      color: $orange-ink;
    }

    @include from('lg') {
      justify-content: flex-start;
      min-height: 56px;
      padding: 0.75rem 1.25rem;
      border-radius: $radius-md;
      font-size: $text-base;

      &:hover:not(.is-active) {
        transform: translateX(4px);
        border-color: $navy;
      }
    }

    &.is-active {
      background: $navy;
      border-color: $navy;
      color: #fff;

      svg {
        color: $orange;
      }
    }

    &:focus-visible {
      outline: 3px solid $orange;
      outline-offset: 2px;
    }
  }

  &__hint {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    margin-top: 1rem;
    font-size: $text-xs;
    color: $ink-muted;

    svg {
      color: $orange-ink;
    }
  }

  &__stage {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
  }
}

.ba-swap-enter-active,
.ba-swap-leave-active {
  transition:
    opacity 260ms $ease-out,
    transform 320ms $ease-out;
}

.ba-swap-enter-from {
  opacity: 0;
  transform: scale(0.97);
}

.ba-swap-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
