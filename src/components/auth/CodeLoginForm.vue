<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import CodeInput from './CodeInput.vue'
import { useCodeLogin } from '@/composables/auth/useCodeLogin'

/** Formulario de acceso en dos pasos (correo → código). El padre pone las llamadas al API. */
const props = defineProps<{
  request: (email: string) => Promise<unknown>
  verify: (email: string, code: string) => Promise<unknown>
  emailHint?: string
}>()
const emit = defineEmits<{ success: [] }>()

const { step, email, code, busy, error, remaining, canResend, sendCode, resend, submitCode, changeEmail } =
  useCodeLogin({ request: props.request, verify: props.verify, onSuccess: () => emit('success') })
</script>

<template>
  <div class="otp">
    <Transition name="fade" mode="out-in">
      <form v-if="step === 'email'" key="email" class="otp__step" novalidate @submit.prevent="sendCode">
        <label class="field">
          <span class="field__label">Correo</span>
          <input
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="tu@correo.com"
            autofocus
            required
          />
          <span v-if="emailHint" class="field__hint">{{ emailHint }}</span>
        </label>
        <p v-if="error" class="otp__error" role="alert"><AppIcon name="alert" :size="18" /> {{ error }}</p>
        <button type="submit" class="btn btn--primary btn--lg btn--block" :disabled="busy">
          {{ busy ? 'Enviando…' : 'Enviarme un código' }} <AppIcon v-if="!busy" name="arrow-right" />
        </button>
      </form>

      <form v-else key="code" class="otp__step" novalidate @submit.prevent="submitCode">
        <p class="otp__sent">
          <AppIcon name="mail" :size="18" />
          <span>Te enviamos un código de 6 dígitos a <strong>{{ email }}</strong>. Vence en 10 minutos.</span>
        </p>
        <CodeInput v-model="code" :disabled="busy" :invalid="Boolean(error)" @complete="submitCode" />
        <p v-if="error" class="otp__error" role="alert"><AppIcon name="alert" :size="18" /> {{ error }}</p>
        <button type="submit" class="btn btn--primary btn--lg btn--block" :disabled="busy || code.length !== 6">
          {{ busy ? 'Verificando…' : 'Ingresar' }}
        </button>
        <div class="otp__links">
          <button type="button" class="otp__link" :disabled="!canResend" @click="resend">
            <AppIcon name="refresh" :size="16" />
            {{ remaining > 0 ? `Reenviar código en ${remaining} s` : 'Reenviar código' }}
          </button>
          <button type="button" class="otp__link" @click="changeEmail">
            <AppIcon name="edit" :size="16" /> Cambiar correo
          </button>
        </div>
        <p class="otp__tip">¿No lo ves? Revisa la carpeta de spam o promociones.</p>
      </form>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.otp {
  &__step {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__sent {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    padding: 0.8rem 0.9rem;
    border-radius: $radius-sm;
    background: $aqua-soft;
    color: $ink-soft;
    font-size: $text-sm;

    svg {
      flex-shrink: 0;
      margin-top: 2px;
      color: $aqua-ink;
    }

    strong {
      color: $ink;
      word-break: break-all;
    }
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

  &__links {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.25rem;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: $tap;
    padding: 0 0.25rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $navy;
    border-radius: $radius-sm;

    &:disabled {
      color: $ink-muted;
      cursor: default;
    }
  }

  &__tip {
    font-size: $text-xs;
    color: $ink-muted;
    text-align: center;
  }
}
</style>
