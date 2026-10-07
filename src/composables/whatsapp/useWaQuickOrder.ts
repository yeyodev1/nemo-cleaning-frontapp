import { computed, reactive, ref, watch } from 'vue'
import { whatsappService } from '@/services/whatsapp.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { useWhatsappInbox } from '@/stores/whatsappInbox'
import { addDays, errorMessage, todayISO } from '@/utils/format'
import { emptyPay, useWaOptions } from './useWaOptions'
import type { Service } from '@/types/api'
import type { EntryLine } from '@/composables/operation/useQuickEntry'
import type { WaCustomerMatch, WaOrder } from '@/types/whatsapp'

function blank(branch: string) {
  return {
    phone: '',
    customerId: '',
    name: '',
    branch,
    date: addDays(todayISO(), 1),
    time: '09:00',
    zone: '',
    otherZone: false,
    address: '',
    reference: '',
    lines: [] as EntryLine[],
    status: 'confirmed' as 'confirmed' | 'pending',
    notes: '',
  }
}

/**
 * Pedido rápido de un cliente que escribió directo al WhatsApp. Empieza por el teléfono: si ya
 * es cliente se llenan nombre y los datos de su último pedido; lo demás se elige con toques.
 */
export function useWaQuickOrder() {
  const scope = useAdminScope()
  const toast = useToastStore()
  const inbox = useWhatsappInbox()
  const wa = useWaOptions()
  const form = reactive(blank(scope.branch))
  const pay = ref(emptyPay())
  const match = ref<WaCustomerMatch | null>(null)
  const looking = ref(false)
  const busy = ref(false)
  const saved = ref<WaOrder | null>(null)
  const savedPaid = ref(false)
  let nextKey = 1
  let timer: ReturnType<typeof setTimeout> | undefined
  // Lo que llenó la búsqueda: si el asesor cambia el número, se limpia solo eso.
  let autoName = ''

  wa.load()
    .then(() => {
      if (!wa.branches.value.some((b) => b._id === form.branch)) form.branch = wa.branches.value[0]?._id || ''
    })
    .catch((e) => toast.error(errorMessage(e)))

  const zones = computed(() => wa.branches.value.find((b) => b._id === form.branch)?.zones || [])
  const total = computed(() => form.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0))

  function applyMatch(m: WaCustomerMatch) {
    match.value = m
    if (!m.customer) {
      form.customerId = ''
      if (form.name === autoName) form.name = ''
      autoName = ''
      return
    }
    form.customerId = m.customer._id
    if (!form.name || form.name === autoName) form.name = autoName = m.customer.name
    const last = m.last
    if (last && wa.branches.value.some((b) => b._id === last.branch)) form.branch = last.branch
    if (!form.address) form.address = last?.address || m.customer.address || ''
    if (!form.reference && last?.reference) form.reference = last.reference
    if (!form.zone && last?.zone) {
      form.zone = last.zone
      form.otherZone = !zones.value.includes(last.zone)
    }
  }

  watch(
    () => form.phone,
    (phone) => {
      clearTimeout(timer)
      const digits = phone.replace(/\D/g, '')
      if (digits.length < 9) {
        if (match.value) applyMatch({ customer: null, last: null, others: 0 })
        match.value = null
        return
      }
      timer = setTimeout(async () => {
        looking.value = true
        try {
          applyMatch(await whatsappService.customerByPhone(phone))
        } catch {
          match.value = null
        } finally {
          looking.value = false
        }
      }, 350)
    },
  )

  function addService(service: Service, variant?: string) {
    const v = service.variants?.find((x) => x.label === variant)
    const same = form.lines.find((l) => l.service?._id === service._id && l.variant === (variant || ''))
    if (same) return void same.quantity++
    form.lines.push({ key: nextKey++, service, variant: variant || '', name: service.name, unitPrice: v?.price ?? service.price, quantity: 1 })
  }
  function addFree(name: string, amount: number) {
    form.lines.push({ key: nextKey++, name: name || 'Servicio', unitPrice: amount, quantity: 1 })
  }
  function removeLine(key: number) {
    form.lines = form.lines.filter((l) => l.key !== key)
  }

  function validate(): string {
    if (form.phone.replace(/\D/g, '').length < 9) return 'Escribe el WhatsApp del cliente (ej. 0991234567)'
    if (form.name.trim().length < 2) return 'Escribe el nombre del cliente'
    if (!form.lines.length) return 'Agrega al menos un servicio'
    if (!form.branch) return 'Elige la sucursal'
    if (!form.date || !form.time) return 'Elige la fecha y la hora'
    return ''
  }

  async function submit() {
    const err = validate()
    if (err) return toast.error(err)
    busy.value = true
    try {
      const payment = wa.paymentPayload(pay.value)
      const order = await whatsappService.createOrder({
        branch: form.branch,
        customer: { ...(form.customerId ? { _id: form.customerId } : {}), name: form.name.trim(), phone: form.phone.trim() },
        items: form.lines.map((l) =>
          l.service
            ? { service: l.service._id, variant: l.variant || undefined, quantity: l.quantity }
            : { name: l.name, unitPrice: l.unitPrice, quantity: l.quantity },
        ),
        date: form.date,
        time: form.time,
        zone: form.zone.trim() || undefined,
        address: form.address.trim() || undefined,
        reference: form.reference.trim() || undefined,
        notes: form.notes.trim() || undefined,
        status: form.status,
        paymentAccount: pay.value.account,
        payment,
      })
      saved.value = order
      savedPaid.value = Boolean(payment)
      toast.success(`${order.code} guardado`)
      inbox.refresh()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      busy.value = false
    }
  }

  /** "Nuevo pedido": deja la sucursal y limpia lo demás. */
  function reset() {
    Object.assign(form, blank(form.branch))
    pay.value = emptyPay()
    match.value = null
    autoName = ''
    saved.value = null
  }

  return { wa, form, pay, match, looking, busy, saved, savedPaid, zones, total, addService, addFree, removeLine, submit, reset }
}
