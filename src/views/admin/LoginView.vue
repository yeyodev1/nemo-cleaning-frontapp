<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/brand/BrandLogo.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUserStore } from '@/stores/user'
import { errorMessage } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const email = ref('')
const password = ref('')
const show = ref(false)
const busy = ref(false)
const error = ref('')

async function submit() {
  if (!email.value || !password.value) {
    error.value = 'Ingresa tu correo y contraseña'
    return
  }
  busy.value = true
  error.value = ''
  try {
    await user.login(email.value.trim(), password.value)
    const next = typeof route.query.next === 'string' && route.query.next.startsWith('/admin') ? route.query.next : user.home
    router.replace(next)
  } catch (e) {
    error.value = errorMessage(e, 'No se pudo iniciar sesión')
  } finally {
    busy.value = false
  }
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
      <form class="login__form" novalidate @submit.prevent="submit">
        <RouterLink to="/" class="login__logo"><BrandLogo :height="38" /></RouterLink>
        <h1>Panel del personal</h1>
        <p class="login__sub">Ingresa con tu cuenta de Nemo Cleaning.</p>

        <label class="field">
          <span class="field__label">Correo</span>
          <input v-model="email" type="email" autocomplete="username" inputmode="email" required />
        </label>
        <label class="field">
          <span class="field__label">Contraseña</span>
          <span class="login__pass">
            <input v-model="password" :type="show ? 'text' : 'password'" autocomplete="current-password" required />
            <button type="button" class="login__eye" :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="show" @click="show = !show">
              <AppIcon :name="show ? 'ban' : 'eye'" :size="18" />
            </button>
          </span>
        </label>

        <p v-if="error" class="login__error" role="alert"><AppIcon name="alert" :size="18" /> {{ error }}</p>

        <button type="submit" class="btn btn--primary btn--lg btn--block" :disabled="busy">
          {{ busy ? 'Ingresando…' : 'Ingresar' }}
        </button>
        <RouterLink to="/" class="login__back"><AppIcon name="arrow-left" :size="16" /> Volver al sitio</RouterLink>
      </form>
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

  &__pass {
    position: relative;
    display: block;

    input {
      padding-right: 3.2rem;
    }
  }

  &__eye {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: $tap;
    height: $tap;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: $ink-muted;
    border-radius: $radius-sm;
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
