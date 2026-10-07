import { computed, onBeforeUnmount, ref } from 'vue'
import { errorMessage } from '@/utils/format'

const COOLDOWN_S = 60
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface CodeLoginApi {
  request: (email: string) => Promise<unknown>
  verify: (email: string, code: string) => Promise<unknown>
  onSuccess: () => void
}

const statusOf = (e: unknown) => (e as { status?: number }).status

/**
 * Acceso sin contraseña en dos pasos (correo → código de 6 dígitos). Lo usan
 * /ingresar (clientes) y /admin/login (personal); solo cambian las llamadas.
 */
export function useCodeLogin(api: CodeLoginApi) {
  const step = ref<'email' | 'code'>('email')
  const email = ref('')
  const code = ref('')
  const busy = ref(false)
  const error = ref('')
  const remaining = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined

  const normalized = computed(() => email.value.trim().toLowerCase())
  const canResend = computed(() => remaining.value === 0 && !busy.value)

  function startCooldown(seconds = COOLDOWN_S) {
    clearInterval(timer)
    remaining.value = seconds
    timer = setInterval(() => {
      remaining.value = Math.max(0, remaining.value - 1)
      if (remaining.value === 0) clearInterval(timer)
    }, 1000)
  }

  async function sendCode() {
    error.value = ''
    if (!EMAIL_RE.test(normalized.value)) {
      error.value = 'Escribe un correo válido'
      return
    }
    busy.value = true
    try {
      await api.request(normalized.value)
      email.value = normalized.value
      code.value = ''
      step.value = 'code'
      startCooldown()
    } catch (e) {
      if (statusOf(e) === 429) {
        // Ya hay un código reciente: el back dice cuántos segundos faltan.
        const match = /(\d+)\s*segundos/.exec(errorMessage(e, ''))
        startCooldown(match ? Number(match[1]) : COOLDOWN_S)
        if (step.value === 'email') {
          email.value = normalized.value
          step.value = 'code'
          return
        }
      }
      error.value = errorMessage(e, 'No pudimos enviar el código')
    } finally {
      busy.value = false
    }
  }

  async function resend() {
    if (canResend.value) await sendCode()
  }

  async function submitCode() {
    error.value = ''
    if (!/^\d{6}$/.test(code.value)) {
      error.value = 'Escribe los 6 dígitos del código'
      return
    }
    busy.value = true
    try {
      await api.verify(normalized.value, code.value)
      api.onSuccess()
    } catch (e) {
      error.value = errorMessage(e, 'No pudimos verificar el código')
      code.value = ''
    } finally {
      busy.value = false
    }
  }

  function changeEmail() {
    step.value = 'email'
    code.value = ''
    error.value = ''
  }

  onBeforeUnmount(() => clearInterval(timer))

  return { step, email, code, busy, error, remaining, canResend, sendCode, resend, submitCode, changeEmail }
}
