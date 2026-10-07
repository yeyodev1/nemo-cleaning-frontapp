<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import NemoLogo from '@/components/brand/NemoLogo.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCustomerStore } from '@/stores/customer'

defineProps<{ minimal?: boolean }>()
const route = useRoute()
const open = ref(false)
const scrolled = ref(false)
const customer = useCustomerStore()
// "Ingresar" o "Mi cuenta" según la sesión del cliente (no la del personal).
const account = computed(() =>
  customer.isAuthenticated
    ? { to: '/mi-cuenta', label: 'Mi cuenta' }
    : { to: '/ingresar', label: 'Ingresar' },
)

const links = [
  { to: '/#nemo-car', label: 'Nemo Car' },
  { to: '/#nemo-home', label: 'Home & Office' },
  { to: '/#paquetes', label: 'Paquetes' },
  { to: '/cotizar-oficina', label: 'Cotizar oficina' },
  { to: '/#preguntas', label: 'Preguntas' },
]

const onScroll = () => (scrolled.value = window.scrollY > 8)
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) open.value = false
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  customer.restore()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
watch(() => route.fullPath, () => (open.value = false))
// Bloquea el scroll del fondo mientras el menú está abierto.
watch(open, (v) => (document.body.style.overflow = v ? 'hidden' : ''))
</script>

<template>
  <header class="header" :class="{ 'header--scrolled': scrolled || minimal || open }">
    <div class="header__bar">
      <RouterLink to="/" class="header__brand" aria-label="Nemo Cleaning Services, inicio"><NemoLogo variant="dark" :height="52" /></RouterLink>

      <nav v-if="!minimal" class="header__nav" aria-label="Principal">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="header__link">{{ l.label }}</RouterLink>
      </nav>

      <div class="header__actions">
        <RouterLink v-if="!minimal" :to="account.to" class="header__account" :aria-label="account.label">
          <AppIcon name="user" :size="20" /><span class="header__account-label">{{ account.label }}</span>
        </RouterLink>
        <RouterLink v-if="!minimal" to="/reservar" class="btn btn--accent btn--sm header__cta">Reservar</RouterLink>
        <RouterLink v-else to="/" class="btn btn--outline-light btn--sm">
          <AppIcon name="x" :size="16" /> Salir
        </RouterLink>
        <button
          v-if="!minimal"
          type="button"
          class="header__burger"
          :aria-expanded="open"
          aria-controls="menu-movil"
          :aria-label="open ? 'Cerrar menú' : 'Abrir menú'"
          @click="open = !open"
        >
          <Transition name="icon-swap" mode="out-in">
            <AppIcon :key="open ? 'x' : 'menu'" :name="open ? 'x' : 'menu'" :size="22" />
          </Transition>
        </button>
      </div>
    </div>

    <!-- Menú móvil: fondo que se desvanece + panel que se despliega como cortina, con los enlaces en cascada. -->
    <!-- Fuera del header: su backdrop-filter haría que "fixed" se posicione contra él y dejaría un vidrio borroso al cerrar. -->
    <Teleport to="body">
      <Transition name="backdrop" :duration="{ enter: 340, leave: 460 }">
        <div v-if="open" class="menu-backdrop" aria-hidden="true" @click="open = false"></div>
      </Transition>
      <!-- Duración explícita: Vue espera la cascada completa al entrar y la cortina completa al salir. -->
      <Transition name="menu" :duration="{ enter: 760, leave: 460 }">
        <nav v-if="open" id="menu-movil" class="menu" aria-label="Menú móvil">
          <div class="menu__inner">
            <RouterLink v-for="(l, i) in links" :key="l.to" :to="l.to" class="menu__link" :style="{ '--i': i }">
              {{ l.label }} <AppIcon name="chevron-right" :size="18" />
            </RouterLink>
            <RouterLink :to="account.to" class="menu__link" :style="{ '--i': links.length }">
              <span class="menu__label"><AppIcon name="user" :size="20" /> {{ account.label }}</span>
              <AppIcon name="chevron-right" :size="18" />
            </RouterLink>
            <RouterLink to="/reservar" class="btn btn--accent btn--lg btn--block menu__cta" :style="{ '--i': links.length + 1 }">
              Reservar <AppIcon name="arrow-right" />
            </RouterLink>
            <RouterLink to="/admin/login" class="menu__staff" :style="{ '--i': links.length + 2 }">Acceso del personal</RouterLink>
          </div>
        </nav>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped lang="scss">
// ---- Animación del menú móvil ----
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 180ms $ease-out,
    transform 180ms $ease-out;
}

.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(-45deg) scale(0.8);
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 48;
  background: rgba($navy-ink, 0.55);

  @include from('lg') {
    display: none;
  }
}

.backdrop-enter-active {
  transition: opacity 340ms $ease-out;
}

.backdrop-leave-active {
  transition: opacity 420ms $ease-in-out 40ms;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

// El panel se despliega como cortina (clip-path) desde debajo del header y vuelve a recogerse al cerrar:
// nunca desaparece de golpe ni deja el vidrio borroso del header a la vista.
.menu.menu-enter-active {
  transition:
    clip-path 440ms $ease-out,
    transform 440ms $ease-out;

  .menu__inner > * {
    transition:
      opacity 320ms $ease-out,
      transform 320ms $ease-out;
    transition-delay: calc(120ms + var(--i, 0) * 45ms);
  }
}

.menu.menu-leave-active {
  transition:
    clip-path 420ms $ease-in-out 40ms,
    transform 420ms $ease-in-out 40ms;

  // Salida en cascada inversa y corta: los enlaces se van antes de que la cortina termine de subir.
  .menu__inner > * {
    transition:
      opacity 200ms $ease-in-out,
      transform 200ms $ease-in-out;
    transition-delay: calc((8 - var(--i, 0)) * 18ms);
  }
}

// `.menu.` sube la especificidad: si no, la regla base `.menu` (declarada después) pisa el estado inicial.
.menu.menu-enter-from,
.menu.menu-leave-to {
  clip-path: inset(0 0 100% 0);
  transform: translateY(-8px);

  .menu__inner > * {
    opacity: 0;
    transform: translateY(-6px);
  }
}

.menu {
  position: fixed;
  top: calc(var(--header-h) + env(safe-area-inset-top));
  left: 0;
  right: 0;
  z-index: 49;
  max-height: calc(100dvh - var(--header-h) - env(safe-area-inset-top));
  overflow-y: auto;
  overscroll-behavior: contain;
  background: $navy;
  border-bottom: 1px solid $dark-line;
  box-shadow: 0 24px 40px rgba($navy-ink, 0.35);
  clip-path: inset(0 0 0 0);
  color: #fff;

  @include from('lg') {
    display: none;
  }

  &__inner {
    @include container;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-top: 0.5rem;
    padding-bottom: 1.5rem;
  }

  &__link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    padding: 0 0.25rem;
    font-size: $text-lg;
    font-weight: 600;
    border-bottom: 1px solid $dark-line;
    transition: color 0.2s ease;

    &:hover,
    &:active {
      color: $orange;
    }
  }

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__cta {
    margin-top: 1.25rem;
  }


}

@include reduced-motion {
  .menu-enter-active,
  .menu-leave-active,
  .menu-enter-active .menu__inner > *,
  .menu-leave-active .menu__inner > *,
  .backdrop-enter-active,
  .backdrop-leave-active {
    transition-duration: 1ms !important;
    transition-delay: 0ms !important;
  }
}

.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  padding-top: env(safe-area-inset-top);
  background: rgba($navy, 0.92);
  color: #fff;
  backdrop-filter: saturate(1.2) blur(14px);
  -webkit-backdrop-filter: saturate(1.2) blur(14px);
  transition: box-shadow 0.25s ease, background 0.25s ease;

  &--scrolled {
    background: rgba($navy, 0.98);
    box-shadow: 0 1px 0 $dark-line, 0 8px 24px rgba($navy-ink, 0.3);
  }

  &__bar {
    @include container;
    height: var(--header-h);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__brand {
    border-radius: $radius-sm;
  }

  &__nav {
    display: none;
    gap: 0.25rem;

    @include from('lg') {
      display: flex;
    }
  }

  &__link {
    padding: 0.55rem 0.8rem;
    border-radius: $radius-pill;
    font-size: $text-sm;
    font-weight: 600;
    color: $on-dark-soft;

    &:hover {
      color: #fff;
      background: rgba(#fff, 0.08);
    }

    &.router-link-exact-active[href^='/cotizar'] {
      color: $orange;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.2rem;

    @include from('md') {
      gap: 0.4rem;
    }
  }

  &__cta {
    min-height: 40px;
  }

  &__account {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-width: $tap;
    min-height: $tap;
    padding: 0 0.6rem;
    border-radius: $radius-pill;
    font-size: $text-sm;
    font-weight: 600;
    color: #fff;

    &:hover {
      background: rgba(#fff, 0.08);
    }

    &.router-link-active {
      color: $orange;
    }
  }

  // En móvil solo el ícono (con aria-label); el texto aparece desde md.
  &__account-label {
    display: none;

    @include from('md') {
      display: inline;
    }
  }



  &__burger {
    width: $tap;
    height: $tap;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    @include from('lg') {
      display: none;
    }
  }







  &__staff {
    margin-top: 0.75rem;
    text-align: center;
    padding: 0.75rem;
    font-size: $text-sm;
    color: $on-dark-soft;
  }
}
</style>
