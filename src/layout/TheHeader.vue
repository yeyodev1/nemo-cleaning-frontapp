<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from '@/components/brand/BrandLogo.vue'
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
  { to: '/#servicios', label: 'Servicios' },
  { to: '/#como-funciona', label: 'Cómo funciona' },
  { to: '/cotizar-oficina', label: 'Oficinas' },
  { to: '/#sucursales', label: 'Sucursales' },
  { to: '/#preguntas', label: 'Preguntas' },
]

const onScroll = () => (scrolled.value = window.scrollY > 8)
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  customer.restore()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
watch(() => route.fullPath, () => (open.value = false))
watch(open, (v) => (document.body.style.overflow = v ? 'hidden' : ''))
</script>

<template>
  <header class="header" :class="{ 'header--scrolled': scrolled || minimal || open }">
    <div class="header__bar">
      <RouterLink to="/" class="header__brand" aria-label="Nemo Cleaning, inicio"><BrandLogo :height="34" /></RouterLink>

      <nav v-if="!minimal" class="header__nav" aria-label="Principal">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="header__link">{{ l.label }}</RouterLink>
      </nav>

      <div class="header__actions">
        <RouterLink v-if="!minimal" :to="account.to" class="header__account" :aria-label="account.label">
          <AppIcon name="user" :size="20" /><span class="header__account-label">{{ account.label }}</span>
        </RouterLink>
        <RouterLink v-if="!minimal" to="/reservar" class="btn btn--primary btn--sm header__cta">Reservar</RouterLink>
        <RouterLink v-else to="/" class="btn btn--ghost btn--sm">
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
          <AppIcon :name="open ? 'x' : 'menu'" :size="22" />
        </button>
      </div>
    </div>

    <Transition name="fade">
      <nav v-if="open" id="menu-movil" class="header__menu" aria-label="Menú móvil">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="header__mlink">
          {{ l.label }} <AppIcon name="chevron-right" :size="18" />
        </RouterLink>
        <RouterLink :to="account.to" class="header__mlink">
          <span class="header__mlabel"><AppIcon name="user" :size="20" /> {{ account.label }}</span>
          <AppIcon name="chevron-right" :size="18" />
        </RouterLink>
        <RouterLink to="/reservar" class="btn btn--primary btn--lg btn--block">Reserva tu limpieza</RouterLink>
        <RouterLink to="/admin/login" class="header__staff">Acceso del personal</RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  padding-top: env(safe-area-inset-top);
  background: rgba(#fff, 0.82);
  backdrop-filter: saturate(1.4) blur(14px);
  -webkit-backdrop-filter: saturate(1.4) blur(14px);
  transition: box-shadow 0.25s ease, background 0.25s ease;

  &--scrolled {
    background: rgba(#fff, 0.96);
    box-shadow: 0 1px 0 $line, 0 8px 24px rgba($navy-ink, 0.05);
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
    color: $ink-soft;

    &:hover {
      color: $navy;
      background: $sky-2;
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
    font-weight: 700;
    color: $navy;

    &:hover {
      background: $sky-2;
    }

    &.router-link-active {
      color: $aqua-ink;
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
    color: $navy;

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
    height: calc(100dvh - var(--header-h));
    overflow-y: auto;

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
    font-weight: 700;
    border-bottom: 1px solid $line;
  }

  .btn--block {
    margin-top: 1.25rem;
  }

  &__staff {
    margin-top: 0.75rem;
    text-align: center;
    padding: 0.75rem;
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
