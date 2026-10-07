import { computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { draft } from './useBookingDraft'
import { parseKey } from './cart'

export const STEPS = [
  { title: '¿Qué sucursal te atiende?', short: 'Sucursal' },
  { title: '¿Qué limpiamos?', short: 'Servicios' },
  { title: 'Elige fecha y hora', short: 'Horario' },
  { title: '¿Dónde y a quién atendemos?', short: 'Datos' },
  { title: 'Revisa y elige cómo pagar', short: 'Pago' },
] as const

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Mensaje de error del paso, o '' si está completo. */
export function useStepValidation() {
  const catalog = useCatalogStore()

  function validate(step: number): string {
    if (step === 1 && !draft.branch) return 'Elige la sucursal más cercana a ti.'
    if (step === 2) {
      // Las claves del carrito pueden ser "id::opción": se compara por el id del servicio.
      const hasMain = Object.entries(draft.cart).some(([key, q]) => {
        const s = catalog.byId(parseKey(key).service)
        return q > 0 && s && !s.isExtra
      })
      if (!hasMain) return 'Agrega al menos un servicio (los adicionales van junto a un servicio).'
    }
    if (step === 3) {
      if (!draft.date) return 'Elige el día de tu limpieza.'
      if (!draft.time) return 'Elige una hora disponible.'
    }
    if (step === 4) {
      const c = draft.customer
      if (c.name.trim().length < 3) return 'Escribe tu nombre completo.'
      if (!EMAIL.test(c.email.trim())) return 'Revisa tu correo electrónico.'
      if (c.phone.replace(/\D/g, '').length < 9)
        return 'Escribe un celular válido (ej. 0991234567).'
      if ((catalog.branchById(draft.branch)?.zones?.length ?? 0) > 0 && !draft.zone.trim())
        return 'Elige tu urbanización (o escríbela en "Otra").'
      if (draft.address.trim().length < 5) return 'Escribe la dirección donde haremos la limpieza.'
      if (draft.invoice.required) {
        const i = draft.invoice
        if (!i.name.trim() || !i.documentId.trim())
          return 'Completa el nombre y la cédula/RUC de la factura.'
        if (!EMAIL.test(i.email.trim())) return 'Revisa el correo para la factura.'
      }
    }
    if (step === 5) {
      if (!draft.paymentMethod) return 'Elige cómo quieres pagar.'
      if (draft.paymentMethod === 'card' && !catalog.settings?.payphoneEnabled)
        return 'El pago con tarjeta no está disponible ahora.'
      if (draft.paymentMethod === 'transfer' && !draft.transferProofUrl)
        return 'Sube el comprobante de la transferencia para confirmar.'
    }
    return ''
  }

  /** Primer paso incompleto (para no saltar pasos con ?paso=). */
  function firstInvalid(): number {
    for (let s = 1; s <= STEPS.length; s++) if (validate(s)) return s
    return STEPS.length
  }

  const canSubmit = computed(() => [1, 2, 3, 4, 5].every((s) => !validate(s)))

  return { validate, firstInvalid, canSubmit }
}
