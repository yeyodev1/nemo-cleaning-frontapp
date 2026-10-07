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

    <!-- Menú móvil: fondo que se desvanece + panel que baja, con los enlaces en cascada. -->
    <!-- Fuera del header: su backdrop-filter haría que "fixed" se posicione contra él. -->
    <Teleport to="body">
      <Transition name="backdrop" :duration="{ enter: 280, leave: 340 }">
        <div v-if="open" class="menu-backdrop" aria-hidden="true" @click="open = false"></div>
      </Transition>
    </Teleport>
    <!-- Duración explícita: Vue debe esperar a la cascada completa al entrar y al fundido al salir. -->
    <Transition name="menu" :duration="{ enter: 640, leave: 340 }">
      <nav v-if="open" id="menu-movil" class="header__menu" aria-label="Menú móvil">
        <RouterLink v-for="(l, i) in links" :key="l.to" :to="l.to" class="header__mlink" :style="{ '--i': i }">
          {{ l.label }} <AppIcon name="chevron-right" :size="18" />
        </RouterLink>
        <RouterLink :to="account.to" class="header__mlink" :style="{ '--i': links.length }">
          <span class="header__mlabel"><AppIcon name="user" :size="20" /> {{ account.label }}</span>
          <AppIcon name="chevron-right" :size="18" />
        </RouterLink>
        <RouterLink to="/reservar" class="btn btn--accent btn--lg btn--block header__mlink-cta" :style="{ '--i': links.length + 1 }">
          Reservar <AppIcon name="arrow-right" />
        </RouterLink>
        <RouterLink to="/admin/login" class="header__staff" :style="{ '--i': links.length + 2 }">Acceso del personal</RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped lang="scss">
// ---- Animación del menú móvil ----
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 140ms $ease-out,
    transform 140ms $ease-out;
}

.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(-45deg) scale(0.8);
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
  background: rgba($navy-ink, 0.55);

  @include from('lg') {
    display: none;
  }
}

.backdrop-enter-active {
  transition: opacity $dur $ease-out;
}

.backdrop-leave-active {
  transition: opacity 320ms $ease-in-out;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity $dur $ease-out,
    transform $dur-slow $ease-out;

  > * {
    transition:
      opacity $dur $ease-out,
      transform $dur $ease-out;
  }
}

// Entrada en cascada (40 ms por enlace).
.menu-enter-active > * {
  transition-delay: calc(80ms + var(--i, 0) * 40ms);
}

// Salida: el recorrido inverso, todo junto y un poco más corto; el panel sube y se desvanece.
.menu-leave-active {
  transition:
    opacity 320ms $ease-in-out,
    transform 320ms $ease-in-out;

  > * {
    transition:
      opacity 240ms $ease-in-out,
      transform 240ms $ease-in-out;
  }
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-16px);

  > * {
    opacity: 0;
    transform: translateY(8px);
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

  &__mlabel {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
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

  &__menu {
    @include container;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-top: 0.5rem;
    padding-bottom: 1.5rem;
    max-height: calc(100dvh - var(--header-h));
    overflow-y: auto;
    background: $navy;
    border-bottom: 1px solid $dark-line;
    box-shadow: 0 24px 40px rgba($navy-ink, 0.35);

    @include from('lg') {
      display: none;
    }
  }

  &__mlink {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    padding: 0 0.25rem;
    font-size: $text-lg;
    font-weight: 600;
    border-bottom: 1px solid $dark-line;
  }

  .btn--block {
    margin-top: 1.25rem;
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
