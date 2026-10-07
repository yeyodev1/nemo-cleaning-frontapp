<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import CodeLoginForm from '@/components/auth/CodeLoginForm.vue'
import { customerService } from '@/services/customer.service'
import { useCustomerStore } from '@/stores/customer'
import type { IconName } from '@/components/ui/icons'

/** /ingresar: clientes entran (o recuperan el acceso) con su correo y un código. */
const route = useRoute()
const router = useRouter()
const customer = useCustomerStore()

const request = (email: string) => customerService.requestCode(email)
const verify = (email: string, code: string) => customer.verifyCode(email, code)

function done() {
  const next = typeof route.query.next === 'string' ? route.query.next : ''
  // Solo rutas internas del sitio público: nada de //dominio ni del panel.
  const safe = next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/admin')
  router.replace(safe ? next : '/mi-cuenta')
}

const perks: { icon: IconName; text: string }[] = [
  { icon: 'list', text: 'Mira tus pedidos, su estado y lo que falta por pagar.' },
  { icon: 'sparkles', text: 'Reserva más rápido: tus datos se llenan solos.' },
  { icon: 'lock', text: 'Sin contraseñas: te enviamos un código cada vez.' },
]
</script>

<template>
  <section class="enter">
    <div class="enter__card">
      <span class="enter__badge" aria-hidden="true"><AppIcon name="user" :size="26" /></span>
      <h1 class="enter__title">Ingresa a tu cuenta</h1>
      <p class="enter__sub">Escribe el correo con el que reservas. Si es tu primera vez, tu cuenta se crea sola.</p>
      <CodeLoginForm :request="request" :verify="verify" @success="done" />
      <ul class="enter__perks">
        <li v-for="p in perks" :key="p.text"><AppIcon :name="p.icon" :size="18" /> {{ p.text }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.enter {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem 3rem;
  background: linear-gradient(180deg, $sky, $paper 60%);

  @include from('md') {
    align-items: center;
    padding-top: 3rem;
  }

  &__card {
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include from('md') {
      @include card(2rem);
      box-shadow: $shadow-md;
    }
  }

  &__badge {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: $navy-soft;
    color: $navy;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    @include display($display-sm);
  }

  &__sub {
    color: $ink-soft;
    font-size: $text-sm;
    margin-top: -0.4rem;
  }

  &__perks {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid $line;
    font-size: $text-sm;
    color: $ink-soft;

    li {
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
    }

    svg {
      flex-shrink: 0;
      color: $aqua-ink;
      margin-top: 2px;
    }
  }
}
</style>
