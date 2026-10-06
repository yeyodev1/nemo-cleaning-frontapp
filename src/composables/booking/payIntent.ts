import { PAY_INTENT_KEY } from '@/config/site'

/** Datos para volver al pedido después de Payphone (sessionStorage). */
export interface PayIntent {
  code: string
  token: string
  clientTransactionId: string
}

export function savePayIntent(intent: PayIntent) {
  try {
    sessionStorage.setItem(PAY_INTENT_KEY, JSON.stringify(intent))
  } catch {
    /* sin storage: la respuesta de Payphone trae el pedido igual */
  }
}

export function readPayIntent(): PayIntent | null {
  try {
    return JSON.parse(sessionStorage.getItem(PAY_INTENT_KEY) || 'null') as PayIntent | null
  } catch {
    return null
  }
}
