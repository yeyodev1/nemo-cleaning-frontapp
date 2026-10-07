<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ProfileForm from '@/components/account/ProfileForm.vue'
import MyBookings from '@/components/account/MyBookings.vue'
import { useCustomerStore } from '@/stores/customer'
import { useToastStore } from '@/stores/toast'

/** /mi-cuenta: datos del cliente, sus pedidos y cerrar sesión. */
const router = useRouter()
const customer = useCustomerStore()
const toast = useToastStore()

function logout() {
  customer.clear()
  toast.info('Cerraste sesión')
  router.replace('/')
}
</script>

<template>
  <section class="me">
    <header class="me__head">
      <div>
        <p class="me__eyebrow">Mi cuenta</p>
        <h1 class="me__title">{{ customer.firstName ? `Hola, ${customer.firstName}` : 'Hola' }}</h1>
        <p class="muted me__email">{{ customer.customer?.email }}</p>
      </div>
      <RouterLink to="/reservar" class="btn btn--primary me__cta"><AppIcon name="plus" /> Nueva reserva</RouterLink>
    </header>

    <p v-if="customer.customer && !customer.customer.name" class="me__nudge">
      <AppIcon name="info" :size="18" /> Completa tu nombre y celular para reservar más rápido.
    </p>

    <div class="me__grid">
      <MyBookings class="me__bookings" />
      <aside class="me__side">
        <ProfileForm />
        <button type="button" class="btn btn--ghost btn--block" @click="logout">
          <AppIcon name="logout" /> Cerrar sesión
        </button>
      </aside>
    </div>
  </section>
</template>

<style scoped lang="scss">
.me {
  @include container(1080px);
  padding-top: 1.5rem;
  padding-bottom: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__head {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include from('md') {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
    }
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm);
  }

  &__email {
    font-size: $text-sm;
    word-break: break-all;
  }

  &__cta {
    align-self: stretch;

    @include from('md') {
      align-self: auto;
    }
  }

  &__nudge {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.75rem 0.9rem;
    border-radius: $radius-sm;
    background: $warning-bg;
    color: $warning;
    font-weight: 600;
    font-size: $text-sm;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__bookings {
    flex: 1;
    min-width: 0;
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    @include from('lg') {
      width: 380px;
      flex-shrink: 0;
    }
  }
}
</style>
