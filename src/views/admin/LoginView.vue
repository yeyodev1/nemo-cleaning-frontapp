<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NemoLogo from '@/components/brand/NemoLogo.vue'
import { site } from '@/config/site'
import AppIcon from '@/components/ui/AppIcon.vue'
import CodeLoginForm from '@/components/auth/CodeLoginForm.vue'
import { authService } from '@/services/auth.service'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

// Por defecto con contraseña; el código al correo queda como alternativa.
const mode = ref<'password' | 'code'>('password')
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')

async function submitPassword() {
  error.value = ''
  if (!email.value.trim() || !password.value) {
    error.value = 'Escribe tu correo y tu contraseña'
    return
  }
  busy.value = true
  try {
    await user.loginWithPassword(email.value.trim(), password.value)
    done()
  } catch (e) {
    error.value = (e as { message?: string }).message || 'No se pudo ingresar'
  } finally {
    busy.value = false
  }
}

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
      <NemoLogo variant="dark" :height="230" />
      <p class="login__slogan">{{ site.slogan }}</p>
    </aside>

    <section class="login__panel">
      <div class="login__form">
        <RouterLink to="/" class="login__logo" aria-label="Ir al sitio"><NemoLogo variant="light" :height="72" /></RouterLink>
        <h1>Panel del personal</h1>
        <template v-if="mode === 'password'">
          <p class="login__sub">Ingresa con tu correo y tu contraseña de Nemo Cleaning.</p>
          <form class="login__step" novalidate @submit.prevent="submitPassword">
            <label class="field">
              <span class="field__label">Correo</span>
              <input v-model="email" type="email" inputmode="email" autocomplete="email" placeholder="tu@correo.com" autofocus required />
            </label>
            <label class="field">
              <span class="field__label">Contraseña</span>
              <input v-model="password" type="password" autocomplete="current-password" required />
            </label>
            <p v-if="error" class="login__error" role="alert"><AppIcon name="alert" :size="18" /> {{ error }}</p>
            <button type="submit" class="btn btn--primary btn--lg btn--block" :disabled="busy">
              {{ busy ? 'Ingresando…' : 'Ingresar' }} <AppIcon v-if="!busy" name="arrow-right" />
            </button>
          </form>
          <button type="button" class="login__switch" @click="mode = 'code'">
            <AppIcon name="mail" :size="16" /> Ingresar con un código al correo
          </button>
        </template>
        <template v-else>
          <p class="login__sub">Te enviamos un código de acceso a tu correo de Nemo Cleaning.</p>
          <CodeLoginForm
            :request="request"
            :verify="verify"
            email-hint="Solo las cuentas activas del personal reciben el código."
            @success="done"
          />
          <button type="button" class="login__switch" @click="mode = 'password'">
            <AppIcon name="arrow-left" :size="16" /> Ingresar con contraseña
          </button>
        </template>
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
    justify-content: center;
    align-items: center;
    gap: 2rem;
    @include dark-pattern;
    color: #fff;

    @include from('lg') {
      display: flex;
    }
  }

  &__slogan {
    @include display($display-sm);
    color: #fff;
    text-align: center;
    max-width: 18ch;
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

  &__step {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 0.9rem;
    border-radius: $radius-sm;
    background: $danger-bg;
    color: $danger;
    font-weight: 600;
    font-size: $text-sm;
  }

  &__switch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: $tap;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
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
