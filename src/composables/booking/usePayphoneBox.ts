import { nextTick, onBeforeUnmount, ref } from 'vue'
import { publicService } from '@/services/public.service'
import { errorMessage } from '@/utils/format'
import type { PayphoneInit } from '@/types/api'
import { savePayIntent } from './payIntent'

/**
 * Cajita de Pagos de Payphone (v2.0). Los recursos se cargan una sola vez y
 * solo cuando el cliente va a pagar. El formulario vence a los 10 min: entonces
 * se pide un intento nuevo (otro clientTransactionId) al backend.
 */
const CSS = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css'
const JS = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js'
const TTL_MS = 10 * 60 * 1000

let loader: Promise<void> | null = null

type BoxCtor = new (config: Record<string, unknown>) => { render(containerId: string): void }

function boxCtor(): BoxCtor {
  const ctor = (window as unknown as { PPaymentButtonBox?: BoxCtor }).PPaymentButtonBox
  if (!ctor) throw new Error('No se pudo cargar el formulario de pago')
  return ctor
}

export function loadPayphone(): Promise<void> {
  if (loader) return loader
  loader = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = CSS
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.type = 'module'
    script.src = JS
    script.onload = () => resolve()
    script.onerror = () => {
      script.remove()
      loader = null
      reject(new Error('No se pudo cargar el formulario de pago'))
    }
    document.head.appendChild(script)
  })
  return loader
}

export type BoxStatus = 'idle' | 'loading' | 'ready' | 'error' | 'expired'

export function usePayphoneBox(containerId = 'pp-button') {
  const status = ref<BoxStatus>('idle')
  const error = ref('')
  const amount = ref(0)
  const remaining = ref(0)
  let deadline = 0
  let tick: ReturnType<typeof setInterval> | undefined

  function clearBox() {
    const el = document.getElementById(containerId)
    if (el) el.innerHTML = ''
  }

  function startTimer() {
    clearInterval(tick)
    deadline = Date.now() + TTL_MS
    remaining.value = TTL_MS
    tick = setInterval(() => {
      remaining.value = Math.max(0, deadline - Date.now())
      if (remaining.value === 0) expire()
    }, 1000)
  }

  async function render(init: PayphoneInit, code: string, token: string) {
    status.value = 'loading'
    error.value = ''
    try {
      await loadPayphone()
      amount.value = init.amount
      savePayIntent({ code, token, clientTransactionId: init.clientTransactionId })
      status.value = 'ready'
      await nextTick()
      clearBox()
      const Box = boxCtor()
      new Box({ ...init, lang: 'es', defaultMethod: 'card', timeZone: -5 }).render(containerId)
      startTimer()
    } catch (e) {
      status.value = 'error'
      error.value = errorMessage(e, 'No se pudo cargar el formulario de pago')
    }
  }

  /** Pide un cobro nuevo al backend (el anterior venció o falló). */
  async function restart(code: string, token: string) {
    status.value = 'loading'
    error.value = ''
    try {
      const init = await publicService.restartPayphone(code, token)
      await render(init, code, token)
    } catch (e) {
      status.value = 'error'
      error.value = errorMessage(e, 'No se pudo iniciar el pago con tarjeta')
    }
  }

  function expire() {
    clearInterval(tick)
    status.value = 'expired'
    clearBox()
  }

  onBeforeUnmount(() => clearInterval(tick))

  return { status, error, amount, remaining, render, restart, expire }
}
