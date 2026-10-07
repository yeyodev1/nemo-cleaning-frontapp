import { computed, ref } from 'vue'
import { operationService } from '@/services/operation.service'
import { managementService } from '@/services/management.service'
import type { Service } from '@/types/api'
import type { ProductionOptions } from '@/types/operation'
import type { WaPaymentInput } from '@/types/whatsapp'

// Cache de módulo: la bandeja y el pedido rápido usan las mismas opciones (cuentas, sucursales, operadores).
const options = ref<ProductionOptions | null>(null)
const services = ref<Service[]>([])
let loading: Promise<void> | null = null

/** Estado del bloque "Pago" (forma de pago con cuenta + si ya pagó). '' = por coordinar. */
export interface WaPayState {
  account: string
  paid: boolean
  amount: number
  reference: string
  proofUrl: string
}

export function emptyPay(account = ''): WaPayState {
  return { account, paid: false, amount: 0, reference: '', proofUrl: '' }
}

export function useWaOptions() {
  function load() {
    loading ??= Promise.all([operationService.productionOptions(), managementService.services()])
      .then(([o, s]) => {
        options.value = o
        services.value = s.filter((x) => x.active !== false).sort((a, b) => a.order - b.order)
      })
      .catch((e) => {
        loading = null
        throw e
      })
    return loading
  }

  /** La cuenta registra cobro (efectivo, transferencia o tarjeta); canje/cortesía/plan no. */
  function chargeable(account: string): boolean {
    return Boolean(options.value?.accounts.find((a) => a.label === account)?.method)
  }

  /** Lo que se manda al API como `payment` (solo si ya pagó y la cuenta cobra). */
  function paymentPayload(p: WaPayState): WaPaymentInput | undefined {
    if (!p.paid || !chargeable(p.account)) return undefined
    return {
      amount: p.amount > 0 ? p.amount : undefined,
      reference: p.reference.trim() || undefined,
      proofUrl: p.proofUrl || undefined,
    }
  }

  const operatorsOf = (branch: string) =>
    (options.value?.operators || []).filter((o) => !branch || o.branches.includes(branch))

  return {
    options,
    services,
    load,
    chargeable,
    paymentPayload,
    operatorsOf,
    accounts: computed(() => options.value?.accounts || []),
    branches: computed(() => options.value?.branches || []),
  }
}
