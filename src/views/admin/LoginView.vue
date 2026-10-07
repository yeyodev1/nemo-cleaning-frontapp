<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/brand/BrandLogo.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CodeLoginForm from '@/components/auth/CodeLoginForm.vue'
import { authService } from '@/services/auth.service'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

// Sin contraseñas: el personal ingresa con un código que llega a su correo.
const request = (email: string) => authService.requestCode(email)
const verify = (email: string, code: string) => user.verifyCode(email, code)

function done() {
  const next = typeof route.query.next === 'string' && route.query.next.startsWith('/admin') ? route.query.next : user.home
  router.replace(next)
}
</script>

<template>
  <div class="login">
    <aside class="login__art" aria-hidden="true">
      <BrandLogo light :height="40" />
      <div class="login__pitch">
        <h2>Tu operación de limpieza, en orden.</h2>
        <p>Agenda por sucursal, pagos conciliados y el equipo en la calle, desde cualquier celular.</p>
      </div>
      <span class="login__bubble login__bubble--a"></span>
      <span class="login__bubble login__bubble--b"></span>
    </aside>

    <section class="login__panel">
      <div class="login__form">
        <RouterLink to="/" class="login__logo"><BrandLogo :height="38" /></RouterLink>
        <h1>Panel del personal</h1>
        <p class="login__sub">Ingresa con tu correo de Nemo Cleaning: te enviamos un código de acceso.</p>
        <CodeLoginForm
          :request="request"
          :verify="verify"
          email-hint="Solo las cuentas activas del personal reciben el código."
          @success="done"
        />
        <RouterLink to="/" class="login__back"><AppIcon name="arrow-left" :size="16" /> Volver al sitio</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.login {
  min-height: 100dvh;
  display: flex;
  background: $paper;

  &__art {
    display: none;
    position: relative;
    overflow: hidden;
    flex: 1 1 50%;
    padding: 3rem;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(150deg, $navy-deep, $navy 60%, $aqua-deep);
    color: #fff;

    @include from('lg') {
      display: flex;
    }
  }

  &__pitch {
    position: relative;
    z-index: 1;
    max-width: 30rem;

    h2 {
      color: #fff;
      @include display($display-sm);
    }

    p {
      margin-top: 1rem;
      color: $on-dark-soft;
    }
  }

  &__bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba($aqua, 0.18);

    &--a {
      width: 420px;
      height: 420px;
      right: -120px;
      top: -100px;
    }

    &--b {
      width: 240px;
      height: 240px;
      right: 18%;
      bottom: -80px;
      background: rgba(#fff, 0.08);
    }
  }

  &__panel {
    flex: 1 1 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  &__form {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h1 {
      font-size: $display-sm;
      margin-top: 1rem;
    }
  }

  &__logo {
    align-self: flex-start;

    @include from('lg') {
      display: none;
    }
  }

  &__sub {
    color: $ink-muted;
    margin-top: -0.5rem;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: $tap;
    color: $ink-muted;
    font-size: $text-sm;
    font-weight: 600;
  }
}
</style>
